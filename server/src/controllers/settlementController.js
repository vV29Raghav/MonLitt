import { Settlement, Group, Notification, Expense } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { recalcGroupBalances, simplifyDebts } from '../utils/balanceEngine.js'

// GET /api/settlements/:groupId
export const getSettlements = asyncHandler(async (req, res) => {
  const { groupId } = req.params

  const group = await Group.findById(groupId)
  if (!group) return res.status(404).json({ message: 'Group not found' })
  const isMember = group.members.some(m => m.user.toString() === req.user._id.toString())
  if (!isMember) return res.status(403).json({ message: 'Not a member' })

  const settlements = await Settlement.find({ groupId })
    .populate('fromUser', 'name avatar color')
    .populate('toUser',   'name avatar color')
    .sort({ paidAt: -1 })
    .limit(50)

  const simplified = simplifyDebts(Object.fromEntries(group.balances))

  res.json({ settlements, simplified })
})

export const pay = asyncHandler(async (req, res) => {
  const { groupId, fromUserId, toUserId, amount, note } = req.body

  if (!groupId || !toUserId || !amount)
    return res.status(400).json({ message: 'groupId, toUserId and amount are required' })

  const fromId = fromUserId || req.user._id
  const group = await Group.findById(groupId)
  if (!group) return res.status(404).json({ message: 'Group not found' })
  
  // Verify both are members
  const memIds = group.members.map(m => m.user.toString())
  if (!memIds.includes(fromId.toString()) || !memIds.includes(toUserId.toString()))
    return res.status(400).json({ message: 'Both users must be group members' })

  const settlement = await Settlement.create({
    groupId,
    fromUser: fromId,
    toUser:   toUserId,
    amount:   parseFloat(amount),
    currency: group.currency || 'INR',
    note:     note || 'Settlement payment',
    status:   'completed',
    paidAt:   new Date(),
  })

  // Add a synthetic "settlement expense" to recalc balances
  await Expense.create({
    groupId,
    description: `Settlement payment`,
    amount:    parseFloat(amount),
    currency:  group.currency || 'INR',
    paidBy:    fromId,
    splitType: 'exact',
    splits: [{ user: toUserId, amount: parseFloat(amount) }],
    category:  'settlement',
    note:      note || 'Settlement payment',
    createdBy: req.user._id,
    date:      new Date(),
  })

  await recalcGroupBalances(groupId, Group, Expense)

  // Notify recipient
  await Notification.create({
    userId:  toUserId,
    type:    'settlement',
    title:   'Payment received',
    message: `${req.user.name} paid you ₹${amount} in ${group.name}`,
    refId:   settlement._id, refType: 'Settlement',
  })

  const populated = await settlement
    .populate('fromUser', 'name avatar color')
    .then(s => s.populate('toUser', 'name avatar color'))

  // Real-time
  req.io?.to(`group:${groupId}`).emit('settlement_done', { settlement: populated })
  req.io?.to(`group:${groupId}`).emit('balance_updated', { groupId })
  req.io?.to(`user:${toUserId}`).emit('notification_new', {
    title: 'Payment received',
    message: `${req.user.name} paid you ₹${amount}`,
  })

  res.status(201).json({ settlement: populated })
})
