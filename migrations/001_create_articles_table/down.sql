-- Migration: Rollback articles table
-- Description: Drops the articles table and associated indexes
-- Author: Database Migration System
-- Created: 2025-10-22

-- Drop indexes (will be automatically dropped with the table, but explicit for clarity)
DROP INDEX IF EXISTS idx_articles_author;
DROP INDEX IF EXISTS idx_articles_created_time;

-- Drop articles table
DROP TABLE IF EXISTS articles;
