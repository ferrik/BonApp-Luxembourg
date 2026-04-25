import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './db/pool'
import healthRouter from './routes/health'
import restaurantsRouter from './routes/restaurants'
import trackingRouter from './routes/tracking'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 4000
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: false }))
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
