#!/usr/bin/env node

/**
 * Verify Migration Infrastructure
 * 
 * This script verifies that the migration infrastructure is set up correctly
 * and can connect to the database.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Migration Infrastructure...\n');

let errors = 0;
let warnings = 0;

// Check 1: Required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'migrations/run-migration.js',
  'migrations/README.md',
  'migrations/TESTING_GUIDE.md',
  'migrations/QUICK_REFERENCE.md',
  'migrations/001_create_articles_table/up.sql',
  'migrations/001_create_articles_table/down.sql',
  'migrations/examples/article-operations.ts',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - NOT FOUND`);
    errors++;
  }
});

// Check 2: DATABASE_URL environment variable
console.log('\n🔐 Checking environment configuration...');
if (process.env.DATABASE_URL) {
  console.log('  ✅ DATABASE_URL is set');
  
  // Check if it's a valid Neon URL
  if (process.env.DATABASE_URL.includes('neon.tech')) {
    console.log('  ✅ Using Neon database');
  } else {
    console.log('  ⚠️  Not a Neon URL (this is OK for testing)');
    warnings++;
  }
} else {
  console.log('  ⚠️  DATABASE_URL is not set');
  console.log('     Set it in .env.local to run migrations');
  warnings++;
}

// Check 3: Node modules
console.log('\n📦 Checking dependencies...');
try {
  require('@neondatabase/serverless');
  console.log('  ✅ @neondatabase/serverless installed');
} catch (e) {
  console.log('  ❌ @neondatabase/serverless not found');
  console.log('     Run: npm install');
  errors++;
}

// Check 4: Migration script is executable
console.log('\n🔧 Checking migration script permissions...');
const migrationScript = path.join(__dirname, '..', 'migrations', 'run-migration.js');
try {
  const stats = fs.statSync(migrationScript);
  if (stats.mode & fs.constants.S_IXUSR) {
    console.log('  ✅ Migration script is executable');
  } else {
    console.log('  ⚠️  Migration script is not executable');
    console.log('     Run: chmod +x migrations/run-migration.js');
    warnings++;
  }
} catch (e) {
  console.log('  ❌ Cannot check script permissions');
  errors++;
}

// Check 5: Package.json scripts
console.log('\n📝 Checking npm scripts...');
try {
  const packageJson = require(path.join(__dirname, '..', 'package.json'));
  const requiredScripts = [
    'migrate',
    'migrate:articles:up',
    'migrate:articles:down'
  ];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ npm run ${script}`);
    } else {
      console.log(`  ❌ npm run ${script} - NOT FOUND`);
      errors++;
    }
  });
} catch (e) {
  console.log('  ❌ Cannot read package.json');
  errors++;
}

// Check 6: SQL file syntax (basic check)
console.log('\n🔍 Validating SQL files...');
const sqlFiles = [
  'migrations/001_create_articles_table/up.sql',
  'migrations/001_create_articles_table/down.sql'
];

sqlFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.trim().length > 0) {
      console.log(`  ✅ ${file} (${content.length} bytes)`);
    } else {
      console.log(`  ❌ ${file} - EMPTY FILE`);
      errors++;
    }
  } catch (e) {
    console.log(`  ❌ ${file} - CANNOT READ`);
    errors++;
  }
});

// Check 7: Test database connection (if DATABASE_URL is set)
console.log('\n🔌 Testing database connection...');
if (process.env.DATABASE_URL) {
  (async () => {
    try {
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);
      
      // Simple query to test connection
      await sql`SELECT 1 as test`;
      console.log('  ✅ Database connection successful');
      
      // Check if articles table exists
      const [result] = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'articles'
        )
      `;
      
      if (result.exists) {
        console.log('  ℹ️  Articles table already exists');
        console.log('     Run: npm run migrate:articles:down (to drop)');
      } else {
        console.log('  ℹ️  Articles table does not exist yet');
        console.log('     Run: npm run migrate:articles:up (to create)');
      }
      
      printSummary();
    } catch (e) {
      console.log('  ❌ Database connection failed:', e.message);
      errors++;
      printSummary();
    }
  })();
} else {
  console.log('  ⏭️  Skipped (DATABASE_URL not set)');
  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  
  if (errors === 0 && warnings === 0) {
    console.log('✅ All checks passed!');
    console.log('\n🚀 You can now run migrations:');
    console.log('   npm run migrate:articles:up');
  } else {
    if (errors > 0) {
      console.log(`❌ ${errors} error(s) found`);
    }
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warning(s) found`);
    }
    console.log('\n📖 Please review the output above and fix any issues.');
  }
  
  console.log('\n📚 Documentation:');
  console.log('   migrations/README.md - Complete guide');
  console.log('   migrations/TESTING_GUIDE.md - Testing with Neon');
  console.log('   migrations/QUICK_REFERENCE.md - Quick commands');
  
  if (errors > 0) {
    process.exit(1);
  }
}
