import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './db/pool'
import healthRouter from './routes/health'
import restaurantsRouter from './routes/restaurants'
import trackingRouter from './routes/tracking'
import partnersRouter from './routes/partners'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 4000

// Support comma-separated list of allowed origins (e.g. "https://bonapp.lu,https://bon-app-luxembourg.vercel.app")
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173'
const CORS_ORIGINS = rawOrigins.split(',').map(o => o.trim()).filter(Boolean)
console.log('[server] Allowed CORS origins:', CORS_ORIGINS)

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Render health checks, curl)
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

// Start
async function start() {
  try {
    await testConnection()
    app.listen(PORT, () => {
      console.log(`[server] BonApp backend running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('[server] Failed to start:', err)
    process.exit(1)
  }
}

start()
