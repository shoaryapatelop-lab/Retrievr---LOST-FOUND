-- Flyway migration V4__seed_data.sql
-- Seed initial data for categories and admin user

-- Insert categories
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Electronics', 'Electronic devices and gadgets', NOW(), NOW()),
('Documents', 'Important documents, IDs, certificates', NOW(), NOW()),
('Accessories', 'Fashion accessories, jewelry, watches', NOW(), NOW()),
('Clothing', 'Clothing items and apparel', NOW(), NOW()),
('Bags', 'Bags, backpacks, wallets', NOW(), NOW()),
('Keys', 'Keys and key chains', NOW(), NOW()),
('Other Items', 'Miscellaneous items', NOW(), NOW());

-- Insert admin user (password is BCrypt encoded "admin123")
INSERT INTO users (email, password, role, first_name, last_name, created_at, updated_at) VALUES
('admin@retrievr.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5Ir5sQF5Z6Z5Z5Z5Z5Z5Z5Z5', 'ADMIN', 'Admin', 'User', NOW(), NOW());

INSERT INTO admins (id, employee_id, department) VALUES
(1, 'ADMIN001', 'Administration');