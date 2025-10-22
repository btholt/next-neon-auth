#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script helps run database migrations for the Next.js application.
 * It supports both up (apply) and down (rollback) migrations.
 * 
 * Usage:
 *   node migrations/run-migration.js <migration-name> <direction>
 *   
 * Examples:
 *   node migrations/run-migration.js 001_create_articles_table up
 *   node migrations/run-migration.js 001_create_articles_table down
 */

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node run-migration.js <migration-name> <direction>');
    console.error('Example: node run-migration.js 001_create_articles_table up');
    process.exit(1);
  }

  const [migrationName, direction] = args;

  if (!['up', 'down'].includes(direction)) {
    console.error('Direction must be either "up" or "down"');
    process.exit(1);
  }

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your .env.local file');
    process.exit(1);
  }

  const migrationDir = path.join(__dirname, migrationName);
  const sqlFile = path.join(migrationDir, `${direction}.sql`);

  // Check if migration exists
  if (!fs.existsSync(sqlFile)) {
    console.error(`Migration file not found: ${sqlFile}`);
    process.exit(1);
  }

  // Read the SQL file
  const sql = neon(process.env.DATABASE_URL);
  const migrationSQL = fs.readFileSync(sqlFile, 'utf8');

  console.log(`\n🚀 Running migration: ${migrationName} (${direction})`);
  console.log(`📄 SQL file: ${sqlFile}`);
  console.log(`\n--- SQL Content ---`);
  console.log(migrationSQL);
  console.log(`--- End SQL ---\n`);

  try {
    // Execute the migration
    await sql(migrationSQL);
    console.log(`✅ Migration ${direction} completed successfully!`);
    
    // For up migrations, verify the table was created
    if (direction === 'up' && migrationName.includes('articles')) {
      const result = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'articles'
        ORDER BY ordinal_position;
      `;
      console.log('\n📋 Articles table structure:');
      console.table(result);
    }
  } catch (error) {
    console.error(`❌ Migration failed:`, error.message);
    process.exit(1);
  }
}

runMigration();
