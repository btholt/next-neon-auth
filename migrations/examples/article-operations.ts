/**
 * Example: Using the Articles Table
 * 
 * This file demonstrates how to interact with the articles table
 * in your Next.js application after running the migration.
 */

import { neon } from '@neondatabase/serverless';

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!);

/**
 * Create a new article
 */
export async function createArticle(data: {
  title: string;
  author: string;
  content: string;
  primary_image?: string;
}) {
  const [article] = await sql`
    INSERT INTO articles (title, author, content, primary_image)
    VALUES (${data.title}, ${data.author}, ${data.content}, ${data.primary_image || null})
    RETURNING *
  `;
  return article;
}

/**
 * Get all articles with pagination
 */
export async function getArticles(options?: {
  limit?: number;
  offset?: number;
}) {
  const limit = options?.limit || 10;
  const offset = options?.offset || 0;

  const articles = await sql`
    SELECT 
      id,
      title,
      author,
      primary_image,
      content,
      created_time
    FROM articles
    ORDER BY created_time DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return articles;
}

/**
 * Get a single article by ID
 */
export async function getArticleById(id: number) {
  const [article] = await sql`
    SELECT 
      id,
      title,
      author,
      primary_image,
      content,
      created_time
    FROM articles
    WHERE id = ${id}
  `;
  
  return article;
}

/**
 * Get articles by author
 */
export async function getArticlesByAuthor(author: string) {
  const articles = await sql`
    SELECT 
      id,
      title,
      author,
      primary_image,
      content,
      created_time
    FROM articles
    WHERE author = ${author}
    ORDER BY created_time DESC
  `;
  
  return articles;
}

/**
 * Update an article
 */
export async function updateArticle(
  id: number,
  data: {
    title?: string;
    author?: string;
    content?: string;
    primary_image?: string;
  }
) {
  // Build dynamic update query
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) {
    updates.push('title = $' + (values.length + 1));
    values.push(data.title);
  }
  if (data.author !== undefined) {
    updates.push('author = $' + (values.length + 1));
    values.push(data.author);
  }
  if (data.content !== undefined) {
    updates.push('content = $' + (values.length + 1));
    values.push(data.content);
  }
  if (data.primary_image !== undefined) {
    updates.push('primary_image = $' + (values.length + 1));
    values.push(data.primary_image);
  }
  
  if (updates.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(id);
  
  const [article] = await sql`
    UPDATE articles 
    SET ${sql.unsafe(updates.join(', '))}
    WHERE id = ${id}
    RETURNING *
  `;
  
  return article;
}

/**
 * Delete an article
 */
export async function deleteArticle(id: number) {
  const [deleted] = await sql`
    DELETE FROM articles
    WHERE id = ${id}
    RETURNING id
  `;
  
  return deleted;
}

/**
 * Search articles by title
 */
export async function searchArticles(searchTerm: string) {
  const articles = await sql`
    SELECT 
      id,
      title,
      author,
      primary_image,
      content,
      created_time
    FROM articles
    WHERE title ILIKE ${'%' + searchTerm + '%'}
       OR content ILIKE ${'%' + searchTerm + '%'}
    ORDER BY created_time DESC
  `;
  
  return articles;
}

/**
 * Get article count
 */
export async function getArticleCount() {
  const [result] = await sql`
    SELECT COUNT(*) as count FROM articles
  `;
  
  return parseInt(result.count);
}

/**
 * Get recent articles (last 7 days)
 */
export async function getRecentArticles() {
  const articles = await sql`
    SELECT 
      id,
      title,
      author,
      primary_image,
      created_time
    FROM articles
    WHERE created_time >= NOW() - INTERVAL '7 days'
    ORDER BY created_time DESC
  `;
  
  return articles;
}

// Example usage in a Next.js API route or Server Action:

/*
'use server';

import { createArticle, getArticles } from './article-operations';

export async function handleCreateArticle(formData: FormData) {
  const article = await createArticle({
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    content: formData.get('content') as string,
    primary_image: formData.get('image') as string,
  });
  
  return article;
}

export async function handleGetArticles(page: number = 1, perPage: number = 10) {
  const offset = (page - 1) * perPage;
  const articles = await getArticles({ limit: perPage, offset });
  return articles;
}
*/
