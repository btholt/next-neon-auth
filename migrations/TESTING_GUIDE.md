# Testing Migrations with Neon Branching - Step-by-Step Guide

This guide walks you through safely testing the articles table migration using Neon's branching feature.

## Prerequisites

1. A Neon account with an active project
2. Node.js 18+ installed
3. Neon CLI installed: `npm install -g neonctl`

## Step-by-Step Testing Process

### Phase 1: Setup and Authentication

#### 1. Install Neon CLI (if not already installed)

```bash
npm install -g neonctl
```

#### 2. Authenticate with Neon

```bash
neonctl auth
```

This will open a browser window to authenticate with your Neon account.

#### 3. List your projects

```bash
neonctl projects list
```

Note your project ID for the next steps.

### Phase 2: Create and Test on a Branch

#### 4. Create a test branch

```bash
# Replace <your-project-id> with your actual project ID
neonctl branches create --name test-articles-migration --project-id <your-project-id>
```

Example output:
```
┌────────────────────┬──────────────────────────────┐
│ Id                 │ br-test-12345                │
│ Name               │ test-articles-migration      │
│ Created At         │ 2025-10-22 02:27:16         │
└────────────────────┴──────────────────────────────┘
```

#### 5. Get the branch connection string

```bash
neonctl connection-string test-articles-migration --project-id <your-project-id>
```

This will output a connection string like:
```
postgresql://user:password@ep-test-12345.us-east-2.aws.neon.tech/neondb
```

#### 6. Create a test environment file

Create a file `.env.test` in your project root:

```bash
# Copy from .env.local template
cp .env.local .env.test
```

Edit `.env.test` and replace the DATABASE_URL with the branch connection string from step 5.

#### 7. Run the migration on the test branch

```bash
# Load the test environment
export $(cat .env.test | xargs)

# Run the up migration
npm run migrate:articles:up
```

Expected output:
```
🚀 Running migration: 001_create_articles_table (up)
📄 SQL file: /path/to/migrations/001_create_articles_table/up.sql

--- SQL Content ---
CREATE TABLE IF NOT EXISTS articles (
...
--- End SQL ---

✅ Migration up completed successfully!

📋 Articles table structure:
┌─────────────────┬───────────────┬──────────────┬──────────────────────┐
│ column_name     │ data_type     │ is_nullable  │ column_default       │
├─────────────────┼───────────────┼──────────────┼──────────────────────┤
│ id              │ integer       │ NO           │ nextval('articles...')│
│ primary_image   │ text          │ YES          │                      │
│ title           │ varchar(255)  │ NO           │                      │
│ author          │ varchar(255)  │ NO           │                      │
│ content         │ text          │ YES          │                      │
│ created_time    │ timestamp     │ NO           │ now()                │
└─────────────────┴───────────────┴──────────────┴──────────────────────┘
```

#### 8. Test the migration with sample data

Create a test script `test-migration.js`:

```javascript
const { neon } = require('@neondatabase/serverless');

async function testMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Insert test data
  console.log('Inserting test articles...');
  await sql`
    INSERT INTO articles (title, author, content, primary_image)
    VALUES 
      ('Getting Started with Neon', 'Jane Smith', 'Neon is a serverless Postgres platform...', '/images/neon-guide.jpg'),
      ('Database Migrations Best Practices', 'John Doe', 'When working with databases...', '/images/migrations.jpg'),
      ('Building with Next.js and Neon', 'Alice Johnson', 'Combining Next.js with Neon...', '/images/nextjs-neon.jpg')
  `;
  
  // Query the data
  console.log('\nQuerying articles...');
  const articles = await sql`
    SELECT id, title, author, created_time 
    FROM articles 
    ORDER BY created_time DESC
  `;
  
  console.log('\n📚 Articles in database:');
  console.table(articles);
  
  // Test author filtering
  console.log('\nTesting author filter...');
  const janeArticles = await sql`
    SELECT title, author 
    FROM articles 
    WHERE author = 'Jane Smith'
  `;
  console.table(janeArticles);
  
  console.log('\n✅ Migration test completed successfully!');
}

testMigration().catch(console.error);
```

Run the test:

```bash
node test-migration.js
```

#### 9. Test your application

```bash
# Start the dev server with the branch database
npm run dev
```

Visit http://localhost:3000 and verify your application works correctly.

#### 10. Test the rollback

```bash
# Test the down migration
npm run migrate:articles:down
```

Expected output:
```
🚀 Running migration: 001_create_articles_table (down)
📄 SQL file: /path/to/migrations/001_create_articles_table/down.sql

--- SQL Content ---
DROP INDEX IF EXISTS idx_articles_author;
...
--- End SQL ---

✅ Migration down completed successfully!
```

#### 11. Verify rollback

```bash
# Try to query the table (should fail)
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT * FROM articles LIMIT 1\`
  .then(() => console.log('❌ Table still exists!'))
  .catch(() => console.log('✅ Table successfully dropped!'));
"
```

#### 12. Re-apply the migration

```bash
# Re-run the up migration to test idempotency
npm run migrate:articles:up
```

### Phase 3: Apply to Production

#### 13. Switch to production database

```bash
# Load your production environment
export $(cat .env.local | xargs)
```

Verify you're using the correct database:

```bash
echo $DATABASE_URL
```

#### 14. Apply the migration to production

```bash
npm run migrate:articles:up
```

#### 15. Verify in production

```bash
# Check the table exists
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'articles'\`
  .then(cols => console.table(cols))
  .catch(console.error);
"
```

### Phase 4: Cleanup

#### 16. Delete the test branch

```bash
neonctl branches delete test-articles-migration --project-id <your-project-id>
```

Confirm the deletion when prompted.

#### 17. Remove test files

```bash
rm .env.test test-migration.js
```

## Alternative: Using Branch as Primary

For zero-downtime migrations, you can promote the branch to be the primary:

```bash
# After testing migration on branch
neonctl branches set-primary test-articles-migration --project-id <your-project-id>

# The old main branch is now a backup
# You can delete it after confirming everything works
```

## Quick Reference Commands

```bash
# Create branch
neonctl branches create --name <branch-name> --project-id <project-id>

# Get connection string
neonctl connection-string <branch-name> --project-id <project-id>

# List branches
neonctl branches list --project-id <project-id>

# Delete branch
neonctl branches delete <branch-name> --project-id <project-id>

# Set branch as primary
neonctl branches set-primary <branch-name> --project-id <project-id>

# Run migration
npm run migrate:articles:up
npm run migrate:articles:down
```

## Troubleshooting

### "Branch not found" error

- Verify the branch name is correct
- Check you're using the correct project ID
- List branches to see available branches: `neonctl branches list --project-id <project-id>`

### Connection refused

- Verify the connection string is correct
- Check if the branch is still active
- Ensure your IP is not blocked by Neon's firewall settings

### Migration script errors

- Verify DATABASE_URL is set: `echo $DATABASE_URL`
- Check the SQL syntax in the migration files
- Review the error message for specific issues

### Permission denied

- Ensure you're authenticated: `neonctl auth`
- Verify you have the necessary permissions in the Neon project
- Check that the database user has CREATE TABLE permissions

## Best Practices Summary

1. ✅ Always test migrations on a branch first
2. ✅ Test both up and down migrations
3. ✅ Verify data integrity after migration
4. ✅ Test your application with the new schema
5. ✅ Keep the test branch for a few days as backup
6. ✅ Document any issues encountered
7. ✅ Clean up test branches after successful deployment

## Next Steps

After successfully applying the migration:

1. Update your application code to use the articles table
2. Create API routes for article CRUD operations
3. Add UI components for displaying articles
4. Consider adding more migrations for features like:
   - Categories/tags table
   - Comments table
   - Article-author relationships (foreign key to users)
   - Full-text search indexes

## Resources

- [Neon Branching Documentation](https://neon.tech/docs/guides/branching)
- [Neon CLI Reference](https://neon.tech/docs/reference/cli-reference)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
