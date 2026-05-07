import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import {
  authRouter, userRouter, groupRouter,
  expenseRouter, settlementRouter, notifRouter, reportRouter,
} from './routes/index.js'
import { errorHandler } from './middleware/index.js'
import { setupSockets } from './sockets/index.js'

const app    = express()
const server = createServer(app)
const PORT   = process.env.PORT || 5000
const CLIENT = process.env.CLIENT_URL || 'http://localhost:5173'

// ── Socket.IO ────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: [CLIENT, 'http://localhost:5173', 'http://localhost:3000'], credentials: true },
  transports: ['websocket', 'polling'],
})
setupSockets(io)

// ── Middleware ────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: [CLIENT, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later.' },
})
app.use('/api', limiter)
app.use('/api/auth/login',  authLimiter)
app.use('/api/auth/signup', authLimiter)

// Attach io to every request so controllers can emit events
app.use((req, _res, next) => { req.io = io; next() })

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',          authRouter)
app.use('/api/users',         userRouter)
app.use('/api/groups',        groupRouter)
app.use('/api/expenses',      expenseRouter)
app.use('/api/settlements',   settlementRouter)
app.use('/api/notifications', notifRouter)
app.use('/api/reports',       reportRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  })
})

// 404 catch-all for API
app.use('/api/*', (_req, res) => {
  res.status(404).json({ message: 'API route not found' })
})

// Serve frontend build in production
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDist = path.join(__dirname, '../../client/dist')
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')))
}

// Global error handler (must be last)
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────
async function start() {
  await connectDB()
  server.listen(PORT, () => {
    console.log(`\n🚀 SplitWise Pro server running`)
    console.log(`   ➜ API:    http://localhost:${PORT}/api`)
    console.log(`   ➜ Health: http://localhost:${PORT}/api/health`)
    console.log(`   ➜ Mode:   ${process.env.NODE_ENV || 'development'}\n`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
