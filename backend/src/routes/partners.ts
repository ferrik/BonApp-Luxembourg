/**
 * routes/partners.ts
 * POST /api/partners/apply  — submit a new partner application
 * GET  /api/partners         — list applications (admin only, basic secret check)
 *
 * No auto-publish. status = 'pending' until manually changed in DB.
 */
import { Router, Request, Response } from 'express'
import { pool } from '../db/pool'

const router = Router()

// ── POST /api/partners/apply ──────────────────────────────────────────────────
router.post('/apply', async (req: Request, res: Response) => {
  const {
    application_type = 'join',
    existing_restaurant_id,

    restaurant_name,
    cuisine_type,
    city,
    address,

    contact_name,
    contact_phone,
    contact_email,

    website_url,
    ordering_url,
    menu_url,

    offers_delivery = false,
    offers_pickup   = false,

    delivery_areas,
    min_order_eur,
    delivery_fee_eur,
    est_delivery_min,

    notes,
  } = req.body

  // Required field validation
  if (!restaurant_name?.trim()) {
    return res.status(400).json({ error: 'restaurant_name is required' })
  }
  if (!contact_name?.trim()) {
    return res.status(400).json({ error: 'contact_name is required' })
  }
  if (!contact_email?.trim()) {
    return res.status(400).json({ error: 'contact_email is required' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO partner_applications (
        application_type, existing_restaurant_id,
        restaurant_name, cuisine_type, city, address,
        contact_name, contact_phone, contact_email,
        website_url, ordering_url, menu_url,
        offers_delivery, offers_pickup,
        delivery_areas, min_order_eur, delivery_fee_eur, est_delivery_min,
        notes
      ) VALUES (
        $1, $2,
        $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12,
        $13, $14,
        $15, $16, $17, $18,
        $19
      )
      RETURNING id, status, created_at`,
      [
        application_type, existing_restaurant_id ?? null,
        restaurant_name.trim(), cuisine_type ?? null, city ?? null, address ?? null,
        contact_name.trim(), contact_phone ?? null, contact_email.trim(),
        website_url ?? null, ordering_url ?? null, menu_url ?? null,
        Boolean(offers_delivery), Boolean(offers_pickup),
        delivery_areas ?? null,
        min_order_eur   != null ? Number(min_order_eur)   : null,
        delivery_fee_eur != null ? Number(delivery_fee_eur) : null,
        est_delivery_min != null ? Number(est_delivery_min) : null,
        notes ?? null,
      ]
    )

    const row = result.rows[0]
    console.log(`[partners] New application #${row.id} — ${restaurant_name} (${application_type})`)

    return res.status(201).json({
      ok: true,
      id: row.id,
      status: row.status,
      message: 'Application received. We will review and contact you before publishing.',
    })
  } catch (err) {
    console.error('[partners] Insert error:', err)
    return res.status(500).json({ error: 'Failed to submit application. Please try again.' })
  }
})

// ── GET /api/partners  (admin only, token-gated) ─────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN
  const auth = req.headers['x-admin-token']

  if (!ADMIN_TOKEN || auth !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const statusFilter = req.query.status as string | undefined
  const validStatuses = ['pending', 'active', 'rejected']

  try {
    let sql = `SELECT * FROM partner_applications`
    const params: string[] = []

    if (statusFilter && validStatuses.includes(statusFilter)) {
      sql += ` WHERE status = $1`
      params.push(statusFilter)
    }

    sql += ` ORDER BY created_at DESC LIMIT 100`

    const result = await pool.query(sql, params)
    return res.json(result.rows)
  } catch (err) {
    console.error('[partners] List error:', err)
    return res.status(500).json({ error: 'Failed to load applications.' })
  }
})

// ── PATCH /api/partners/:id  (admin only) ────────────────────────────────────
router.patch('/:id', async (req: Request, res: Response) => {
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN
  const auth = req.headers['x-admin-token']

  if (!ADMIN_TOKEN || auth !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  const { status, admin_notes } = req.body
  const VALID_STATUSES = ['pending', 'active', 'rejected']

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  const updates: string[] = []
  const values: unknown[] = []
  let idx = 1

  if (status)      { updates.push(`status = $${idx++}`);      values.push(status) }
  if (admin_notes !== undefined) { updates.push(`admin_notes = $${idx++}`); values.push(admin_notes) }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  updates.push(`updated_at = NOW()`)
  values.push(id)

  try {
    const result = await pool.query(
      `UPDATE partner_applications SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }
    console.log(`[partners] Application #${id} updated: status=${status ?? 'unchanged'}`)
    return res.json(result.rows[0])
  } catch (err) {
    console.error('[partners] PATCH error:', err)
    return res.status(500).json({ error: 'Failed to update application' })
  }
})

export default router
