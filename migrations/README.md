# Database Migrations

This directory contains database migrations for the Next.js application using Neon Postgres.

## Directory Structure

```
migrations/
├── README.md                           # This file
├── run-migration.js                    # Migration runner script
└── 001_create_articles_table/          # Migration for articles table
    ├── up.sql                          # Apply migration
    └── down.sql                        # Rollback migration
```

## Migration Naming Convention

Migrations follow the format: `XXX_description`

- `XXX`: Three-digit sequential number (001, 002, 003, etc.)
- `description`: Snake_case description of the migration

## Prerequisites

- Node.js 18+ installed
- DATABASE_URL environment variable set in `.env.local`
- Neon CLI installed (optional, for branching workflow)

## Quick Start

### 1. Install Neon CLI (Optional but Recommended)

```bash
npm install -g neonctl
```

### 2. Set up your environment

Ensure your `.env.local` file has the DATABASE_URL:

```bash
DATABASE_URL=postgresql://user:password@host/database
```

### 3. Run a migration

```bash
# Apply a migration (up)
node migrations/run-migration.js 001_create_articles_table up

# Rollback a migration (down)
node migrations/run-migration.js 001_create_articles_table down
```

## Safe Migration Workflow with Neon Branching

Neon's branching feature allows you to test migrations safely before applying them to production. Here's the recommended workflow:

### Step 1: Authenticate with Neon (if not already done)

```bash
neonctl auth
```

### Step 2: Create a development branch

```bash
# Create a branch from your main database
neonctl branches create --name migration-test --project-id <your-project-id>

# Get the connection string for the branch
neonctl connection-string migration-test --project-id <your-project-id>
```

### Step 3: Test the migration on the branch

```bash
# Temporarily use the branch DATABASE_URL
export DATABASE_URL="<branch-connection-string>"

# Run the migration
node migrations/run-migration.js 001_create_articles_table up

# Test your application with the new schema
npm run dev

# Verify everything works as expected
```

### Step 4: Test rollback (optional but recommended)

```bash
# Test the down migration
node migrations/run-migration.js 001_create_articles_table down

# Re-apply to confirm idempotency
node migrations/run-migration.js 001_create_articles_table up
```

### Step 5: Apply to production

Once you've verified the migration works on the branch:

```bash
# Switch back to your main DATABASE_URL
export DATABASE_URL="<main-connection-string>"

# Apply the migration to production
node migrations/run-migration.js 001_create_articles_table up
```

### Step 6: Clean up the test branch

```bash
# Delete the test branch
neonctl branches delete migration-test --project-id <your-project-id>
```

## Alternative: Using Neon's Branch Restore Feature

For zero-downtime migrations, you can use Neon's branch restore feature:

1. Create a branch and test the migration
2. If successful, promote the branch to be the new main
3. The old main becomes a branch that can be deleted

```bash
# Create branch
neonctl branches create --name migration-articles --project-id <your-project-id>

# Apply migration to branch
DATABASE_URL=<branch-url> node migrations/run-migration.js 001_create_articles_table up

# If successful, set this branch as the primary
neonctl branches set-primary migration-articles --project-id <your-project-id>
```

## Articles Table Migration (001)

### Schema

The articles table includes:

- `id` (SERIAL PRIMARY KEY): Auto-incrementing primary key
- `primary_image` (TEXT): URL or path to the primary image
- `title` (VARCHAR(255) NOT NULL): Article title (required)
- `author` (VARCHAR(255) NOT NULL): Author name/ID (required)
- `content` (TEXT): Full article content
- `created_time` (TIMESTAMP NOT NULL DEFAULT NOW()): Auto-set creation timestamp

### Indexes

- `idx_articles_created_time`: Index on created_time (DESC) for efficient date-based queries
- `idx_articles_author`: Index on author for efficient filtering by author

### Usage Example

After running the migration, you can interact with the articles table:

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Insert an article
await sql`
  INSERT INTO articles (title, author, content, primary_image)
  VALUES (${'My First Article'}, ${'John Doe'}, ${'Article content here...'}, ${'/images/article1.jpg'})
`;

// Query articles
const articles = await sql`
  SELECT * FROM articles 
  ORDER BY created_time DESC 
  LIMIT 10
`;

// Query by author
const authorArticles = await sql`
  SELECT * FROM articles 
  WHERE author = ${'John Doe'}
  ORDER BY created_time DESC
`;
```

## Best Practices

1. **Always test migrations on a branch first** - Use Neon's branching feature to test migrations safely
2. **Keep migrations small and focused** - Each migration should do one thing
3. **Write reversible migrations** - Always include both up and down migrations
4. **Use transactions for complex migrations** - Wrap multiple operations in BEGIN/COMMIT blocks
5. **Document your migrations** - Add comments explaining what the migration does and why
6. **Never modify existing migrations** - Once applied to production, create a new migration instead
7. **Test rollbacks** - Ensure your down migrations work correctly
8. **Use indexes wisely** - Add indexes for frequently queried columns

## Zero-Downtime Migration Strategies

For production environments, consider these strategies:

1. **Additive Changes First**: Add new columns/tables without removing old ones
2. **Gradual Rollout**: Deploy application code that supports both old and new schemas
3. **Cleanup Migration**: Remove old columns/tables in a separate migration after confirming new code works
4. **Use Neon Branching**: Test migrations on a branch before applying to main

## Troubleshooting

### Migration fails with connection error

- Verify DATABASE_URL is set correctly
- Check network connectivity to Neon
- Ensure the database user has appropriate permissions

### Migration partially applied

- Review the error message
- Check which statements succeeded in the database
- You may need to manually fix the database state before re-running

### Need to modify an applied migration

- **Never modify an applied migration**
- Create a new migration to make the change
- Example: If you need to add a column, create a new migration like `002_add_column_to_articles`

## Getting Help

- [Neon Documentation](https://neon.tech/docs)
- [Neon Branching Guide](https://neon.tech/docs/guides/branching)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Contributing

When adding new migrations:

1. Use the next sequential number
2. Follow the naming convention
3. Include both up.sql and down.sql
4. Test on a Neon branch first
5. Document the migration in this README
