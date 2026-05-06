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

// POST /api/events — anonymous analytics (never block UX, always return 201)
app.post('/api/events', async (req, res) => {
  try {
    const { event_name, data } = req.body
    if (event_name && typeof event_name === 'string') {
      await pool.query(
        'INSERT INTO events (event_name, data) VALUES ($1, $2)',
        [event_name, data ?? {}]
      )
    }
  } catch (e) {
    console.error('[events] insert failed (non-blocking):', e)
  }
  // Always 201 — never block UX on analytics
  res.status(201).json({ ok: true })
})

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Inline migration SQL — idempotent (all statements use IF NOT EXISTS)
// Inlined here so tsc build includes it without needing to copy .sql files
const MIGRATION_SQL = `
-- ── partner_applications table ──────────────────────────────────────────────
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

-- ── v2 compat: opening_hours on partner_applications ────────────────────────
DO $$ BEGIN
  ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS opening_hours TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS image_url TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_hours TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── v3 discovery fields ──────────────────────────────────────────────────────
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

-- ── vibe auto-assignment (runs every boot, safe to repeat) ───────────────────
UPDATE restaurants SET vibe = CASE
  WHEN LOWER(COALESCE(cuisine_primary,'')) SIMILAR TO '%(kebab|fast.food|snack|friterie)%'          THEN 'fast'
  WHEN LOWER(COALESCE(cuisine_primary,'')) SIMILAR TO '%(cafe|coffee|salon.de.the|tea|dessert)%'    THEN 'casual'
  WHEN LOWER(COALESCE(cuisine_primary,'')) SIMILAR TO '%(gastronomique|fine.dining|luxury|etoile)%' THEN 'premium'
  WHEN LOWER(COALESCE(cuisine_primary,'')) SIMILAR TO '%(bistro|brasserie|restaurant|taverne)%'     THEN 'cozy'
  ELSE 'casual'
END
WHERE vibe IS NULL;

-- ── events table (anonymous analytics) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id         SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  data       JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_name ON events (event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON events (created_at DESC);

-- ── saved_places table (session-based, no login) ─────────────────────────────
CREATE TABLE IF NOT EXISTS saved_places (
  id            SERIAL PRIMARY KEY,
  session_id    TEXT NOT NULL,
  restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
  saved_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_saved_places_session ON saved_places (session_id);
`

async function runMigrations(): Promise<void> {
  await pool.query(MIGRATION_SQL)
  console.log('[migrate] v3 schema ready (partner_applications, events, saved_places, new restaurant fields)')

  // Data quality check
  try {
    const qc = await pool.query(`
      SELECT
        COUNT(*)         AS total,
        COUNT(phone)     AS has_phone,
        COUNT(lat)       AS has_coords,
        COUNT(website_url) AS has_website,
        COUNT(image_url) AS has_image,
        COUNT(*) FILTER (WHERE verified = true) AS verified_count
      FROM restaurants
    `)
    const row = qc.rows[0]
    console.log('[data-quality]', row)
    if (Number(row.total) < 10) {
      console.warn('[data-quality] WARNING: Fewer than 10 restaurants in DB. Minimum 20 recommended for launch.')
    }
  } catch (e) {
    console.error('[data-quality] check failed:', e)
  }
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
