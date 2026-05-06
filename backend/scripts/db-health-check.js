const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

const useSSL = DATABASE_URL.includes('sslmode=require') || 
               DATABASE_URL.includes('render.com') || 
               DATABASE_URL.includes('supabase.co') || 
               DATABASE_URL.includes('supabase.com');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

async function checkHealth() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    console.log('SUCCESS: Connected to database. Server time:', result.rows[0].now);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('ERROR: Could not connect to database.');
    console.error(err);
    process.exit(1);
  }
}

checkHealth();
