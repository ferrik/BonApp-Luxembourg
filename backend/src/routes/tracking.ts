import { Router, Request, Response } from 'express'
import { pool } from '../db/pool'

const router = Router()

const ALLOWED_EVENT_TYPES = ['restaurant_view', 'order_click', 'call_click', 'website_click'] as const
type EventType = typeof ALLOWED_EVENT_TYPES[number]

// POST /api/tracking/click
// Body: { restaurant_id: number, event_type: EventType }
router.post('/click', async (req: Request, res: Response) => {
  try {
    const { restaurant_id, event_type } = req.body

    // Validate restaurant_id
    if (!restaurant_id || isNaN(Number(restaurant_id))) {
      res.status(400).json({ ok: false, error: 'restaurant_id must be a valid number' })
      return
    }

    // Validate event_type
    if (!ALLOWED_EVENT_TYPES.includes(event_type as EventType)) {
      res.status(400).json({
        ok: false,
        error: `event_type must be one of: ${ALLOWED_EVENT_TYPES.join(', ')}`,
      })
      return
    }

    const rid = Number(restaurant_id)

    // Confirm restaurant exists
    const check = await pool.query('SELECT id FROM restaurants WHERE id = $1', [rid])
    if (check.rows.length === 0) {
      res.status(404).json({ ok: false, error: 'Restaurant not found' })
      return
    }

    // Insert click event
    await pool.query(
      'INSERT INTO restaurant_clicks (restaurant_id, event_type) VALUES ($1, $2)',
      [rid, event_type]
    )

    console.log(`[tracking] click recorded: restaurant_id=${rid} event_type=${event_type}`)
    res.status(201).json({ ok: true, message: 'Click recorded' })
  } catch (err) {
    console.error('[tracking] POST /click error:', err)
    res.status(500).json({ ok: false, error: 'Internal server error' })
  }
})

// GET /api/tracking/summary — smoke test helper
// Returns recent clicks with restaurant names, plus aggregated analytics
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const recent = await pool.query(`
      SELECT r.name, r.city, c.event_type, c.created_at
      FROM restaurant_clicks c
      JOIN restaurants r ON r.id = c.restaurant_id
      ORDER BY c.created_at DESC
      LIMIT 20
    `)

    const totals = await pool.query(`
      SELECT event_type, COUNT(*) as count
      FROM restaurant_clicks
      GROUP BY event_type
      ORDER BY count DESC
    `)

    const by_restaurant = await pool.query(`
      SELECT r.name, COUNT(c.id) as count
      FROM restaurant_clicks c
      JOIN restaurants r ON r.id = c.restaurant_id
      GROUP BY r.id, r.name
      ORDER BY count DESC
      LIMIT 50
    `)

    const by_date = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM restaurant_clicks
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `)

    const by_hour = await pool.query(`
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
      FROM restaurant_clicks
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `)

    const total = await pool.query('SELECT COUNT(*) as total FROM restaurant_clicks')

    res.json({
      total_clicks: Number(total.rows[0].total),
      by_event_type: totals.rows,
      recent: recent.rows,
      by_restaurant: by_restaurant.rows,
      by_date: by_date.rows,
      by_hour: by_hour.rows,
    })
  } catch (err) {
    console.error('[tracking] GET /summary error:', err)
    res.status(500).json({ ok: false, error: 'Internal server error' })
  }
})

export default router
