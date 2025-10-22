# Neon Auth - Next.js Template App

This is a [Next.js](https://nextjs.org) project using the App Router that servers as template for the [Neon Auth](https://neon.tech/docs/guides/neon-identity) integration with [Stack Auth](https://docs.stack-auth.com/overview).

## Features

- Next.js with the App Router, TypeScript and Tailwind CSS
- User authentication powered by Stack Auth
- Integration with Neon Auth
- Database migration infrastructure with Neon branching support
- Ready-to-deploy configuration for Vercel, Netlify, and Render

## Prerequisites

- [Neon](https://neon.tech) account
- Node.js 18+ installed locally

## Local Development Setup

### 1. Set up Neon Auth

1. Create a new Neon project or use an existing one
2. Navigate into Neon Auth
3. Click "Connect" and go through the OAuth flow until your Neon Auth integration is set

### 2. Run the development server

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` file and copy the variables from the Neon Auth dashboard:

   ```
   # Stack Auth
   NEXT_PUBLIC_STACK_PROJECT_ID=
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=
   STACK_SECRET_SERVER_KEY=

   # Database connections
   DATABASE_URL=              # neondb_owner role connection
   ```

   > If you're using the [Neon native integration on Vercel](https://vercel.com/marketplace/neon), the integration automatically sets these environment variables for you in Vercel when you connect a Vercel project to a Neon database. [Learn more](https://neon.tech/docs/guides/vercel-native-integration#environment-variables-set-by-the-integration).

3. Run the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Migrations

This project includes a migration infrastructure for managing database schema changes safely.

### Running Migrations

```bash
# Apply the articles table migration
npm run migrate:articles:up

# Rollback the articles table migration
npm run migrate:articles:down

# Or use the generic migrate command
npm run migrate 001_create_articles_table up
```

### Safe Migration Testing with Neon Branching

For production safety, test migrations on a Neon branch first:

1. Install Neon CLI: `npm install -g neonctl`
2. Create a test branch: `neonctl branches create --name test-migration`
3. Get the branch connection string and test the migration
4. Apply to production after verification

See [migrations/TESTING_GUIDE.md](migrations/TESTING_GUIDE.md) for detailed step-by-step instructions.

### Migration Files

- **migrations/README.md** - Complete migration documentation
- **migrations/TESTING_GUIDE.md** - Step-by-step guide for testing with Neon branching
- **migrations/001_create_articles_table/** - Articles table migration
- **migrations/examples/** - Example code for using the articles table

## Learn More

- [Neon Auth Documentation](https://neon.tech/docs/guides/neon-identity)
- [Stack Auth Documentation](https://docs.stack-auth.com/)
- [Neon Branching Guide](https://neon.tech/docs/guides/branching)

## Authors

- [Pedro Figueiredo](https://github.com/pffigueiredo)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
