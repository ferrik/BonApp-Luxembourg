import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool, testConnection } from './db/pool'
import healthRouter from './routes/health'
import restaurantsRouter from './routes/restaurants'
import trackingRouter from './routes/tracking'
import partnersRouter from './routes/partners'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 4000

// Support comma-separated list of allowed origins
// e.g. "https://bonapp.lu,https://www.bonapp.lu,https://bon-app-luxembourg.vercel.app"
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173'
const CORS_ORIGINS = rawOrigins.split(',').map(o => o.trim()).filter(Boolean)
console.log('[server] Allowed CORS origins:', CORS_ORIGINS)

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Render health checks, curl, etc.)
    if (!origin) return callback(null, true)
    if (CORS_ORIGINS.includes(origin)) return callback(null, true)
    console.warn(`[cors] Blocked request from origin: ${origin}`)
    return callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: false,
}))
app.use(express.json())

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/health', healthRouter)
app.use('/api/restaurants', restaurantsRouter)
app.use('/api/tracking', trackingRouter)
app.use('/api/partners', partnersRouter)

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Inline migration SQL — idempotent (CREATE TABLE IF NOT EXISTS)
// Inlined here so tsc build includes it without needing to copy .sql files
const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS partner_applications (
  id                     SERIAL PRIMARY KEY,
  application_type       TEXT NOT NULL DEFAULT 'join',
  existing_restaurant_id INT REFERENCES restaurants(id) ON DELETE SET NULL,
  restaurant_name        TEXT NOT NULL,
  cuisine_type           TEXT,
  city                   TEXT,
  address                TEXT,
  contact_name           TEXT NOT NULL,
  contact_phone          TEXT,
  contact_email          TEXT NOT NULL,
  website_url            TEXT,
  ordering_url           TEXT,
  menu_url               TEXT,
  offers_delivery        BOOLEAN NOT NULL DEFAULT FALSE,
  offers_pickup          BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_areas         TEXT,
  min_order_eur          NUMERIC(6,2),
  delivery_fee_eur       NUMERIC(6,2),
  est_delivery_min       INT,
  notes                  TEXT,
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'active', 'rejected')),
  admin_notes            TEXT,
  opening_hours          TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status
  ON partner_applications (status);
CREATE INDEX IF NOT EXISTS idx_partner_applications_created
  ON partner_applications (created_at DESC);
-- idempotent: add opening_hours to partner_applications if missing
DO $$ BEGIN
  ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS opening_hours TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
-- idempotent: add opening_hours to restaurants if missing
DO $$ BEGIN
  ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_hours TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
`

async function runMigrations(): Promise<void> {
  await pool.query(MIGRATION_SQL)
  console.log('[migrate] partner_applications table ready')
}

// Start
async function start() {
  try {
    await testConnection()
    await runMigrations()
    app.listen(PORT, () => {
      console.log(`[server] BonApp backend running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('[server] Failed to start:', err)
    process.exit(1)
  }
}

start()
