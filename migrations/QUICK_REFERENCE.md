# Quick Reference: Articles Table Migration

## Installation & Setup

```bash
# Install dependencies (if not done)
npm install

# Ensure DATABASE_URL is set in .env.local
# DATABASE_URL=postgresql://user:password@host/database
```

## Running Migrations

### Apply Migration (Create Table)
```bash
npm run migrate:articles:up
```

### Rollback Migration (Drop Table)
```bash
npm run migrate:articles:down
```

### Generic Migration Command
```bash
npm run migrate <migration-name> <up|down>
# Example: npm run migrate 001_create_articles_table up
```

## Neon Branching Quick Start

### 1. Install Neon CLI
```bash
npm install -g neonctl
```

### 2. Authenticate
```bash
neonctl auth
```

### 3. Create Test Branch
```bash
neonctl branches create --name test-migration --project-id <your-project-id>
```

### 4. Get Branch Connection String
```bash
neonctl connection-string test-migration --project-id <your-project-id>
```

### 5. Test Migration
```bash
# Set branch DATABASE_URL temporarily
export DATABASE_URL="<branch-connection-string>"

# Run migration
npm run migrate:articles:up

# Verify
node -e "const {neon}=require('@neondatabase/serverless');neon(process.env.DATABASE_URL)\`SELECT * FROM information_schema.columns WHERE table_name='articles'\`.then(console.table)"
```

### 6. Apply to Production
```bash
# Switch to production DATABASE_URL
export DATABASE_URL="<production-connection-string>"

# Apply migration
npm run migrate:articles:up
```

### 7. Clean Up
```bash
neonctl branches delete test-migration --project-id <your-project-id>
```

## Articles Table Schema

| Column         | Type          | Constraints      | Description                    |
|----------------|---------------|------------------|--------------------------------|
| id             | SERIAL        | PRIMARY KEY      | Auto-incrementing ID           |
| primary_image  | TEXT          | NULL             | Image URL/path                 |
| title          | VARCHAR(255)  | NOT NULL         | Article title                  |
| author         | VARCHAR(255)  | NOT NULL         | Author name/ID                 |
| content        | TEXT          | NULL             | Article content                |
| created_time   | TIMESTAMP     | NOT NULL, NOW()  | Creation timestamp             |

**Indexes:**
- `idx_articles_created_time` on `created_time DESC`
- `idx_articles_author` on `author`

## Using the Articles Table

### Create Article
```typescript
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const [article] = await sql`
  INSERT INTO articles (title, author, content, primary_image)
  VALUES ('My Title', 'John Doe', 'Content...', '/img.jpg')
  RETURNING *
`;
```

### Get Articles
```typescript
const articles = await sql`
  SELECT * FROM articles 
  ORDER BY created_time DESC 
  LIMIT 10
`;
```

### Get by Author
```typescript
const articles = await sql`
  SELECT * FROM articles 
  WHERE author = ${'John Doe'}
  ORDER BY created_time DESC
`;
```

### Update Article
```typescript
await sql`
  UPDATE articles 
  SET title = ${'New Title'}, content = ${'New content'}
  WHERE id = ${1}
`;
```

### Delete Article
```typescript
await sql`
  DELETE FROM articles WHERE id = ${1}
`;
```

## Common Commands

```bash
# Check if table exists
node -e "const {neon}=require('@neondatabase/serverless');neon(process.env.DATABASE_URL)\`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='articles')\`.then(r=>console.log('Table exists:',r[0].exists))"

# Count articles
node -e "const {neon}=require('@neondatabase/serverless');neon(process.env.DATABASE_URL)\`SELECT COUNT(*) FROM articles\`.then(r=>console.log('Articles:',r[0].count))"

# View table structure
node -e "const {neon}=require('@neondatabase/serverless');neon(process.env.DATABASE_URL)\`SELECT column_name,data_type,is_nullable FROM information_schema.columns WHERE table_name='articles' ORDER BY ordinal_position\`.then(console.table)"
```

## Documentation

- **Full Guide**: [migrations/README.md](./README.md)
- **Testing Guide**: [migrations/TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Code Examples**: [migrations/examples/article-operations.ts](./examples/article-operations.ts)

## Troubleshooting

### "DATABASE_URL is not set"
```bash
# Check if set
echo $DATABASE_URL

# Set in .env.local or export
export DATABASE_URL="postgresql://..."
```

### "Migration file not found"
```bash
# Check migration exists
ls -la migrations/001_create_articles_table/

# Use correct migration name
npm run migrate 001_create_articles_table up
```

### "Permission denied"
```bash
# Ensure migration script is executable
chmod +x migrations/run-migration.js
```

### "Table already exists" (running up)
```bash
# Either use the existing table or rollback first
npm run migrate:articles:down
npm run migrate:articles:up
```

### "Table does not exist" (running down)
```bash
# Table already dropped, no action needed
# Verify: SELECT * FROM articles; (should error)
```

## Best Practices

✅ **DO:**
- Test migrations on Neon branches before production
- Keep migrations small and focused
- Document what each migration does
- Test both up and down migrations
- Backup production data before migrations
- Use transactions for complex migrations

❌ **DON'T:**
- Modify existing migration files after applying to production
- Skip testing migrations on branches
- Run migrations without backups
- Remove down migrations
- Apply migrations directly to production without testing

## Support

- [Neon Documentation](https://neon.tech/docs)
- [Neon Branching](https://neon.tech/docs/guides/branching)
- [Neon CLI Reference](https://neon.tech/docs/reference/cli-reference)
