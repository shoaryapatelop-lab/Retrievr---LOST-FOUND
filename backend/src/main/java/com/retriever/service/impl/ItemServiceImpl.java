package com.retriever.service.impl;

import com.retriever.dto.ItemRequest;
import com.retriever.dto.ItemResponse;
import com.retriever.entity.*;
import com.retriever.mapper.ItemMapper;
import com.retriever.repository.*;
import com.retriever.service.ItemService;
import com.retriever.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ItemMapper itemMapper;
    private final MatchService matchService;

    @Override
    @Transactional
    public ItemResponse reportLostItem(ItemRequest request, Long reporterId) {
        User reporter = getReporter(reporterId);
        LostItem item = new LostItem();
        applyCommon(item, request, reporter);
        item.setLastSeenLocation(trimToNull(request.getLastSeenLocation()));
        LostItem saved = lostItemRepository.save(item);
        safeTriggerMatch(saved.getId());
        return itemMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ItemResponse reportFoundItem(ItemRequest request, Long reporterId) {
        User reporter = getReporter(reporterId);
        FoundItem item = new FoundItem();
        applyCommon(item, request, reporter);
        FoundItem saved = foundItemRepository.save(item);
        safeTriggerMatch(saved.getId());
        return itemMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Item not found"));
        return itemMapper.toResponse(item);
    }

    @Override
    @Transactional
    public ItemResponse updateItem(Long itemId, ItemRequest request, Long requesterId, boolean isAdmin) {
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (!isAdmin && (item.getReporter() == null || !Objects.equals(item.getReporter().getId(), requesterId))) {
            throw new SecurityException("You are not allowed to modify this item");
        }
        if (StringUtils.hasText(request.getTitle())) item.setTitle(request.getTitle().trim());
        if (StringUtils.hasText(request.getDescription())) item.setDescription(request.getDescription().trim());
        if (StringUtils.hasText(request.getLocationFound())) item.setLocationFound(request.getLocationFound().trim());
        if (request.getDateFound() != null) item.setDateFound(request.getDateFound());
        if (request.getColor() != null) item.setColor(trimToNull(request.getColor()));
        if (request.getBrand() != null) item.setBrand(trimToNull(request.getBrand()));
        if (request.getContactInfo() != null) item.setContactInfo(trimToNull(request.getContactInfo()));
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId()).ifPresent(item::setCategory);
        }
        if (item instanceof LostItem lost) {
            if (request.getLastSeenLocation() != null) lost.setLastSeenLocation(trimToNull(request.getLastSeenLocation()));
        }
        Item saved = itemRepository.save(item);
        return itemMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId, Long requesterId, boolean isAdmin) {
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (!isAdmin && (item.getReporter() == null || !Objects.equals(item.getReporter().getId(), requesterId))) {
            throw new SecurityException("You are not allowed to delete this item");
        }
        itemRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> searchItems(String keyword, String category, String location, String color, String brand, String status, String sortBy, Pageable pageable) {
        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like),
                        cb.like(cb.lower(root.get("brand")), like),
                        cb.like(cb.lower(root.get("color")), like)
                ));
            }
            if (StringUtils.hasText(category)) {
                Join<Item, Category> catJoin = root.join("category", JoinType.LEFT);
                try {
                    Long catId = Long.parseLong(category.trim());
                    predicates.add(cb.equal(catJoin.get("id"), catId));
                } catch (NumberFormatException ignored) {
                    predicates.add(cb.equal(cb.lower(catJoin.get("name")), category.trim().toLowerCase(Locale.ROOT)));
                }
            }
            if (StringUtils.hasText(location)) {
                String like = "%" + location.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.like(cb.lower(root.get("locationFound")), like));
            }
            if (StringUtils.hasText(color)) {
                predicates.add(cb.like(cb.lower(root.get("color")), "%" + color.trim().toLowerCase(Locale.ROOT) + "%"));
            }
            if (StringUtils.hasText(brand)) {
                predicates.add(cb.like(cb.lower(root.get("brand")), "%" + brand.trim().toLowerCase(Locale.ROOT) + "%"));
            }
            if (StringUtils.hasText(status)) {
                try {
                    ItemStatus st = ItemStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
                    predicates.add(cb.equal(root.get("status"), st));
                } catch (Exception ignored) {
                    // ignore unknown status filter
                }
            }
            // support type filtering via special keyword convention not needed; frontend filters client-side for recent
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable effective = pageable == null ? PageRequest.of(0, 12) : pageable;
        Sort sort = resolveSort(sortBy, effective.getSort());
        effective = PageRequest.of(effective.getPageNumber(), Math.min(effective.getPageSize(), 50), sort);
        return itemRepository.findAll(spec, effective).map(itemMapper::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public List<ItemResponse> getRecentlyReportedItems(int limit) { return recent(itemRepository.findAll(), limit); }
    @Override @Transactional(readOnly = true)
    public List<ItemResponse> getRecentlyFoundItems(int limit) { return recent(foundItemRepository.findAll().stream().map(i -> (Item)i).toList(), limit); }
    @Override @Transactional(readOnly = true)
    public List<ItemResponse> getRecentlyLostItems(int limit) { return recent(lostItemRepository.findAll().stream().map(i -> (Item)i).toList(), limit); }
    @Override @Transactional(readOnly = true)
    public List<ItemResponse> getItemsByReporter(Long reporterId) { return itemRepository.findByReporterId(reporterId).stream().map(itemMapper::toResponse).toList(); }
    @Override @Transactional(readOnly = true)
    public List<ItemResponse> getLostItemsByReporter(Long reporterId) { return lostItemRepository.findByReporterId(reporterId).stream().map(itemMapper::toResponse).toList(); }
    @Override @Transactional(readOnly = true)
    public List<ItemResponse> getFoundItemsByReporter(Long reporterId) { return foundItemRepository.findByReporterId(reporterId).stream().map(itemMapper::toResponse).toList(); }

    @Override
    public void triggerMatching(Long itemId) { safeTriggerMatch(itemId); }

    private void safeTriggerMatch(Long itemId) {
        try {
            if (itemId == null) return;
            Item item = itemRepository.findById(itemId).orElse(null);
            if (item != null) matchService.findMatches(item);
        } catch (Exception e) {
            log.warn("Matching trigger failed for item {}", itemId, e);
        }
    }

    private User getReporter(Long reporterId) {
        return userRepository.findById(reporterId).orElseThrow(() -> new IllegalArgumentException("Reporter not found"));
    }

    private void applyCommon(Item item, ItemRequest request, User reporter) {
        if (request == null) throw new IllegalArgumentException("Item data is required");
        item.setTitle(requireText(request.getTitle(), "Title is required"));
        item.setDescription(requireText(request.getDescription(), "Description is required"));
        item.setLocationFound(requireText(request.getLocationFound(), "Location is required"));
        item.setDateFound(request.getDateFound() != null ? request.getDateFound() : LocalDateTime.now());
        item.setStatus(ItemStatus.AVAILABLE);
        item.setColor(trimToNull(request.getColor()));
        item.setBrand(trimToNull(request.getBrand()));
        item.setContactInfo(trimToNull(request.getContactInfo()));
        item.setReporter(reporter);
        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            item.setCategory(cat);
        } else {
            throw new IllegalArgumentException("Category is required");
        }
    }

    private List<ItemResponse> recent(List<Item> items, int limit) {
        return items.stream()
                .sorted(Comparator.comparing(Item::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(Math.max(1, Math.min(limit, 50)))
                .map(itemMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Sort resolveSort(String sortBy, Sort pageableSort) {
        if (pageableSort != null && pageableSort.isSorted()) return pageableSort;
        String key = StringUtils.hasText(sortBy) ? sortBy.trim() : "createdAt";
        String prop = switch (key) {
            case "dateFound", "date_found" -> "dateFound";
            case "title" -> "title";
            case "status" -> "status";
            default -> "createdAt";
        };
        Sort.Direction dir = prop.equals("title") ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, prop);
    }

    private String requireText(String v, String msg) {
        if (!StringUtils.hasText(v)) throw new IllegalArgumentException(msg);
        return v.trim();
    }
    private String trimToNull(String v) { return StringUtils.hasText(v) ? v.trim() : null; }
}