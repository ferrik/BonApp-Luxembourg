import { pool } from '../db/pool'

async function checkDatabaseHealth() {
  console.log('🔄 Checking database connection health...')
  try {
    const client = await pool.connect()
    console.log('✅ Successfully connected to the database pool.')
    
    // Check basic query execution
    const timeRes = await client.query('SELECT NOW() as now')
    console.log('✅ Database time query successful:', timeRes.rows[0].now)

    // Check tables existence
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    const tables = tablesRes.rows.map(row => row.table_name)
    console.log(`✅ Found ${tables.length} tables in the public schema.`)
    console.log('   Tables:', tables.join(', '))

    // Make sure 'restaurants' table exists
    if (tables.includes('restaurants')) {
      const countRes = await client.query('SELECT COUNT(*) FROM restaurants')
      console.log(`✅ Table 'restaurants' has ${countRes.rows[0].count} records.`)
    } else {
      console.warn('⚠️  Table "restaurants" not found! Did you run the migrations?')
    }

    client.release()
    console.log('✅ Health check completed successfully.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Database health check failed!')
    console.error(err)
    process.exit(1)
  }
}

checkDatabaseHealth()
