import jwt from 'jsonwebtoken'

export function setupSockets(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No token'))

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
      socket.userId = decoded.id
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.userId
    console.log(`[Socket] User ${userId} connected: ${socket.id}`)

    // Join personal room for direct notifications
    socket.join(`user:${userId}`)

    // Join group rooms
    socket.on('join_group', (groupId) => {
      socket.join(`group:${groupId}`)
      console.log(`[Socket] User ${userId} joined group:${groupId}`)
    })

    socket.on('leave_group', (groupId) => {
      socket.leave(`group:${groupId}`)
    })

    // Typing indicator for group chat (future feature)
    socket.on('typing', ({ groupId }) => {
      socket.to(`group:${groupId}`).emit('user_typing', { userId })
    })

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected`)
    })
  })

  return io
}
