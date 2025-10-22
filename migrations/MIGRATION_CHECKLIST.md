# Migration Checklist: Articles Table

Use this checklist when applying the articles table migration to ensure nothing is missed.

## Pre-Migration Checklist

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] DATABASE_URL configured in `.env.local`
- [ ] Neon CLI installed (`npm install -g neonctl`)
- [ ] Authenticated with Neon (`neonctl auth`)
- [ ] Project ID identified

### Verification
- [ ] Run verification script: `npm run migrate:verify`
- [ ] All checks pass (or only acceptable warnings)
- [ ] Can connect to database
- [ ] Have necessary database permissions

### Backup & Safety
- [ ] Database backup taken (if in production)
- [ ] Migration files reviewed:
  - [ ] `migrations/001_create_articles_table/up.sql`
  - [ ] `migrations/001_create_articles_table/down.sql`
- [ ] Migration plan documented
- [ ] Rollback plan documented

## Testing Phase (Neon Branch)

### Create Test Branch
- [ ] Create test branch: `neonctl branches create --name test-articles-migration --project-id <project-id>`
- [ ] Get branch connection string: `neonctl connection-string test-articles-migration --project-id <project-id>`
- [ ] Save connection string securely

### Apply Migration to Branch
- [ ] Set DATABASE_URL to branch connection string
- [ ] Run migration: `npm run migrate:articles:up`
- [ ] Migration completed successfully
- [ ] No errors in output
- [ ] Table structure verified

### Verify Migration on Branch
- [ ] Check table exists in database
- [ ] Verify all columns present
- [ ] Verify indexes created:
  - [ ] `idx_articles_created_time`
  - [ ] `idx_articles_author`
- [ ] Check column types match specification
- [ ] Insert test data successfully
- [ ] Query test data successfully
- [ ] Update test data successfully
- [ ] Delete test data successfully

### Test Application with Branch
- [ ] Update `.env.local` with branch DATABASE_URL
- [ ] Start dev server: `npm run dev`
- [ ] Application starts without errors
- [ ] No console errors related to articles table
- [ ] Can perform CRUD operations (if applicable)
- [ ] Application performance acceptable

### Test Rollback on Branch
- [ ] Run down migration: `npm run migrate:articles:down`
- [ ] Rollback completed successfully
- [ ] Table dropped successfully
- [ ] Indexes removed
- [ ] No orphaned objects

### Test Re-Application
- [ ] Run up migration again: `npm run migrate:articles:up`
- [ ] Migration completes successfully (idempotency check)
- [ ] Table structure correct
- [ ] All indexes present

## Production Deployment

### Pre-Deployment
- [ ] All testing phase checks passed
- [ ] Code changes committed and pushed
- [ ] Team notified of upcoming migration
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan reviewed and understood

### Apply Migration to Production
- [ ] Restore DATABASE_URL to production connection string
- [ ] Verify connected to production database: `echo $DATABASE_URL`
- [ ] **DOUBLE CHECK** you're on production (not branch)
- [ ] Run migration: `npm run migrate:articles:up`
- [ ] Migration completed successfully
- [ ] Table created successfully

### Post-Deployment Verification
- [ ] Verify table exists in production
- [ ] Check table structure matches expectations
- [ ] Verify indexes created
- [ ] Insert test record
- [ ] Query test record
- [ ] Delete test record
- [ ] Application can connect to table
- [ ] No errors in application logs

### Application Deployment
- [ ] Deploy application code that uses articles table
- [ ] Monitor application logs for errors
- [ ] Verify CRUD operations work
- [ ] Check application performance
- [ ] Monitor database performance

## Post-Migration

### Cleanup
- [ ] Delete test branch: `neonctl branches delete test-articles-migration --project-id <project-id>`
- [ ] Remove test environment files (`.env.test`)
- [ ] Clean up any temporary test scripts
- [ ] Update documentation if needed

### Monitoring
- [ ] Monitor database performance for 24-48 hours
- [ ] Check query performance on articles table
- [ ] Monitor index usage
- [ ] Check for any unexpected errors
- [ ] Review database metrics (connections, CPU, memory)

### Documentation
- [ ] Update application documentation
- [ ] Document any issues encountered
- [ ] Update team wiki/knowledge base
- [ ] Create runbook for future migrations
- [ ] Document lessons learned

## Rollback Procedure (If Needed)

### Immediate Rollback (If Migration Fails)
- [ ] Stop application (if running)
- [ ] Run rollback: `npm run migrate:articles:down`
- [ ] Verify table dropped
- [ ] Restart application
- [ ] Investigate and fix issues
- [ ] Re-test on branch before trying again

### Rollback After Deployment
- [ ] Assess impact and decide if rollback needed
- [ ] Notify team of rollback decision
- [ ] Deploy previous application version (if code changes made)
- [ ] Run rollback migration: `npm run migrate:articles:down`
- [ ] Verify rollback successful
- [ ] Test application functionality
- [ ] Document reason for rollback
- [ ] Plan corrective actions

## Emergency Contacts

**Database Administrator:** _________________________

**DevOps Lead:** _________________________

**Project Manager:** _________________________

**On-Call Engineer:** _________________________

## Notes & Observations

### Testing Phase
```
Date: _______________
Tester: _______________
Branch used: _______________
Issues found:




Resolution:




```

### Production Deployment
```
Date: _______________
Time: _______________
Deployed by: _______________
Migration duration: _______________
Issues encountered:




Resolution:




```

## Sign-Off

**Tested By:** _________________________  Date: _______________

**Reviewed By:** _________________________  Date: _______________

**Approved By:** _________________________  Date: _______________

**Deployed By:** _________________________  Date: _______________

---

## Quick Commands Reference

```bash
# Verify setup
npm run migrate:verify

# Create test branch
neonctl branches create --name test-articles-migration --project-id <project-id>

# Get branch connection
neonctl connection-string test-articles-migration --project-id <project-id>

# Apply migration
npm run migrate:articles:up

# Rollback migration
npm run migrate:articles:down

# Check table exists
node -e "const {neon}=require('@neondatabase/serverless');neon(process.env.DATABASE_URL)\`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='articles')\`.then(r=>console.log('Exists:',r[0].exists))"

# Delete test branch
neonctl branches delete test-articles-migration --project-id <project-id>
```

## Additional Resources

- [Migration README](./README.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Neon Documentation](https://neon.tech/docs)
- [Neon Branching Guide](https://neon.tech/docs/guides/branching)
