package com.retriever.service.impl;

import com.retriever.dto.ApproveImportRequest;
import com.retriever.dto.ImportDiscoveredItem;
import com.retriever.dto.ImportItemResponse;
import com.retriever.dto.ImportJobResponse;
import com.retriever.dto.ImportStatsResponse;
import com.retriever.dto.RejectImportRequest;
import com.retriever.entity.*;
import com.retriever.mapper.ImportMapper;
import com.retriever.repository.*;
import com.retriever.service.FileStorageService;
import com.retriever.service.ImportService;
import com.retriever.service.ImageAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportServiceImpl implements ImportService {

    private final ImportJobRepository importJobRepository;
    private final ImportItemRepository importItemRepository;
    private final ItemRepository itemRepository;
    private final FoundItemRepository foundItemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ItemImageRepository itemImageRepository;
    private final FileStorageService fileStorageService;
    private final ImageAnalysisService imageAnalysisService;
    private final ImportMapper importMapper;

    @Value("${app.upload.dir:../uploads}")
    private String uploadDir;

    // Location mapping from filename prefixes
    private static final Map<String, String> LOCATION_PREFIXES = Map.of(
            "CC3_", "CC3",
            "Library_", "Library",
            "Amul_CC3_Lab_", "Amul CC3 Lab",
            "CC3-", "CC3",
            "Library-", "Library",
            "Amul-CC3-Lab-", "Amul CC3 Lab"
    );

    @Override
    @Transactional(readOnly = true)
    public List<ImportDiscoveredItem> discoverImages() {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        List<ImportDiscoveredItem> discovered = new ArrayList<>();

        try {
            if (!Files.exists(uploadPath) || !Files.isDirectory(uploadPath)) {
                log.warn("Upload directory does not exist: {}", uploadPath);
                return discovered;
            }

            Files.list(uploadPath)
                    .filter(Files::isRegularFile)
                    .filter(this::isImageFile)
                    .forEach(file -> {
                        try {
                            String filename = file.getFileName().toString();
                            String fileHash = computeFileHash(file);
                            boolean alreadyImported = importItemRepository.findByFileHash(fileHash).isPresent()
                                    || itemImageRepository.findAll().stream()
                                    .anyMatch(img -> fileHash.equals(img.getFileHash()));

                            String suggestedLocation = resolveLocationFromFilename(filename);
                            LocationConfidence confidence = suggestedLocation != null
                                    ? LocationConfidence.HIGH
                                    : LocationConfidence.MANUAL;
                            String reason = suggestedLocation != null
                                    ? "Matched filename prefix"
                                    : "No location prefix found in filename";

                            discovered.add(ImportDiscoveredItem.builder()
                                    .originalFilename(filename)
                                    .filePath(file.toString())
                                    .fileSize(Files.size(file))
                                    .contentType(Files.probeContentType(file))
                                    .suggestedLocation(suggestedLocation)
                                    .locationConfidence(confidence)
                                    .locationReason(reason)
                                    .alreadyImported(alreadyImported)
                                    .existingFileHash(alreadyImported ? fileHash : null)
                                    .build());
                        } catch (Exception e) {
                            log.warn("Failed to process file: {}", file, e);
                        }
                    });
        } catch (IOException e) {
            log.error("Failed to scan upload directory", e);
        }

        return discovered;
    }

    @Override
    @Transactional
    public ImportJobResponse startImportJob(String jobName) {
        ImportJob job = new ImportJob();
        job.setJobName(jobName);
        job.setStatus(ImportJobStatus.RUNNING);
        job.setStartedAt(LocalDateTime.now());
        job = importJobRepository.save(job);
        log.info("Started import job: {} (id={})", jobName, job.getId());
        return importMapper.toJobResponse(job);
    }

    @Override
    @Transactional
    public ImportItemResponse analyzeAndStage(Long importJobId, String filePath, String suggestedLocation) {
        ImportJob job = importJobRepository.findById(importJobId)
                .orElseThrow(() -> new IllegalArgumentException("Import job not found: " + importJobId));

        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("File not found: " + filePath);
        }

        String fileHash = computeFileHash(path);
        String filename = path.getFileName().toString();

        // Check for duplicates
        Optional<ImportItem> existingImport = importItemRepository.findByFileHash(fileHash);
        if (existingImport.isPresent()) {
            ImportItem existing = existingImport.get();
            existing.setStatus(ImportItemStatus.DUPLICATE);
            importItemRepository.save(existing);
            job.setSkippedCount(job.getSkippedCount() + 1);
            importJobRepository.save(job);
            log.info("Duplicate file skipped: {} (hash={})", filename, fileHash);
            return importMapper.toResponse(existing);
        }

        // Analyze with AI
        String finalLocation = suggestedLocation != null ? suggestedLocation : resolveLocationFromFilename(filename);
        LocationConfidence confidence = finalLocation != null ? LocationConfidence.HIGH : LocationConfidence.MANUAL;

        ImportItem importItem = new ImportItem();
        importItem.setImportJob(job);
        importItem.setOriginalFilename(filename);
        importItem.setFilePath(filePath);
        importItem.setFileHash(fileHash);
        try {
            importItem.setFileSize(Files.size(path));
            importItem.setContentType(Files.probeContentType(path));
        } catch (IOException ignored) {}
        importItem.setSuggestedLocation(finalLocation);
        importItem.setLocationConfidence(confidence);

        // AI analysis
        try {
            var analysis = imageAnalysisService.analyze(path);
            if (analysis.isPresent()) {
                var result = analysis.get();
                importItem.setAiTitle(result.title());
                importItem.setAiDescription(result.description());
                importItem.setAiCategory(result.suggestedCategory());
                importItem.setAiKeywords(result.keywords());
                importItem.setAiConfidence(result.confidence());
            }
        } catch (Exception e) {
            log.warn("AI analysis failed for {}", filename, e);
        }

        importItem = importItemRepository.save(importItem);
        job.setTotalFiles(job.getTotalFiles() + 1);
        importJobRepository.save(job);

        return importMapper.toResponse(importItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImportItemResponse> getImportJobItems(Long importJobId) {
        return importItemRepository.findByImportJobId(importJobId).stream()
                .map(importMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImportItemResponse> getPendingReviewItems() {
        return importItemRepository.findByStatus(ImportItemStatus.PENDING_REVIEW).stream()
                .map(importMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ImportItemResponse approveImport(Long importItemId, ApproveImportRequest request, Long reviewerId) {
        ImportItem importItem = importItemRepository.findById(importItemId)
                .orElseThrow(() -> new IllegalArgumentException("Import item not found: " + importItemId));

        if (importItem.getStatus() != ImportItemStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Item is not pending review: " + importItem.getStatus());
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer not found: " + reviewerId));

        // Get or create system import user
        User importUser = userRepository.findByEmail("import-bot@retrievr.system")
                .orElseThrow(() -> new IllegalStateException("System import user not found"));

        // Resolve category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.getCategoryId()));

        // Create FoundItem
        FoundItem foundItem = new FoundItem();
        foundItem.setTitle(request.getTitle());
        foundItem.setDescription(request.getDescription());
        foundItem.setLocationFound(request.getLocationFound());
        foundItem.setDateFound(request.getDateFound());
        foundItem.setStatus(ItemStatus.AVAILABLE);
        foundItem.setColor(request.getColor());
        foundItem.setBrand(request.getBrand());
        foundItem.setContactInfo(request.getContactInfo());
        foundItem.setCategory(category);
        foundItem.setReporter(importUser);
        foundItem.setImportSource(ImportSource.IMPORTED_REAL);

        // Copy image to uploads with proper naming if needed
        String imageUrl = copyImageToUploads(importItem.getFilePath(), importItem.getFileHash());
        foundItem.setImageUrls(imageUrl);

        FoundItem savedItem = foundItemRepository.save(foundItem);

        // Create ItemImage record
        ItemImage itemImage = new ItemImage();
        itemImage.setItem(savedItem);
        itemImage.setImageUrl(imageUrl);
        itemImage.setFileName(importItem.getOriginalFilename());
        itemImage.setFileSize(importItem.getFileSize());
        itemImage.setContentType(importItem.getContentType());
        itemImage.setFileHash(importItem.getFileHash());
        itemImage.setIsPrimary(true);
        itemImageRepository.save(itemImage);

        // Update import item
        importItem.setStatus(ImportItemStatus.IMPORTED);
        importItem.setReviewedBy(reviewer);
        importItem.setReviewedAt(LocalDateTime.now());
        importItem.setReviewNotes(request.getReviewNotes());
        importItem.setCreatedItem(savedItem);
        importItem.setStoredFilename(Paths.get(imageUrl).getFileName().toString());
        importItemRepository.save(importItem);

        // Update job stats
        ImportJob job = importItem.getImportJob();
        job.setImportedCount(job.getImportedCount() + 1);
        importJobRepository.save(job);

        log.info("Approved import item {} -> created FoundItem {}", importItemId, savedItem.getId());
        return importMapper.toResponse(importItem);
    }

    @Override
    @Transactional
    public ImportItemResponse rejectImport(Long importItemId, RejectImportRequest request, Long reviewerId) {
        ImportItem importItem = importItemRepository.findById(importItemId)
                .orElseThrow(() -> new IllegalArgumentException("Import item not found: " + importItemId));

        if (importItem.getStatus() != ImportItemStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Item is not pending review: " + importItem.getStatus());
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("Reviewer not found: " + reviewerId));

        importItem.setStatus(ImportItemStatus.REJECTED);
        importItem.setReviewedBy(reviewer);
        importItem.setReviewedAt(LocalDateTime.now());
        importItem.setReviewNotes(request.getReviewNotes());
        importItemRepository.save(importItem);

        ImportJob job = importItem.getImportJob();
        job.setFailedCount(job.getFailedCount() + 1);
        importJobRepository.save(job);

        log.info("Rejected import item {}", importItemId);
        return importMapper.toResponse(importItem);
    }

    @Override
    @Transactional(readOnly = true)
    public ImportStatsResponse getImportStats() {
        long totalDiscovered = importItemRepository.count();
        long pendingReview = importItemRepository.findByStatus(ImportItemStatus.PENDING_REVIEW).size();
        long approved = importItemRepository.findByStatus(ImportItemStatus.APPROVED).size();
        long rejected = importItemRepository.findByStatus(ImportItemStatus.REJECTED).size();
        long imported = importItemRepository.findByStatus(ImportItemStatus.IMPORTED).size();
        long duplicates = importItemRepository.findByStatus(ImportItemStatus.DUPLICATE).size();

        Map<String, Long> byLocation = importItemRepository.findAll().stream()
                .filter(i -> i.getSuggestedLocation() != null)
                .collect(Collectors.groupingBy(ImportItem::getSuggestedLocation, Collectors.counting()));

        return ImportStatsResponse.builder()
                .totalDiscovered(totalDiscovered)
                .pendingReview(pendingReview)
                .approved(approved)
                .rejected(rejected)
                .imported(imported)
                .duplicates(duplicates)
                .byLocation(byLocation)
                .build();
    }

    @Override
    @Transactional
    public ImportJobResponse completeImportJob(Long importJobId) {
        ImportJob job = importJobRepository.findById(importJobId)
                .orElseThrow(() -> new IllegalArgumentException("Import job not found: " + importJobId));

        job.setStatus(ImportJobStatus.COMPLETED);
        job.setCompletedAt(LocalDateTime.now());
        job = importJobRepository.save(job);
        log.info("Completed import job: {}", job.getJobName());
        return importMapper.toJobResponse(job);
    }

    private boolean isImageFile(Path file) {
        String filename = file.getFileName().toString().toLowerCase();
        return filename.endsWith(".jpg") || filename.endsWith(".jpeg")
                || filename.endsWith(".png") || filename.endsWith(".gif")
                || filename.endsWith(".webp");
    }

    private String resolveLocationFromFilename(String filename) {
        for (Map.Entry<String, String> entry : LOCATION_PREFIXES.entrySet()) {
            if (filename.startsWith(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String computeFileHash(Path file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(Files.readAllBytes(file));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | IOException e) {
            log.warn("Failed to compute hash for {}", file, e);
            return UUID.randomUUID().toString(); // fallback
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private String copyImageToUploads(String sourcePath, String fileHash) {
        try {
            Path source = Paths.get(sourcePath);
            String extension = "";
            int dotIndex = source.getFileName().toString().lastIndexOf('.');
            if (dotIndex > 0) {
                extension = source.getFileName().toString().substring(dotIndex);
            }
            String newFilename = fileHash.substring(0, 32) + extension;
            Path target = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(newFilename);

            if (!Files.exists(target)) {
                Files.copy(source, target);
            }
            return "/uploads/" + newFilename;
        } catch (IOException e) {
            log.warn("Failed to copy image, using original path", e);
            return sourcePath.startsWith("/uploads/") ? sourcePath : "/uploads/" + Paths.get(sourcePath).getFileName();
        }
    }
}