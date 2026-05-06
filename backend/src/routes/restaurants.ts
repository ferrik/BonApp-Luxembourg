import { Router, Request, Response } from 'express'
import { pool } from '../db/pool'

const router = Router()

const ALLOWED_CUISINES = ['Italian', 'Asian', 'Burger', 'Kebab', 'Local', 'Healthy', 'Indian', 'Other']
const ALLOWED_SCENARIOS = ['dinner', 'coffee', 'drinks', 'quick']

// Compute a ranking score for a restaurant row given optional filters
function computeScore(
  row: Record<string, unknown>,
  scenario?: string,
  city?: string,
  priceRange?: number,
  groupSize?: number,
): number {
  let score = 0
  if (row.image_url || row.pexels_url)                     score += 3
  if (row.phone)                                           score += 2
  if (row.website_url)                                     score += 1
  if (scenario && Array.isArray(row.scenario) && (row.scenario as string[]).includes(scenario)) score += 2
  if (city && typeof row.city === 'string' && row.city.toLowerCase().includes(city.toLowerCase())) score += 1
  if (priceRange != null && Number(row.price_range) === priceRange)  score += 2
  if (groupSize != null && Number(row.group_size_max) >= groupSize)  score += 1
  if (row.verified === true)                               score += 2
  return score
}

// GET /api/restaurants/cities — returns distinct non-null cities ordered alphabetically
router.get('/cities', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT city FROM restaurants
       WHERE city IS NOT NULL AND city <> ''
         AND partner_status NOT IN ('paused', 'rejected')
       ORDER BY city ASC`
    )
    const cities: string[] = result.rows.map((r: { city: string }) => r.city)
    res.json(cities)
  } catch (err) {
    console.error('[restaurants] GET /cities error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/restaurants
// Query params:
//   cuisine  — legacy cuisine filter (still works for admin)
//   scenario — 'dinner'|'coffee'|'drinks'|'quick'
//   city     — city name filter
//   price_range — 1|2|3
//   group_size  — 1|3|4
//   limit    — default 3 (capped at 200 for admin)
//   admin    — bypass filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const cuisine    = req.query.cuisine    as string | undefined
    const scenario   = req.query.scenario   as string | undefined
    const city       = req.query.city       as string | undefined
    const priceRange = req.query.price_range ? Number(req.query.price_range) : undefined
    const groupSize  = req.query.group_size  ? Number(req.query.group_size)  : undefined
    const requestedLimit = Number(req.query.limit) || 3
    const isAdmin = req.query.admin === 'true'
    const limit = Math.min(requestedLimit, 200)

    // Admin path: simple filter + newest first (no scoring)
    if (isAdmin) {
      let query = 'SELECT * FROM restaurants WHERE 1=1'
      const values: (string | number)[] = []
      let idx = 1

      if (cuisine && ALLOWED_CUISINES.includes(cuisine)) {
        query += ` AND cuisine_primary ILIKE $${idx++}`
        values.push(`%${cuisine}%`)
      }
      if (city) {
        query += ` AND city ILIKE $${idx++}`
        values.push(`%${city}%`)
      }
      query += ` ORDER BY id DESC LIMIT $${idx}`
      values.push(limit)
      const result = await pool.query(query, values)
      res.json(result.rows)
      return
    }

    // ── User path: fetch all visible restaurants, then apply 5-level fallback ──
    const base = `SELECT * FROM restaurants WHERE partner_status NOT IN ('paused', 'rejected')`
    const all = await pool.query(base)
    const rows: Record<string, unknown>[] = all.rows

    // Helper: score + sort desc, take N
    function pickTop(candidates: Record<string, unknown>[], n = 3) {
      return candidates
        .map(r => ({ r, s: computeScore(r, scenario, city, priceRange, groupSize) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, n)
        .map(x => x.r)
    }

    // 5-level fallback — never return fewer than 3
    let picked: Record<string, unknown>[] = []
    let isFallback = false

    // Level 1: city + scenario match
    if (city && scenario) {
      const l1 = rows.filter(r =>
        typeof r.city === 'string' && r.city.toLowerCase().includes(city.toLowerCase()) &&
        Array.isArray(r.scenario) && (r.scenario as string[]).includes(scenario)
      )
      if (l1.length >= 3) { picked = pickTop(l1); }
    }

    // Level 2: city only
    if (picked.length < 3 && city) {
      const l2 = rows.filter(r =>
        typeof r.city === 'string' && r.city.toLowerCase().includes(city.toLowerCase())
      )
      if (l2.length >= 3) { picked = pickTop(l2); isFallback = true }
    }

    // Level 3: scenario only (any city)
    if (picked.length < 3 && scenario) {
      const l3 = rows.filter(r =>
        Array.isArray(r.scenario) && (r.scenario as string[]).includes(scenario)
      )
      if (l3.length >= 3) { picked = pickTop(l3); isFallback = true }
    }

    // Level 4: any 3 verified restaurants
    if (picked.length < 3) {
      const l4 = rows.filter(r => r.verified === true)
      if (l4.length >= 3) { picked = pickTop(l4); isFallback = true }
    }

    // Level 5: any 3 restaurants
    if (picked.length < 3) {
      picked = pickTop(rows); isFallback = true
    }

    // Also handle legacy cuisine param (still used in some flows)
    if (picked.length === 0 && cuisine && ALLOWED_CUISINES.includes(cuisine)) {
      const byCuisine = rows.filter(r =>
        typeof r.cuisine_primary === 'string' &&
        r.cuisine_primary.toLowerCase().includes(cuisine.toLowerCase())
      )
      picked = pickTop(byCuisine.length >= 3 ? byCuisine : rows)
      isFallback = byCuisine.length < 3
    }

    // Tag fallback cards so frontend can show "Best nearby option"
    const response = picked.slice(0, 3).map(r => ({ ...r, _is_fallback: isFallback }))
    res.json(response)
  } catch (err) {
    console.error('[restaurants] GET / error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/restaurants/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid restaurant id' })
      return
    }

    const result = await pool.query('SELECT * FROM restaurants WHERE id = $1', [id])
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Restaurant not found' })
      return
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('[restaurants] GET /:id error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/restaurants — admin use only (no auth in MVP)
// TODO: add authentication before production
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name, city, commune, cluster, address, phone,
      website_url, delivery_url, cuisine_primary, cuisine_secondary,
      own_delivery, pickup, direct_ordering, third_party,
      min_order_eur, delivery_fee_eur, delivery_zone_notes,
      source_name, source_url, verification_status,
      partner_status, billing_enabled, pricing_plan, notes,
      image_url, pexels_url, image_source, image_status, vibe, seating, parking,
      scenario, lat, lng, price_range, group_size_max, hours, verified,
    } = req.body

    if (!name) {
      res.status(400).json({ error: 'name is required' })
      return
    }

    const result = await pool.query(
      `INSERT INTO restaurants (
        name, city, commune, cluster, address, phone,
        website_url, delivery_url, cuisine_primary, cuisine_secondary,
        own_delivery, pickup, direct_ordering, third_party,
        min_order_eur, delivery_fee_eur, delivery_zone_notes,
        source_name, source_url, verification_status,
        partner_status, billing_enabled, pricing_plan, notes,
        image_url, pexels_url, image_source, image_status, vibe, seating, parking,
        scenario, lat, lng, price_range, group_size_max, hours, verified
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37,$38
      ) RETURNING *`,
      [
        name, city ?? null, commune ?? null, cluster ?? null, address ?? null, phone ?? null,
        website_url ?? null, delivery_url ?? null, cuisine_primary ?? null, cuisine_secondary ?? null,
        own_delivery ?? false, pickup ?? false, direct_ordering ?? false, third_party ?? false,
        min_order_eur ?? null, delivery_fee_eur ?? null, delivery_zone_notes ?? null,
        source_name ?? null, source_url ?? null, verification_status ?? 'pending',
        partner_status ?? 'new', billing_enabled ?? false, pricing_plan ?? 'free', notes ?? null,
        image_url ?? null, pexels_url ?? null, image_source ?? 'placeholder', image_status ?? 'missing',
        vibe ?? null, seating ?? null, parking ?? false,
        scenario ?? null, lat ?? null, lng ?? null,
        price_range ?? 2, group_size_max ?? 10, hours ?? null, verified ?? false,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[restaurants] POST / error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/restaurants/:id — admin use only (no auth in MVP)
// TODO: add authentication before production
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid restaurant id' })
      return
    }

    const allowed = [
      'name','city','commune','cluster','address','phone',
      'website_url','delivery_url','cuisine_primary','cuisine_secondary',
      'own_delivery','pickup','direct_ordering','third_party',
      'min_order_eur','delivery_fee_eur','delivery_zone_notes',
      'source_name','source_url','verification_status',
      'partner_status','billing_enabled','pricing_plan','notes','opening_hours',
      // v3 fields
      'image_url','pexels_url','image_source','image_status','vibe','seating','parking',
      'scenario','lat','lng','price_range','group_size_max','hours','verified',
    ]

    const updates: string[] = []
    const values: unknown[] = []
    let idx = 1

    for (const key of allowed) {
      if (key in req.body) {
        updates.push(`${key} = $${idx++}`)
        values.push(req.body[key])
      }
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' })
      return
    }

    values.push(id)
    const result = await pool.query(
      `UPDATE restaurants SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Restaurant not found' })
      return
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('[restaurants] PATCH /:id error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
