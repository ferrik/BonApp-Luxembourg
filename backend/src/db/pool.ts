import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('[db] ERROR: DATABASE_URL is not set. Check your .env file.')
  process.exit(1)
}

// Enable SSL for Render / cloud-hosted PostgreSQL
const useSSL = DATABASE_URL.includes('sslmode=require') || DATABASE_URL.includes('render.com')

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
})

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err)
})

export async function testConnection(): Promise<void> {
  const client = await pool.connect()
  const result = await client.query('SELECT NOW() as now')
  console.log('[db] Connected. Server time:', result.rows[0].now)
  client.release()
}
