/**
 * import-restaurants.ts
 * Imports restaurants from DATA_SEED.json into PostgreSQL.
 * Run: npx ts-node src/scripts/import-restaurants.ts
 *
 * Rules:
 * - Idempotent: skips duplicates by name + city
 * - Never overwrites manually edited records (verified/active status)
 * - Missing values stored as null, not invented
 * - Sets verification_status = 'pending' unless provided
 */
import fs from 'fs'
import path from 'path'
import { pool, testConnection } from '../db/pool'

interface RestaurantInput {
  name: string
  city?: string | null
  commune?: string | null
  cluster?: string | null
  address?: string | null
  phone?: string | null
  website_url?: string | null
  delivery_url?: string | null
  cuisine_primary?: string | null
  cuisine_secondary?: string | null
  own_delivery?: boolean | null
  pickup?: boolean | null
  direct_ordering?: boolean | null
  third_party?: boolean | null
  min_order_eur?: number | null
  delivery_fee_eur?: number | null
  delivery_zone_notes?: string | null
  source_name?: string | null
  source_url?: string | null
  verification_status?: string | null
  partner_status?: string | null
  billing_enabled?: boolean | null
  pricing_plan?: string | null
  notes?: string | null
}

const ALLOWED_VERIFICATION = ['pending', 'verified', 'inferred', 'unverified', 'needs_verification']
const ALLOWED_PARTNER = ['new', 'contacted', 'interested', 'follow_up', 'trial', 'active', 'premium', 'paused', 'onboarded', 'rejected']
const ALLOWED_PLAN = ['free', 'per_click', 'subscription', 'hybrid']
const ALLOWED_CUISINE = ['Italian', 'Asian', 'Burger', 'Kebab', 'Local', 'Healthy', 'Indian', 'Other']

function normalize(row: RestaurantInput): RestaurantInput {
  return {
    name: row.name?.trim(),
    city: row.city?.trim() ?? null,
    commune: row.commune?.trim() ?? null,
    cluster: row.cluster?.trim() ?? null,
    address: row.address?.trim() ?? null,
    phone: row.phone?.trim() ?? null,
    website_url: row.website_url?.trim() ?? null,
    delivery_url: row.delivery_url?.trim() ?? null,
    cuisine_primary: ALLOWED_CUISINE.includes(row.cuisine_primary ?? '')
      ? row.cuisine_primary
      : 'Other',
    cuisine_secondary: row.cuisine_secondary?.trim() ?? null,
    own_delivery: row.own_delivery ?? false,
    pickup: row.pickup ?? false,
    direct_ordering: row.direct_ordering ?? false,
    third_party: row.third_party ?? false,
    min_order_eur: row.min_order_eur ?? null,
    delivery_fee_eur: row.delivery_fee_eur ?? null,
    delivery_zone_notes: row.delivery_zone_notes?.trim() ?? null,
    source_name: row.source_name?.trim() ?? null,
    source_url: row.source_url?.trim() ?? null,
    verification_status: ALLOWED_VERIFICATION.includes(row.verification_status ?? '')
      ? row.verification_status
      : 'pending',
    partner_status: ALLOWED_PARTNER.includes(row.partner_status ?? '')
      ? row.partner_status
      : 'new',
    billing_enabled: row.billing_enabled ?? false,
    pricing_plan: ALLOWED_PLAN.includes(row.pricing_plan ?? '')
      ? row.pricing_plan
      : 'free',
    notes: row.notes?.trim() ?? null,
  }
}

async function importRestaurants(): Promise<void> {
  await testConnection()

  // Look for DATA_SEED.json in project root (two levels up from src/scripts/)
  const seedPath = path.resolve(__dirname, '../../../../DATA_SEED.json')
  const fallbackPath = path.resolve(__dirname, '../../../DATA_SEED.json')

  let resolvedPath: string
  if (fs.existsSync(seedPath)) {
    resolvedPath = seedPath
  } else if (fs.existsSync(fallbackPath)) {
    resolvedPath = fallbackPath
  } else {
    console.error('[import] ERROR: DATA_SEED.json not found.')
    console.error('  Expected at project root: BonApp_Luxembourg_OS/DATA_SEED.json')
    process.exit(1)
  }

  console.log(`[import] Reading from: ${resolvedPath}`)
  const raw = fs.readFileSync(resolvedPath, 'utf8')
  const records: RestaurantInput[] = JSON.parse(raw)

  console.log(`[import] Found ${records.length} records in JSON`)

  let inserted = 0
  let skipped = 0
  let errors = 0
  const skippedNames: string[] = []
  const errorNames: string[] = []

  for (const record of records) {
    if (!record.name) {
      console.warn('[import] SKIP: record missing name:', JSON.stringify(record))
      errors++
      errorNames.push('(no name)')
      continue
    }

    const r = normalize(record)

    try {
      // Duplicate check: name + city
      const existing = await pool.query(
        'SELECT id, verification_status, partner_status FROM restaurants WHERE LOWER(name) = LOWER($1) AND LOWER(COALESCE(city, \'\')) = LOWER(COALESCE($2, \'\'))',
        [r.name, r.city]
      )

      if (existing.rows.length > 0) {
        const found = existing.rows[0]
        // Never overwrite manually verified or active records
        const isProtected = ['verified', 'active', 'premium', 'trial'].includes(found.verification_status) ||
                            ['active', 'premium', 'trial'].includes(found.partner_status)
        if (isProtected) {
          console.log(`[import] PROTECTED (skip): ${r.name} (${r.city}) — status: ${found.verification_status}`)
        } else {
          console.log(`[import] SKIP (duplicate): ${r.name} (${r.city})`)
        }
        skipped++
        skippedNames.push(`${r.name} (${r.city ?? 'no city'})`)
        continue
      }

      await pool.query(
        `INSERT INTO restaurants (
          name, city, commune, cluster, address, phone,
          website_url, delivery_url, cuisine_primary, cuisine_secondary,
          own_delivery, pickup, direct_ordering, third_party,
          min_order_eur, delivery_fee_eur, delivery_zone_notes,
          source_name, source_url, verification_status,
          partner_status, billing_enabled, pricing_plan, notes
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24
        )`,
        [
          r.name, r.city, r.commune, r.cluster, r.address, r.phone,
          r.website_url, r.delivery_url, r.cuisine_primary, r.cuisine_secondary,
          r.own_delivery, r.pickup, r.direct_ordering, r.third_party,
          r.min_order_eur, r.delivery_fee_eur, r.delivery_zone_notes,
          r.source_name, r.source_url, r.verification_status,
          r.partner_status, r.billing_enabled, r.pricing_plan, r.notes,
        ]
      )

      console.log(`[import] OK: ${r.name} (${r.city ?? 'no city'}) — ${r.cuisine_primary}`)
      inserted++
    } catch (err) {
      console.error(`[import] ERROR inserting "${r.name}":`, err)
      errors++
      errorNames.push(r.name ?? '?')
    }
  }

  // Summary
  console.log('\n=== Import Summary ===')
  console.log(`  Total in JSON : ${records.length}`)
  console.log(`  Inserted      : ${inserted}`)
  console.log(`  Skipped       : ${skipped}`)
  console.log(`  Errors        : ${errors}`)

  if (skippedNames.length > 0) {
    console.log(`\n  Skipped records:`)
    skippedNames.forEach((n) => console.log(`    - ${n}`))
  }
  if (errorNames.length > 0) {
    console.log(`\n  Failed records:`)
    errorNames.forEach((n) => console.log(`    - ${n}`))
  }

  // DB stats
  const countResult = await pool.query('SELECT COUNT(*) FROM restaurants')
  console.log(`\n  Total restaurants in DB: ${countResult.rows[0].count}`)

  const cuisineResult = await pool.query(
    'SELECT cuisine_primary, COUNT(*) FROM restaurants GROUP BY cuisine_primary ORDER BY COUNT(*) DESC'
  )
  console.log('\n  By cuisine:')
  cuisineResult.rows.forEach((row) => {
    console.log(`    ${row.cuisine_primary ?? 'null'}: ${row.count}`)
  })

  const statusResult = await pool.query(
    'SELECT verification_status, COUNT(*) FROM restaurants GROUP BY verification_status'
  )
  console.log('\n  By verification_status:')
  statusResult.rows.forEach((row) => {
    console.log(`    ${row.verification_status}: ${row.count}`)
  })

  await pool.end()
}

importRestaurants().catch((err) => {
  console.error('[import] Fatal error:', err)
  process.exit(1)
})
