-- Migration: Create articles table
-- Description: Creates the articles table with support for blog posts/articles
-- Author: Database Migration System
-- Created: 2025-10-22

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    primary_image TEXT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    content TEXT,
    created_time TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on created_time for efficient sorting/filtering
CREATE INDEX IF NOT EXISTS idx_articles_created_time ON articles(created_time DESC);

-- Create index on author for efficient filtering
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);

-- Add comment to table
COMMENT ON TABLE articles IS 'Stores article/blog post data';
COMMENT ON COLUMN articles.id IS 'Primary key, auto-incrementing';
COMMENT ON COLUMN articles.primary_image IS 'URL or path to the primary article image';
COMMENT ON COLUMN articles.title IS 'Article title';
COMMENT ON COLUMN articles.author IS 'Author name or identifier';
COMMENT ON COLUMN articles.content IS 'Full article content';
COMMENT ON COLUMN articles.created_time IS 'Article creation timestamp';
