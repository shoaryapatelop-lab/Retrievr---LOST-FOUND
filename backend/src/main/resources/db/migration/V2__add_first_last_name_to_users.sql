-- Flyway migration V2__add_first_last_name_to_users.sql
-- Add first_name and last_name columns to users table

ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) NOT NULL AFTER role,
ADD COLUMN last_name VARCHAR(100) NOT NULL AFTER first_name;