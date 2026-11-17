package com.retriever.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service interface for file storage operations.
 * Demonstrates <b>Abstraction</b> via service interface.
 */
public interface FileStorageService {
    /**
     * Store an uploaded file and return the URL/path.
     */
    String storeFile(MultipartFile file) throws IOException;

    /**
     * Delete a file by its URL/path.
     */
    void deleteFile(String fileUrl) throws IOException;
}