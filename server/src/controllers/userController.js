import { User } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// GET /api/users/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('friends', 'name email avatar color')
    .populate('groups',  'name icon category')
  res.json({ user })
})

// PUT /api/users/me
export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatar', 'currency', 'color']
  const updates = {}
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new:true, runValidators:true })
  res.json({ user })
})

// GET /api/users/search?q=
export const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim()
  if (q.length < 2) return res.json({ users: [] })

  const users = await User.find({
    $or: [
      { name:  { $regex: q, $options:'i' } },
      { email: { $regex: q, $options:'i' } },
    ],
    _id: { $ne: req.user._id },
  }).limit(10).select('name email avatar color')

  res.json({ users })
})

// POST /api/users/add-friend
export const addFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.body
  if (!friendId) return res.status(400).json({ message: 'friendId required' })
  if (friendId === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot add yourself' })
  }

  const friend = await User.findById(friendId)
  if (!friend) return res.status(404).json({ message: 'User not found' })

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: friendId } })
  await User.findByIdAndUpdate(friendId, { $addToSet: { friends: req.user._id } })

  res.json({ message: 'Friend added', friend: { _id:friend._id, name:friend.name, email:friend.email } })
})

// DELETE /api/users/remove-friend/:id
export const removeFriend = asyncHandler(async (req, res) => {
  const { id } = req.params
  await User.findByIdAndUpdate(req.user._id, { $pull: { friends: id } })
  await User.findByIdAndUpdate(id, { $pull: { friends: req.user._id } })
  res.json({ message: 'Friend removed' })
})
