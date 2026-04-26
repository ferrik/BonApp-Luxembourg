import { Router, Request, Response } from 'express'
import { pool } from '../db/pool'

const router = Router()

const ALLOWED_CUISINES = ['Italian', 'Asian', 'Burger', 'Kebab', 'Local', 'Healthy', 'Indian', 'Other']

// GET /api/restaurants
// Query params: cuisine (string), limit (number — capped at 3 for user flow, 200 for admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const cuisine = req.query.cuisine as string | undefined
    const city = req.query.city as string | undefined
    const requestedLimit = Number(req.query.limit) || 3
    const isAdmin = req.query.admin === 'true'
    // Allow up to 200 (admin uses limit=100); default user flow is capped at 3
    const limit = Math.min(requestedLimit, 200)

    let query = 'SELECT * FROM restaurants WHERE 1=1'
    const values: (string | number)[] = []
    let idx = 1

    if (!isAdmin) {
      // Regular users shouldn't see paused or rejected restaurants
      query += ` AND partner_status NOT IN ('paused', 'rejected')`
      // Also might want to hide unverified ones in the future, but for MVP keep it simple
    }

    if (cuisine && ALLOWED_CUISINES.includes(cuisine)) {
      query += ` AND cuisine_primary = $${idx++}`
      values.push(cuisine)
    }

    if (city) {
      query += ` AND city ILIKE $${idx++}`
      values.push(`%${city}%`)
    }

    query += ` ORDER BY RANDOM() LIMIT $${idx}`
    values.push(limit)

    const result = await pool.query(query, values)
    res.json(result.rows)
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

// POST /api/restaurants — admin use only (no auth in MVP, marked for future)
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
        partner_status, billing_enabled, pricing_plan, notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24
      ) RETURNING *`,
      [
        name, city ?? null, commune ?? null, cluster ?? null, address ?? null, phone ?? null,
        website_url ?? null, delivery_url ?? null, cuisine_primary ?? null, cuisine_secondary ?? null,
        own_delivery ?? false, pickup ?? false, direct_ordering ?? false, third_party ?? false,
        min_order_eur ?? null, delivery_fee_eur ?? null, delivery_zone_notes ?? null,
        source_name ?? null, source_url ?? null, verification_status ?? 'pending',
        partner_status ?? 'new', billing_enabled ?? false, pricing_plan ?? 'free', notes ?? null,
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
      'partner_status','billing_enabled','pricing_plan','notes',
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
