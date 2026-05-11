const { Pool } = require('pg');
const fs = require('fs');

const RENDER_URL = process.env.RENDER_DATABASE_URL || process.env.DATABASE_URL;

if (!RENDER_URL) {
  console.error('ERROR: Set RENDER_DATABASE_URL or DATABASE_URL before running export-data.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: RENDER_URL,
  ssl: { rejectUnauthorized: false }
});

async function exportData() {
  console.log('🔄 Підключення до Render...');
  try {
    const client = await pool.connect();
    
    console.log('📥 Завантаження ресторанів...');
    const resRestaurants = await client.query('SELECT * FROM restaurants ORDER BY id ASC');
    
    console.log('📥 Завантаження партнерських заявок...');
    const resApplications = await client.query('SELECT * FROM partner_applications ORDER BY id ASC');

    console.log('📥 Завантаження кліків...');
    const resClicks = await client.query('SELECT * FROM restaurant_clicks ORDER BY id ASC');

    console.log('📥 Завантаження денної статистики...');
    const resUsage = await client.query('SELECT * FROM restaurant_usage_daily ORDER BY id ASC');

    const backup = {
      restaurants: resRestaurants.rows,
      partner_applications: resApplications.rows,
      restaurant_clicks: resClicks.rows,
      restaurant_usage_daily: resUsage.rows
    };

    fs.writeFileSync('backup.json', JSON.stringify(backup, null, 2));
    
    console.log('✅ УСПІХ! Всі дані успішно збережено у файл backup.json');
    console.log(`📊 Статистика:`);
    console.log(`- Ресторани: ${backup.restaurants.length}`);
    console.log(`- Заявки партнерів: ${backup.partner_applications.length}`);
    console.log(`- Кліки: ${backup.restaurant_clicks.length}`);
    console.log(`- Денна статистика: ${backup.restaurant_usage_daily.length}`);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Помилка під час експорту:');
    console.error(err);
    process.exit(1);
  }
}

exportData();

