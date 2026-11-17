package com.retriever.service.impl;

import com.retriever.config.MatchingProperties;
import com.retriever.dto.MatchResponse;
import com.retriever.entity.*;
import com.retriever.mapper.MatchMapper;
import com.retriever.repository.*;
import com.retriever.service.MatchService;
import com.retriever.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final ItemMatchRepository itemMatchRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ItemRepository itemRepository;
    private final NotificationService notificationService;
    private final MatchMapper matchMapper;
    private final MatchingProperties matchingProperties;

    @Override
    @Async
    @Transactional
    public List<MatchResponse> findMatches(Item newItem) {
        if (newItem == null || newItem.getId() == null) return List.of();
        boolean isLost = newItem instanceof LostItem;
        List<Item> candidates = isLost
                ? foundItemRepository.findAll().stream().map(i -> (Item) i).collect(Collectors.toList())
                : lostItemRepository.findAll().stream().map(i -> (Item) i).collect(Collectors.toList());

        int max = Math.max(1, matchingProperties.getMaxCandidates());
        List<MatchResponse> results = new ArrayList<>();
        int examined = 0;
        for (Item candidate : candidates) {
            if (examined++ >= max) break;
            if (candidate == null || Objects.equals(candidate.getId(), newItem.getId())) continue;
            if (candidate.getStatus() != ItemStatus.AVAILABLE) continue;
            Item lost = isLost ? newItem : candidate;
            Item found = isLost ? candidate : newItem;
            if (!(lost instanceof LostItem) || !(found instanceof FoundItem)) continue;
            if (itemMatchRepository.existsByLostItemIdAndFoundItemId(lost.getId(), found.getId())) continue;

            ItemMatch match = calculateMatch((LostItem) lost, (FoundItem) found);
            if (match.getMatchScore() == null || match.getMatchScore() < matchingProperties.getThreshold()) continue;
            match = itemMatchRepository.save(match);
            notifyPotentialMatch(match, newItem, candidate);
            results.add(matchMapper.toResponse(match));
        }
        results.sort(Comparator.comparing(MatchResponse::getMatchScore, Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    @Override
    @Transactional
    public List<MatchResponse> refreshMatches(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        findMatchesSync(item);
        return getMatchesForItem(itemId);
    }

    @Transactional
    public List<MatchResponse> findMatchesSync(Item newItem) {
        if (newItem == null || newItem.getId() == null) return List.of();
        boolean isLost = newItem instanceof LostItem;
        List<Item> candidates = isLost
                ? foundItemRepository.findAll().stream().map(i -> (Item) i).collect(Collectors.toList())
                : lostItemRepository.findAll().stream().map(i -> (Item) i).collect(Collectors.toList());
        int max = Math.max(1, matchingProperties.getMaxCandidates());
        List<MatchResponse> results = new ArrayList<>();
        int examined = 0;
        for (Item candidate : candidates) {
            if (examined++ >= max) break;
            if (candidate == null || Objects.equals(candidate.getId(), newItem.getId())) continue;
            if (candidate.getStatus() != ItemStatus.AVAILABLE) continue;
            Item lost = isLost ? newItem : candidate;
            Item found = isLost ? candidate : newItem;
            if (!(lost instanceof LostItem) || !(found instanceof FoundItem)) continue;
            if (itemMatchRepository.existsByLostItemIdAndFoundItemId(lost.getId(), found.getId())) continue;
            ItemMatch match = calculateMatch((LostItem) lost, (FoundItem) found);
            if (match.getMatchScore() == null || match.getMatchScore() < matchingProperties.getThreshold()) continue;
            match = itemMatchRepository.save(match);
            notifyPotentialMatch(match, newItem, candidate);
            results.add(matchMapper.toResponse(match));
        }
        results.sort(Comparator.comparing(MatchResponse::getMatchScore, Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    private List<MatchResponse> getMatchesForItem(Long itemId) {
        List<ItemMatch> matches = new ArrayList<>();
        matches.addAll(itemMatchRepository.findByLostItemIdOrderByMatchScoreDesc(itemId));
        matches.addAll(itemMatchRepository.findByFoundItemIdOrderByMatchScoreDesc(itemId));
        return matches.stream().map(matchMapper::toResponse)
                .sorted(Comparator.comparing(MatchResponse::getMatchScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private ItemMatch calculateMatch(LostItem lost, FoundItem found) {
        ItemMatch match = new ItemMatch();
        match.setLostItem(lost);
        match.setFoundItem(found);

        double name = similarity(lost.getTitle(), found.getTitle());
        double category = (lost.getCategory() != null && found.getCategory() != null
                && Objects.equals(lost.getCategory().getId(), found.getCategory().getId())) ? 100.0 : 0.0;
        double color = similarity(lost.getColor(), found.getColor());
        double brand = similarity(lost.getBrand(), found.getBrand());
        double description = keywordSimilarity(lost.getDescription(), found.getDescription());
        double location = similarity(firstNonBlank(lost.getLastSeenLocation(), lost.getLocationFound()), found.getLocationFound());
        double date = dateProximity(lost.getDateFound(), found.getDateFound());

        match.setNameScore(round(name));
        match.setCategoryScore(round(category));
        match.setColorScore(round(color));
        match.setBrandScore(round(brand));
        match.setDescriptionScore(round(description));
        match.setLocationScore(round(location));
        match.setDateScore(round(date));

        MatchingProperties.Weights w = matchingProperties.getWeights();
        double total = name * w.normalizedName()
                + category * w.normalizedCategory()
                + color * w.normalizedColor()
                + brand * w.normalizedBrand()
                + description * w.normalizedDescription()
                + location * w.normalizedLocation()
                + date * w.normalizedDate();
        total = Math.max(0.0, Math.min(100.0, total));
        match.setMatchScore(round(total));
        match.setIsNotified(false);
        return match;
    }

    private void notifyPotentialMatch(ItemMatch match, Item newItem, Item otherItem) {
        try {
            String scoreText = String.format(Locale.US, "%.1f%%", match.getMatchScore() == null ? 0.0 : match.getMatchScore());
            if (newItem.getReporter() != null) {
                notificationService.createNotification(newItem.getReporter(), NotificationType.POTENTIAL_MATCH,
                        "Potential match found",
                        "A potential match (" + scoreText + ") was found for \"" + safe(newItem.getTitle()) + "\".",
                        "ITEM", newItem.getId());
            }
            if (otherItem.getReporter() != null) {
                notificationService.createNotification(otherItem.getReporter(), NotificationType.POTENTIAL_MATCH,
                        "Potential match found",
                        "A potential match (" + scoreText + ") was found for \"" + safe(otherItem.getTitle()) + "\".",
                        "ITEM", otherItem.getId());
            }
            match.setIsNotified(true);
            itemMatchRepository.save(match);
        } catch (Exception e) {
            log.warn("Failed to send match notification", e);
        }
    }

    private double similarity(String a, String b) {
        if (isBlank(a) || isBlank(b)) return 0.0;
        String s1 = a.toLowerCase(Locale.ROOT).trim();
        String s2 = b.toLowerCase(Locale.ROOT).trim();
        if (s1.equals(s2)) return 100.0;
        Set<String> w1 = tokens(s1);
        Set<String> w2 = tokens(s2);
        if (w1.isEmpty() || w2.isEmpty()) return 0.0;
        Set<String> inter = new HashSet<>(w1); inter.retainAll(w2);
        Set<String> union = new HashSet<>(w1); union.addAll(w2);
        double jaccard = union.isEmpty() ? 0.0 : (double) inter.size() / union.size();
        double contains = (s1.contains(s2) || s2.contains(s1)) ? 0.4 : 0.0;
        return Math.min(100.0, (jaccard * 100.0) + (contains * 100.0));
    }

    private double keywordSimilarity(String a, String b) {
        if (isBlank(a) || isBlank(b)) return 0.0;
        Set<String> stop = Set.of("the","a","an","is","are","was","were","in","on","at","to","for","of","and","or","with","my","your","his","her","it","this","that");
        Set<String> w1 = tokens(a.toLowerCase(Locale.ROOT)).stream().filter(t -> !stop.contains(t)).collect(Collectors.toSet());
        Set<String> w2 = tokens(b.toLowerCase(Locale.ROOT)).stream().filter(t -> !stop.contains(t)).collect(Collectors.toSet());
        if (w1.isEmpty() || w2.isEmpty()) return 0.0;
        Set<String> inter = new HashSet<>(w1); inter.retainAll(w2);
        return Math.min(100.0, ((double) inter.size() / Math.max(w1.size(), w2.size())) * 100.0);
    }

    private double dateProximity(LocalDateTime d1, LocalDateTime d2) {
        if (d1 == null || d2 == null) return 0.0;
        long days = Math.abs(Duration.between(d1, d2).toDays());
        if (days <= 1) return 100.0;
        if (days <= 3) return 90.0;
        if (days <= 7) return 80.0;
        if (days <= 14) return 60.0;
        if (days <= 30) return 40.0;
        if (days <= 60) return 20.0;
        return 10.0;
    }

    private Set<String> tokens(String s) {
        if (s == null) return Set.of();
        return Arrays.stream(s.split("[^a-z0-9]+")).filter(t -> t.length() >= 2).collect(Collectors.toSet());
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private String safe(String s) { return s == null ? "" : s; }
    private String firstNonBlank(String a, String b) { return !isBlank(a) ? a : b; }
    private double round(double v) { return Math.round(v * 100.0) / 100.0; }
}