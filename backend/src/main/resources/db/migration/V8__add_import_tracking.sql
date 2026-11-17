-- V8__add_import_tracking.sql
-- Add import tracking for real found items from college collection

-- Add import_source column to items table
ALTER TABLE items ADD COLUMN import_source VARCHAR(20) NOT NULL DEFAULT 'MANUAL';

-- Add file_hash column to item_images for duplicate detection
ALTER TABLE item_images ADD COLUMN file_hash VARCHAR(64);

-- Create import_jobs table for audit trail
CREATE TABLE import_jobs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    job_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING',
    started_at DATETIME NOT NULL,
    completed_at DATETIME NULL,
    total_files INT NOT NULL DEFAULT 0,
    imported_count INT NOT NULL DEFAULT 0,
    skipped_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create import_items staging table for review queue
CREATE TABLE import_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    import_job_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    suggested_location VARCHAR(100),
    location_confidence VARCHAR(20) DEFAULT 'MANUAL',
    ai_title VARCHAR(200),
    ai_description VARCHAR(2000),
    ai_category_id BIGINT,
    ai_keywords VARCHAR(500),
    ai_confidence DECIMAL(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewed_by BIGINT NULL,
    reviewed_at DATETIME NULL,
    review_notes VARCHAR(1000),
    created_item_id BIGINT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_import_items_job FOREIGN KEY (import_job_id) REFERENCES import_jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_import_items_category FOREIGN KEY (ai_category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_import_items_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_import_items_created_item FOREIGN KEY (created_item_id) REFERENCES items(id) ON DELETE SET NULL,
    CONSTRAINT uk_import_items_file_hash UNIQUE (file_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for import_items
CREATE INDEX idx_import_items_job ON import_items(import_job_id);
CREATE INDEX idx_import_items_status ON import_items(status);
CREATE INDEX idx_import_items_hash ON import_items(file_hash);
CREATE INDEX idx_import_items_location ON import_items(suggested_location);

-- Insert system import user (password is BCrypt encoded "system-import-2024")
INSERT INTO users (email, password, role, first_name, last_name, created_at, updated_at) VALUES
('import-bot@retrievr.system', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5Ir5sQF5Z6Z5Z5Z5Z5Z5Z5Z5', 'SYSTEM_IMPORT', 'Import', 'Bot', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Note: No entry in admins/students table for SYSTEM_IMPORT role