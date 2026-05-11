const { Pool } = require('pg');
const fs = require('fs');

// Читаємо URL з аргументів командного рядка
const SUPABASE_URL = process.argv[2];

if (!SUPABASE_URL) {
  console.error('❌ ПОМИЛКА: Ви не вказали посилання на Supabase!');
  console.log('Приклад: node scripts/import-data.js "postgresql://postgres:пароль@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importData() {
  if (!fs.existsSync('backup.json')) {
    console.error('❌ ПОМИЛКА: Файл backup.json не знайдено!');
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync('backup.json', 'utf8'));
  console.log('🔄 Підключення до Supabase...');

  try {
    const client = await pool.connect();
    
    // Спочатку створюємо таблиці, використовуючи файл схеми
    console.log('🏗️ Створення таблиць...');
    const schemaSql = fs.readFileSync('src/db/schema.starter.sql', 'utf8').replace(/^\uFEFF/, '');
    await client.query(schemaSql);

    console.log('🔧 Додавання відсутніх колонок (міграції)...');
    const migrationSql = `
      DO $$ BEGIN ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS opening_hours TEXT; EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS image_url TEXT; EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS pexels_url TEXT; EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_hours TEXT; EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_url    TEXT;        EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS pexels_url   TEXT;        EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_source TEXT DEFAULT 'placeholder'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_status TEXT DEFAULT 'missing';     EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS vibe         TEXT;        EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS seating      TEXT;        EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS parking      BOOLEAN DEFAULT false; EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS scenario     TEXT[];      EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS lat          NUMERIC(10,7); EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS lng          NUMERIC(10,7); EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS price_range  INT DEFAULT 2; EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS group_size_max INT DEFAULT 10; EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS hours        JSONB;       EXCEPTION WHEN OTHERS THEN NULL; END $$;
      DO $$ BEGIN ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS verified     BOOLEAN DEFAULT false; EXCEPTION WHEN OTHERS THEN NULL; END $$;
    `;
    await client.query(migrationSql);

    console.log('📤 Імпорт ресторанів...');
    for (const r of backup.restaurants) {
      // Escape and insert
      const keys = Object.keys(r);
      const values = Object.values(r);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO restaurants (${keys.join(', ')}) 
        VALUES (${placeholders})
        ON CONFLICT (id) DO NOTHING
      `, values);
    }

    // Оновлюємо лічильник автоінкременту (SERIAL)
    if (backup.restaurants.length > 0) {
      const maxId = Math.max(...backup.restaurants.map(r => r.id));
      await client.query(`SELECT setval('restaurants_id_seq', ${maxId})`);
    }

    console.log('📤 Імпорт заявок партнерів...');
    for (const a of backup.partner_applications) {
      const keys = Object.keys(a);
      const values = Object.values(a);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO partner_applications (${keys.join(', ')}) 
        VALUES (${placeholders})
        ON CONFLICT (id) DO NOTHING
      `, values);
    }
    if (backup.partner_applications.length > 0) {
      const maxId = Math.max(...backup.partner_applications.map(r => r.id));
      await client.query(`SELECT setval('partner_applications_id_seq', ${maxId})`);
    }

    console.log('📤 Імпорт кліків (це може зайняти хвилину)...');
    for (const c of backup.restaurant_clicks) {
      const keys = Object.keys(c);
      const values = Object.values(c);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO restaurant_clicks (${keys.join(', ')}) 
        VALUES (${placeholders})
        ON CONFLICT (id) DO NOTHING
      `, values);
    }
    if (backup.restaurant_clicks.length > 0) {
      const maxId = Math.max(...backup.restaurant_clicks.map(r => r.id));
      await client.query(`SELECT setval('restaurant_clicks_id_seq', ${maxId})`);
    }

    console.log('📤 Імпорт денної статистики...');
    for (const u of backup.restaurant_usage_daily) {
      const keys = Object.keys(u);
      const values = Object.values(u);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO restaurant_usage_daily (${keys.join(', ')}) 
        VALUES (${placeholders})
        ON CONFLICT (id) DO NOTHING
      `, values);
    }
    if (backup.restaurant_usage_daily.length > 0) {
      const maxId = Math.max(...backup.restaurant_usage_daily.map(r => r.id));
      await client.query(`SELECT setval('restaurant_usage_daily_id_seq', ${maxId})`);
    }

    console.log('✅ УСПІХ! Всі дані успішно мігровано на Supabase!');
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Помилка під час імпорту:');
    console.error(err);
    process.exit(1);
  }
}

importData();
