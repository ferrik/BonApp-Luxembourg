import { Router, Request, Response } from 'express'
import { pool } from '../db/pool'

const router = Router()

const ALLOWED_CUISINES = ['Italian', 'Asian', 'Burger', 'Kebab', 'Local', 'Healthy', 'Indian', 'Other']

function requireAdmin(req: Request, res: Response): boolean {
  const adminToken = process.env.ADMIN_TOKEN
  const auth = req.headers['x-admin-token']
  if (!adminToken || auth !== adminToken) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

function computeScore(
  row: Record<string, unknown>,
  scenario?: string,
  city?: string,
  priceRange?: number,
  groupSize?: number,
): number {
  let score = 0
  if (row.verified === true) score += 2
  if (row.image_url || row.pexels_url) score += 3
  if (row.phone) score += 2
  if (row.website_url) score += 1
  if (scenario && Array.isArray(row.scenario) && (row.scenario as string[]).includes(scenario)) score += 2
  if (city && typeof row.city === 'string' && row.city.toLowerCase().includes(city.toLowerCase())) score += 1
  if (priceRange != null && Number(row.price_range) === priceRange) score += 2
  if (groupSize != null && Number(row.group_size_max) >= groupSize) score += 1
  return score
}

router.get('/cities', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT city FROM restaurants
       WHERE city IS NOT NULL AND city <> ''
         AND partner_status NOT IN ('paused', 'rejected')
       ORDER BY city ASC`
    )
    res.json(result.rows.map((r: { city: string }) => r.city))
  } catch (err) {
    console.error('[restaurants] GET /cities error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const cuisine = req.query.cuisine as string | undefined
    const scenario = req.query.scenario as string | undefined
    const city = req.query.city as string | undefined
    const priceRange = req.query.price_range ? Number(req.query.price_range) : req.query.price ? Number(req.query.price) : undefined
    const groupSize = req.query.group_size ? Number(req.query.group_size) : req.query.group ? Number(req.query.group) : undefined
    const requestedLimit = Number(req.query.limit) || 3
    const isAdmin = req.query.admin === 'true'
    const limit = Math.min(requestedLimit, isAdmin ? 500 : 200)

    if (isAdmin) {
      if (!requireAdmin(req, res)) return

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

    const all = await pool.query(`SELECT * FROM restaurants WHERE partner_status NOT IN ('paused', 'rejected')`)
    const rows: Record<string, unknown>[] = all.rows

    function pickTop(candidates: Record<string, unknown>[], n = 3) {
      return candidates
        .map(r => ({ r, s: computeScore(r, scenario, city, priceRange, groupSize) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, n)
        .map(x => x.r)
    }

    let picked: Record<string, unknown>[] = []
    let isFallback = false

    if (city && scenario) {
      const l1 = rows.filter(r =>
        typeof r.city === 'string' && r.city.toLowerCase().includes(city.toLowerCase()) &&
        Array.isArray(r.scenario) && (r.scenario as string[]).includes(scenario)
      )
      if (l1.length > 0) picked = pickTop(l1)
    }

    if (picked.length < 3 && city) {
      const l2 = rows.filter(r => typeof r.city === 'string' && r.city.toLowerCase().includes(city.toLowerCase()))
      if (l2.length > 0) { picked = pickTop(l2); isFallback = true }
    }

    if (picked.length < 3 && scenario) {
      const l3 = rows.filter(r => Array.isArray(r.scenario) && (r.scenario as string[]).includes(scenario))
      if (l3.length > 0) { picked = pickTop(l3); isFallback = true }
    }

    if (picked.length < 3) {
      const l4 = rows.filter(r => r.verified === true)
      if (l4.length >= 3) { picked = pickTop(l4); isFallback = true }
    }

    if (picked.length < 3) {
      picked = pickTop(rows)
      isFallback = picked.length > 0
    }

    if (picked.length === 0 && cuisine && ALLOWED_CUISINES.includes(cuisine)) {
      const byCuisine = rows.filter(r =>
        typeof r.cuisine_primary === 'string' &&
        r.cuisine_primary.toLowerCase().includes(cuisine.toLowerCase())
      )
      picked = pickTop(byCuisine.length >= 3 ? byCuisine : rows)
      isFallback = byCuisine.length < 3
    }

    res.json(picked.slice(0, 3).map(r => ({ ...r, _is_fallback: isFallback })))
  } catch (err) {
    console.error('[restaurants] GET / error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

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

router.post('/', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return

  try {
    const {
      name, city, commune, cluster, address, phone,
      website_url, delivery_url, cuisine_primary, cuisine_secondary,
      own_delivery, pickup, direct_ordering, third_party,
      min_order_eur, delivery_fee_eur, delivery_zone_notes,
      source_name, source_url, verification_status,
      partner_status, billing_enabled, pricing_plan, notes,
      image_url, pexels_url, image_source, image_status, vibe, seating, parking,
      scenario, lat, lng, price_range, group_size_max, hours, verified, opening_hours,
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
        scenario, lat, lng, price_range, group_size_max, hours, verified, opening_hours
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37,$38,$39
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
        price_range ?? 2, group_size_max ?? 10, hours ?? null, verified ?? false, opening_hours ?? null,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[restaurants] POST / error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch('/:id', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return

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
      'image_url','pexels_url','image_source','image_status','vibe','seating','parking',
      'scenario','lat','lng','price_range','group_size_max','hours','verified','open_now',
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
