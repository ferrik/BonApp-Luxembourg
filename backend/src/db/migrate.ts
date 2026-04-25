/**
 * migrate.ts — applies schema.starter.sql to the connected PostgreSQL database.
 * Run with: npm run db:migrate
 */
import fs from 'fs'
import path from 'path'
import { pool, testConnection } from './pool'

async function migrate(): Promise<void> {
  await testConnection()

  const schemaPath = path.join(__dirname, 'schema.starter.sql')
  const sql = fs.readFileSync(schemaPath, 'utf8')

  console.log('[migrate] Applying schema...')
  await pool.query(sql)
  console.log('[migrate] Schema applied successfully.')

  await pool.end()
}

migrate().catch((err) => {
  console.error('[migrate] Failed:', err)
  process.exit(1)
})
