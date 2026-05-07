import { Notification } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id, read: false
  })

  res.json({ notifications, unreadCount })
})

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true }
  )
  res.json({ message: 'Marked as read' })
})

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true })
  res.json({ message: 'All marked as read' })
})

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
  res.json({ message: 'Deleted' })
})
