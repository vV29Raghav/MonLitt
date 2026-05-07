import { Expense, Group } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// GET /api/reports/monthly
export const getMonthlyReport = asyncHandler(async (req, res) => {
  // Get all groups the user is a member of
  const groups = await Group.find({ 'members.user': req.user._id }).select('_id')
  const groupIds = groups.map(g => g._id)

  const months = await Expense.aggregate([
    {
      $match: {
        groupId: { $in: groupIds },
        date:    { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
      }
    },
    {
      $group: {
        _id:   { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const result = months.map(m => ({
    month:  MONTH_NAMES[m._id.month - 1],
    year:   m._id.year,
    amount: m.total,
    count:  m.count,
  }))

  res.json({ monthly: result })
})

// GET /api/reports/category
export const getCategoryReport = asyncHandler(async (req, res) => {
  const groups = await Group.find({ 'members.user': req.user._id }).select('_id')
  const groupIds = groups.map(g => g._id)

  const categories = await Expense.aggregate([
    {
      $match: {
        groupId: { $in: groupIds },
        date:    { $gte: new Date(new Date().setDate(1)) }, // this month
      }
    },
    {
      $group: {
        _id:   '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      }
    },
    { $sort: { total: -1 } }
  ])

  const COLORS = {
    food: '#f59e0b', travel: '#3b82f6', housing: '#10b981',
    entertainment: '#a855f7', utilities: '#ec4899',
    shopping: '#06b6d4', healthcare: '#ef4444', other: '#94a3b8',
  }

  const result = categories.map(c => ({
    name:  c._id || 'other',
    amount: c.total,
    count:  c.count,
    color: COLORS[c._id] || '#94a3b8',
  }))

  res.json({ categories: result })
})

// GET /api/reports/summary
export const getSummary = asyncHandler(async (req, res) => {
  const groups = await Group.find({ 'members.user': req.user._id }).select('_id balances')

  let totalOwed = 0
  let totalOwe  = 0

  for (const g of groups) {
    const myBal = g.balances.get(req.user._id.toString()) || 0
    if (myBal > 0) totalOwed += myBal
    else            totalOwe  += Math.abs(myBal)
  }

  res.json({ totalOwed, totalOwe, netBalance: totalOwed - totalOwe })
})
