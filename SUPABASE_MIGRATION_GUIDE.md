# Supabase Migration Guide

This document outlines the steps required to migrate the PostgreSQL database from **Render** to **Supabase** without losing data or breaking the application.

## Prerequisites
1. Ensure you have created a Supabase project at [database.new](https://database.new).
2. Install `pg_dump` and `pg_restore` locally, or ensure you have access to a PostgreSQL client capable of taking and restoring backups.
3. Keep both your existing Render DB URL and your new Supabase DB URL handy.

## Step 1: Prevent New Writes
To ensure data consistency during the migration, you should prevent new data from being written.
- If possible, put the frontend application into maintenance mode.
- Alternatively, temporarily pause the backend deployment on Render or Vercel.

## Step 2: Backup the Render Database
Run the following command to export your current database from Render.
*Replace `<RENDER_DB_URL>` with your actual Render Connection String.*

```bash
pg_dump --clean --if-exists --quote-all-identifiers \
  --no-owner --no-privileges \
  --dbname="<RENDER_DB_URL>" \
  -f bonapp_backup.sql
```

## Step 3: Restore to Supabase
Run the following command to import the SQL backup into your new Supabase database.
*Replace `<SUPABASE_DB_URL>` with your Supabase Transaction connection string (e.g., Session mode connection string on port 5432).*

```bash
psql --dbname="<SUPABASE_DB_URL>" -f bonapp_backup.sql
```

## Step 4: Verify the Migration
Update your local `.env` file in the `backend/` directory to point to Supabase:
```env
DATABASE_URL="postgresql://postgres.yourprojectref:yourpassword@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Run the new health check script to verify the connection and table integrity:
```bash
cd backend
npm run db:healthcheck
```
You should see successful outputs indicating the tables and records match your expectations.

## Step 5: Update Production Environment Variables
Once verified locally:
1. Go to your backend hosting provider (e.g., Render Dashboard).
2. Update the `DATABASE_URL` environment variable to your new Supabase connection string. **Make sure to use the Connection Pooler URL (port 6543) for Node.js serverless/cloud environments to prevent exhausting connections.**
3. Restart the backend service.

## Important Notes for Supabase
- Supabase connections use SSL by default. The `pool.ts` configuration is already updated to automatically inject `{ rejectUnauthorized: false }` when it detects `supabase` in the `DATABASE_URL`.
- If you run into issues connecting to the pooler, ensure `?pgbouncer=true` is appended to your connection string.
