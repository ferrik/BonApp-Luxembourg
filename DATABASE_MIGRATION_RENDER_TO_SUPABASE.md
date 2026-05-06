# PostgreSQL Migration Guide: Render to Supabase

This guide provides a safe process for migrating the database from Render PostgreSQL to Supabase PostgreSQL without losing existing data or modifying application logic.

## A. Pre-migration checklist
- [ ] You have access to the Render Dashboard and the current `DATABASE_URL`.
- [ ] You have created a Supabase account and have access to `database.new`.
- [ ] You have `pg_dump` and `psql` installed locally.
- [ ] You have warned team members not to push updates during migration.

## B. How to export Render database using pg_dump
Run this command from your local terminal. Replace `OLD_RENDER_DATABASE_URL` with the actual connection string from your Render settings.

```bash
pg_dump "OLD_RENDER_DATABASE_URL" --no-owner --no-privileges --format=plain --file=backup.sql
```

## C. How to create Supabase project
1. Go to [database.new](https://database.new) and create a new project.
2. Select an appropriate region (e.g., Frankfurt to stay close to Render).
3. Save the database password securely.
4. Go to **Settings > Database** and copy the **Connection string (URI)**. (Ensure you check "Use connection pooling" and port 6543 for serverless).

## D. How to import backup into Supabase using psql
Replace `NEW_SUPABASE_DATABASE_URL` with the Transaction pooler string you copied.

```bash
psql "NEW_SUPABASE_DATABASE_URL" < backup.sql
```

## E. How to update DATABASE_URL in Render backend environment variables
1. In the Render Dashboard, go to your backend web service.
2. Go to **Environment** settings.
3. Update the `DATABASE_URL` key with your new Supabase connection string.
4. Keep `NODE_ENV`, `PORT`, and `FRONTEND_URL` as they are.

## F. How to redeploy backend
Render will usually trigger an automatic redeployment when environment variables are saved. If it does not:
- Click **Manual Deploy > Deploy latest commit** in the Render interface.

## G. How to test /api/health/db
Once the deployment is complete, verify the connections:
1. Run the new local health script:
   ```bash
   cd backend
   npm run db:health
   ```
2. Visit your deployed endpoints to ensure the backend reads data properly:
   - `GET /api/health`
   - `GET /api/health/db`
   - `GET /api/restaurants`

## H. Rollback plan
If the new Supabase instance fails to connect or serve data:
1. Revert the `DATABASE_URL` in Render back to the old Render PostgreSQL string.
2. Manually redeploy the backend service.
3. Wait for the deploy to finish and verify `/api/health/db` again.

## I. Common errors and fixes
- **SSL Connection Errors**: Supabase requires SSL. Ensure your `DATABASE_URL` appends `?pgbouncer=true` if using the pooler port 6543, and ensure the backend connection pool passes `{ rejectUnauthorized: false }` for SSL.
- **Connection pooling limits**: Always use the pooler string (port 6543) instead of direct connection (port 5432) for Node.js backends to prevent exhausting the DB connections.
- **pg_dump version mismatch**: Ensure your local `pg_dump` tool version matches or is newer than the Render database version.
