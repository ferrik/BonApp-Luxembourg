import { Router, Request, Response } from 'express'
import { pool } from '../db/pool'

const router = Router()

// GET /api/health
router.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'bonapp-backend', timestamp: new Date().toISOString() })
})

// Ping DB
router.get('/db', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW() as now')
    res.json({ ok: true, db_time: result.rows[0].now })
  } catch (err) {
    res.status(503).json({ ok: false, error: 'Database unreachable' })
  }
})

export default router
