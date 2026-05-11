const { Pool } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!SUPABASE_URL) {
  console.error('ERROR: Set SUPABASE_DATABASE_URL or DATABASE_URL before running v4-data-update.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runDataUpdate() {
  console.log('🔄 Підключення до бази даних...');
  const client = await pool.connect();

  try {
    // Step 3: Vibe auto-assignment
    console.log('🏷️ Виконання автопризначення vibe...');
    await client.query(`
      UPDATE restaurants SET vibe = CASE
        WHEN LOWER(COALESCE(cuisine_primary,'')) SIMILAR TO '%(kebab|fast.food|snack|friterie)%'          THEN 'fast'
        WHEN LOWER(COALESCE(cuisine_primary,'')) SIMILAR TO '%(cafe|coffee|salon.de.the|tea|dessert)%'    THEN 'casual'
        WHEN LOWER(COALESCE(cuisine_primary,'')) SIMILAR TO '%(gastronomique|fine.dining|luxury|etoile)%' THEN 'premium'
        WHEN LOWER(COALESCE(cuisine_primary,'')) SIMILAR TO '%(bistro|brasserie|restaurant|taverne)%'     THEN 'cozy'
        ELSE 'casual'
      END
      WHERE vibe IS NULL;
    `);

    // Step 5: Remove fake restaurant records
    console.log('🗑️ Видалення фейкових тестових записів (якщо є)...');
    // We assume fake records might have obvious names or no phone/address, but it's risky to delete blindly.
    // The prompt says "Remove fake restaurant records without real phone + address"
    await client.query(`
      DELETE FROM restaurants 
      WHERE (phone IS NULL OR phone = '') 
        AND (address IS NULL OR address = '') 
        AND verification_status = 'unverified';
    `);

    // Step 4: Data quality check
    console.log('📊 Перевірка якості даних...');
    const qc = await client.query(`
      SELECT
        COUNT(*)         AS total,
        COUNT(phone)     AS has_phone,
        COUNT(lat)       AS has_coords,
        COUNT(website_url) AS has_website,
        COUNT(image_url) AS has_image,
        COUNT(*) FILTER (WHERE verified = true) AS verified_count
      FROM restaurants;
    `);
    
    const row = qc.rows[0];
    console.log('Результат перевірки:', row);
    
    if (Number(row.total) < 20) {
      console.warn('⚠️ WARNING: < 20 restaurants. Launch readiness: LOW.');
    } else {
      console.log('✅ Launch readiness: HIGH (>= 20 restaurants)');
    }

  } catch (err) {
    console.error('❌ Помилка:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runDataUpdate();

