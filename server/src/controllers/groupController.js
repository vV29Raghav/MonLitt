import { Group, User, Expense, Notification } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { recalcGroupBalances, simplifyDebts } from '../utils/balanceEngine.js'

// GET /api/groups
export const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ 'members.user': req.user._id, isArchived:false })
    .populate('members.user', 'name email avatar color')
    .populate('createdBy', 'name')
    .sort('-updatedAt')

  // Attach my balance and simplified debts to each group
  const enriched = groups.map(g => {
    const myBal = g.balances.get(req.user._id.toString()) || 0
    const rawDebts = simplifyDebts(Object.fromEntries(g.balances))
    const simplifiedDebts = rawDebts.map(d => {
      const fromUser = g.members.find(m => m.user._id.toString() === d.from)?.user
      const toUser   = g.members.find(m => m.user._id.toString() === d.to)?.user
      return { ...d, fromUser, toUser }
    })
    return { ...g.toObject(), myBalance: myBal, simplifiedDebts }
  })

  res.json({ groups: enriched })
})

// GET /api/groups/:id
export const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members.user', 'name email avatar color')
    .populate('createdBy', 'name avatar')

  if (!group) return res.status(404).json({ message: 'Group not found' })

  const isMember = group.members.some(m => m.user._id.toString() === req.user._id.toString())
  if (!isMember) return res.status(403).json({ message: 'Not a member' })

  const myBalance    = group.balances.get(req.user._id.toString()) || 0
  const rawDebts     = simplifyDebts(Object.fromEntries(group.balances))
  
  // Map IDs to user objects from the members list
  const simplifiedDebts = rawDebts.map(d => {
    const fromUser = group.members.find(m => m.user._id.toString() === d.from)?.user
    const toUser   = group.members.find(m => m.user._id.toString() === d.to)?.user
    return { ...d, fromUser, toUser }
  })
  const totalExpenses   = await Expense.aggregate([
    { $match: { groupId: group._id } },
    { $group: { _id:null, total:{ $sum:'$amount' } } },
  ])

  res.json({
    group: {
      ...group.toObject(),
      balances: Object.fromEntries(group.balances),
      myBalance,
      simplifiedDebts,
      totalExpenses: totalExpenses[0]?.total || 0,
    }
  })
})

// POST /api/groups
export const createGroup = asyncHandler(async (req, res) => {
  const { name, icon, category, memberIds } = req.body
  if (!name) return res.status(400).json({ message: 'Name required' })

  const group = await Group.create({
    name,
    icon:      icon || '👥',
    category:  category || 'Other',
    createdBy: req.user._id,
    members: [
      { user: req.user._id, role: 'admin' },
      ...((memberIds || []).map(id => ({ user: id, role: 'member' }))),
    ],
  })

  // Add group to each member's groups array
  const allMembers = [req.user._id, ...(memberIds || [])]
  await User.updateMany({ _id: { $in: allMembers } }, { $addToSet: { groups: group._id } })

  const populated = await group.populate('members.user', 'name email avatar color')
  res.status(201).json({ group: populated })
})

// PUT /api/groups/:id
export const updateGroup = asyncHandler(async (req, res) => {
  const { name, icon, category } = req.body
  const group = await Group.findById(req.params.id)
  if (!group) return res.status(404).json({ message: 'Group not found' })

  const isAdmin = group.members.some(
    m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  )
  if (!isAdmin) return res.status(403).json({ message: 'Admin only' })

  if (name)     group.name     = name
  if (icon)     group.icon     = icon
  if (category) group.category = category
  await group.save()

  res.json({ group })
})

// DELETE /api/groups/:id
export const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
  if (!group) return res.status(404).json({ message: 'Group not found' })

  const isAdmin = group.members.some(
    m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  )
  if (!isAdmin) return res.status(403).json({ message: 'Admin only' })

  await group.deleteOne()
  await User.updateMany({ groups: group._id }, { $pull: { groups: group._id } })

  res.json({ message: 'Group deleted' })
})

// POST /api/groups/:id/members
export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body
  const group      = await Group.findById(req.params.id)
  if (!group) return res.status(404).json({ message: 'Group not found' })

  const already = group.members.some(m => m.user.toString() === userId)
  if (already) return res.status(409).json({ message: 'Already a member' })

  group.members.push({ user: userId, role: 'member' })
  await group.save()
  await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } })

  const user = await User.findById(userId).select('name email avatar color')

  // Notify the added user
  await Notification.create({
    userId,
    type:    'invite',
    title:   'Added to group',
    message: `You were added to ${group.name}`,
    refId:   group._id,
    refType: 'Group',
  })

  // Emit via socket
  req.io?.to(`group:${group._id}`).emit('group_member_added', { groupId: group._id, user })

  res.json({ message: 'Member added', user })
})

// DELETE /api/groups/:id/members/:userId
export const removeMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params
  const group = await Group.findById(id)
  if (!group) return res.status(404).json({ message: 'Group not found' })

  // Can remove yourself OR admin can remove others
  const self    = userId === req.user._id.toString()
  const isAdmin = group.members.some(
    m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  )
  if (!self && !isAdmin) return res.status(403).json({ message: 'Not allowed' })

  const balance = group.balances.get(userId) || 0
  if (Math.abs(balance) > 0.01) {
    return res.status(400).json({ message: 'User has pending balance. Cannot remove.' })
  }

  group.members = group.members.filter(m => m.user.toString() !== userId)
  group.balances.delete(userId)
  await group.save()
  await User.findByIdAndUpdate(userId, { $pull: { groups: group._id } })

  req.io?.to(`group:${group._id}`).emit('member_removed', { groupId: group._id, userId })

  res.json({ message: 'Member removed' })
})
