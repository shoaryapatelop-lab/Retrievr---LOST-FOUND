-- V5__align_schema_and_indexes.sql
-- Non-destructive alignment for Retriever backend (safe additive changes)

-- Ensure claims table has expected columns/index-friendly constraints (idempotent checks via information_schema)
SET @col_exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'claims' AND column_name = 'claimed_at');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE claims ADD COLUMN claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Helpful indexes for search/filter (ignore duplicates by checking existence)
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'items' AND index_name = 'idx_items_title');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_items_title ON items(title)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'items' AND index_name = 'idx_items_date_found');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_items_date_found ON items(date_found)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'items' AND index_name = 'idx_items_brand');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_items_brand ON items(brand)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'items' AND index_name = 'idx_items_color');
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_items_color ON items(color)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Prevent duplicate pending claims per user/item where possible via lookup pattern; enforce uniqueness of claim per claimer+item to avoid duplicates
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'claims' AND index_name = 'uk_claims_item_claimer');
SET @sql := IF(@idx = 0, 'CREATE UNIQUE INDEX uk_claims_item_claimer ON claims(item_id, claimer_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;