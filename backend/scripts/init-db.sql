-- Initial database setup script
-- This script runs automatically when MySQL container is first created

-- Create database if it doesn't exist (usually created by MYSQL_DATABASE env var)
CREATE DATABASE IF NOT EXISTS lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges (user is usually created by MYSQL_USER env var)
-- This is a fallback in case user doesn't exist
GRANT ALL PRIVILEGES ON lms_db.* TO 'lms_user'@'%' IDENTIFIED BY 'lms_password';
FLUSH PRIVILEGES;

-- Use the database
USE lms_db;

-- Add any initial data or schema here if needed
-- Note: Alembic migrations will handle schema creation


