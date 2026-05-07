import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

// ── Authenticate JWT ───────────────────────────────────────────────────
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token  = header.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) return res.status(401).json({ message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    const user    = await User.findById(decoded.id).select('-passwordHash -refreshToken')

    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// ── Require group membership ───────────────────────────────────────────
export function requireMember(req, res, next) {
  const { group } = req          // set by groupRoutes
  if (!group) return res.status(404).json({ message: 'Group not found' })

  const isMember = group.members.some(
    m => m.user.toString() === req.user._id.toString()
  )
  if (!isMember) return res.status(403).json({ message: 'Not a group member' })
  next()
}

// ── Require group admin ────────────────────────────────────────────────
export function requireAdmin(req, res, next) {
  const { group } = req
  const member = group?.members.find(m => m.user.toString() === req.user._id.toString())
  if (!member || member.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' })
  }
  next()
}

// ── Validate request (express-validator) ──────────────────────────────
import { validationResult } from 'express-validator'
export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }
  next()
}

// ── Global error handler ───────────────────────────────────────────────
export function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', errors: err.errors })
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({ message: `${field} already exists` })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// ── Async wrapper ──────────────────────────────────────────────────────
export const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
