import { Expense, Group, Notification } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { recalcGroupBalances, buildSplits } from '../utils/balanceEngine.js'

// GET /api/expenses
export const getUserExpenses = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1
  const limit = parseInt(req.query.limit) || 10
  const skip  = (page - 1) * limit

  const [expenses, total] = await Promise.all([
    Expense.find({ 
      $or: [
        { paidBy: req.user._id },
        { 'splits.user': req.user._id }
      ]
    })
      .populate('paidBy', 'name avatar color')
      .populate('groupId', 'name icon color')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments({ 
      $or: [
        { paidBy: req.user._id },
        { 'splits.user': req.user._id }
      ]
    }),
  ])

  const enriched = expenses.map(exp => {
    const myId    = req.user._id.toString()
    const mySplit = exp.splits.find(s => s.user.toString() === myId)
    const paidByMe = exp.paidBy._id.toString() === myId
    let myShare = 0
    if (mySplit) myShare = paidByMe ? exp.amount - mySplit.amount : -mySplit.amount
    else if (paidByMe) myShare = exp.amount
    return { ...exp.toObject(), myShare }
  })

  res.json({ expenses: enriched, total, page, pages: Math.ceil(total / limit) })
})

// GET /api/expenses/group/:groupId
export const getGroupExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params
  const page  = parseInt(req.query.page)  || 1
  const limit = parseInt(req.query.limit) || 20
  const skip  = (page - 1) * limit

  // Verify membership
  const group = await Group.findById(groupId)
  if (!group) return res.status(404).json({ message: 'Group not found' })
  const isMember = group.members.some(m => m.user.toString() === req.user._id.toString())
  if (!isMember) return res.status(403).json({ message: 'Not a member' })

  const [expenses, total] = await Promise.all([
    Expense.find({ groupId })
      .populate('paidBy', 'name avatar color')
      .populate('splits.user', 'name avatar color')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments({ groupId }),
  ])

  // Attach the requesting user's share for each expense
  const enriched = expenses.map(exp => {
    const myId    = req.user._id.toString()
    const mySplit = exp.splits.find(s => s.user._id.toString() === myId)
    const paidByMe = exp.paidBy._id.toString() === myId
    let myShare = 0
    if (mySplit) myShare = paidByMe ? exp.amount - mySplit.amount : -mySplit.amount
    return { ...exp.toObject(), myShare }
  })

  res.json({ expenses: enriched, total, page, pages: Math.ceil(total / limit) })
})

// POST /api/expenses
export const createExpense = asyncHandler(async (req, res) => {
  const {
    groupId, description, amount, currency,
    paidBy, splitType, memberIds, exactAmounts,
    percentages, sharesMap, category, note, date,
  } = req.body

  const isPersonal = !groupId || groupId === 'personal'
  
  if (!description || !amount || !paidBy)
    return res.status(400).json({ message: 'description, amount and paidBy are required' })

  let group = null
  if (!isPersonal) {
    group = await Group.findById(groupId)
    if (!group) return res.status(404).json({ message: 'Group not found' })
  }

  const memberUserIds = isPersonal ? [paidBy] : (memberIds || group.members.map(m => m.user.toString()))

  try {
    const splits = buildSplits({
      amount: parseFloat(amount),
      splitType: isPersonal ? 'equal' : (splitType || 'equal'),
      memberIds: memberUserIds,
      exactAmounts:  exactAmounts  || {},
      percentages:   percentages   || {},
      sharesMap:     sharesMap     || {},
    })

    const expense = await Expense.create({
      groupId: isPersonal ? null : groupId,
      description: description.trim(),
      amount: parseFloat(amount),
      currency: currency || group?.currency || 'INR',
      paidBy, splitType: isPersonal ? 'equal' : (splitType || 'equal'),
      splits, category: category || 'other',
      note, date: date ? new Date(date) : new Date(),
      createdBy: req.user._id,
    })
    
    // Recalculate group balances if applicable
    if (!isPersonal) {
      await recalcGroupBalances(groupId, Group, Expense)
    }
    res.status(201).json({ expense })
  } catch (err) {
    console.error('Create Expense Error:', err)
    return res.status(400).json({ message: err.message, error: err })
  }

  // Notify all group members (except creator)
  if (!isPersonal && group) {
    const notifTargets = group.members
      .filter(m => m.user.toString() !== req.user._id.toString())
      .map(m => ({
        userId:  m.user,
        type:    'expense',
        title:   'New expense added',
        message: `${req.user.name} added "${description}" – ₹${amount} in ${group.name}`,
        refId:   expense._id, refType: 'Expense',
      }))
    if (notifTargets.length) await Notification.insertMany(notifTargets)
  }

  const populated = await expense
    .populate('paidBy', 'name avatar color')
    .then(e => e.populate('splits.user', 'name avatar color'))

  // Real-time emit
  if (!isPersonal) {
    req.io?.to(`group:${groupId}`).emit('expense_added', { expense: populated })
    req.io?.to(`group:${groupId}`).emit('balance_updated', { groupId })
  }

  res.status(201).json({ expense: populated })
})

// PUT /api/expenses/:id
export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
  if (!expense) return res.status(404).json({ message: 'Expense not found' })

  const group = await Group.findById(expense.groupId)
  const isAdmin = group?.members.some(
    m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  )
  const isCreator = expense.createdBy?.toString() === req.user._id.toString()
  if (!isAdmin && !isCreator) return res.status(403).json({ message: 'Not allowed' })

  const { description, amount, category, note, date, splitType, memberIds, exactAmounts, percentages, sharesMap } = req.body

  if (description) expense.description = description
  if (category)    expense.category    = category
  if (note !== undefined) expense.note = note
  if (date)        expense.date        = new Date(date)

  if (amount || splitType || memberIds) {
    const newAmount = parseFloat(amount || expense.amount)
    const memberUserIds = memberIds || expense.splits.map(s => s.user.toString())
    expense.amount = newAmount
    expense.splits = buildSplits({
      amount: newAmount,
      splitType: splitType || expense.splitType,
      memberIds: memberUserIds,
      exactAmounts: exactAmounts || {},
      percentages:  percentages  || {},
      sharesMap:    sharesMap    || {},
    })
    expense.splitType = splitType || expense.splitType
  }

  await expense.save()
  await recalcGroupBalances(expense.groupId, Group, Expense)

  req.io?.to(`group:${expense.groupId}`).emit('expense_updated', { expense })
  req.io?.to(`group:${expense.groupId}`).emit('balance_updated', { groupId: expense.groupId })

  res.json({ expense })
})

// DELETE /api/expenses/:id
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
  if (!expense) return res.status(404).json({ message: 'Expense not found' })

  const group = await Group.findById(expense.groupId)
  const isAdmin = group?.members.some(
    m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  )
  const isCreator = expense.createdBy?.toString() === req.user._id.toString()
  if (!isAdmin && !isCreator) return res.status(403).json({ message: 'Not allowed' })

  const groupId = expense.groupId
  await expense.deleteOne()
  await recalcGroupBalances(groupId, Group, Expense)

  req.io?.to(`group:${groupId}`).emit('expense_deleted', { expenseId: req.params.id, groupId })
  req.io?.to(`group:${groupId}`).emit('balance_updated', { groupId })

  res.json({ message: 'Expense deleted' })
})
