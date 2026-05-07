import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

const JWT_SECRET         = () => process.env.JWT_SECRET         || 'dev-secret'
const JWT_REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'

function signAccess(id) {
  return jwt.sign({ id }, JWT_SECRET(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}
function signRefresh(id) {
  return jwt.sign({ id }, JWT_REFRESH_SECRET(), { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' })
}

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) return res.status(409).json({ message: 'Email already registered' })

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: password,  // pre-save hook hashes this
  })

  const token        = signAccess(user._id)
  const refreshToken = signRefresh(user._id)

  // Store refresh token
  await User.findByIdAndUpdate(user._id, { refreshToken })

  res.status(201).json({
    token,
    refreshToken,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      avatar: user.avatar,
      color:  user.color,
      currency: user.currency,
    }
  })
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const match = await user.comparePassword(password)
  if (!match) return res.status(401).json({ message: 'Invalid credentials' })

  const token        = signAccess(user._id)
  const refreshToken = signRefresh(user._id)

  await User.findByIdAndUpdate(user._id, { refreshToken })

  res.json({
    token,
    refreshToken,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      avatar: user.avatar,
      color:  user.color,
      currency: user.currency,
    }
  })
})

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token if authenticated
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null })
  }
  res.json({ message: 'Logged out' })
})

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' })

  let decoded
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET())
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ message: 'Refresh token revoked' })
  }

  const newToken        = signAccess(user._id)
  const newRefreshToken = signRefresh(user._id)
  await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken })

  res.json({ token: newToken, refreshToken: newRefreshToken })
})

// GET /api/auth/me  (alias for /users/me)
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic ? req.user.toPublic() : req.user })
})
