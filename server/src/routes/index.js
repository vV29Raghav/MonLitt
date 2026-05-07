// routes/index.js — barrel file exporting all routers
import express from 'express'
import { authenticate } from '../middleware/index.js'

// ── Auth ──────────────────────────────────────────────────────────────
import { signup, login, logout, refresh, me } from '../controllers/authController.js'
export const authRouter = express.Router()
authRouter.post('/signup',  signup)
authRouter.post('/login',   login)
authRouter.post('/logout',  logout)
authRouter.post('/refresh', refresh)
authRouter.get ('/me',      authenticate, me)

// ── Users ─────────────────────────────────────────────────────────────
import { getMe, updateMe, searchUsers, addFriend, removeFriend } from '../controllers/userController.js'
export const userRouter = express.Router()
userRouter.use(authenticate)
userRouter.get   ('/me',                    getMe)
userRouter.put   ('/me',                    updateMe)
userRouter.get   ('/search',               searchUsers)
userRouter.post  ('/add-friend',           addFriend)
userRouter.delete('/remove-friend/:id',    removeFriend)

// ── Groups ────────────────────────────────────────────────────────────
import {
  getGroups, getGroup, createGroup, updateGroup,
  deleteGroup, addMember, removeMember,
} from '../controllers/groupController.js'
export const groupRouter = express.Router()
groupRouter.use(authenticate)
groupRouter.get   ('/',                     getGroups)
groupRouter.get   ('/:id',                  getGroup)
groupRouter.post  ('/',                     createGroup)
groupRouter.put   ('/:id',                  updateGroup)
groupRouter.delete('/:id',                  deleteGroup)
groupRouter.post  ('/:id/members',          addMember)
groupRouter.delete('/:id/members/:userId',  removeMember)

// ── Expenses ──────────────────────────────────────────────────────────
import {
  getUserExpenses, getGroupExpenses, createExpense, updateExpense, deleteExpense,
} from '../controllers/expenseController.js'
export const expenseRouter = express.Router()
expenseRouter.use(authenticate)
expenseRouter.get   ('/',               getUserExpenses)
expenseRouter.get   ('/group/:groupId', getGroupExpenses)
expenseRouter.post  ('/',               createExpense)
expenseRouter.put   ('/:id',            updateExpense)
expenseRouter.delete('/:id',            deleteExpense)

// ── Settlements ───────────────────────────────────────────────────────
import { getSettlements, pay } from '../controllers/settlementController.js'
export const settlementRouter = express.Router()
settlementRouter.use(authenticate)
settlementRouter.get  ('/:groupId', getSettlements)
settlementRouter.post ('/pay',      pay)

// ── Notifications ─────────────────────────────────────────────────────
import {
  getNotifications, markRead, markAllRead, deleteNotification,
} from '../controllers/notificationController.js'
export const notifRouter = express.Router()
notifRouter.use(authenticate)
notifRouter.get   ('/',              getNotifications)
notifRouter.patch ('/read-all',      markAllRead)
notifRouter.patch ('/:id/read',      markRead)
notifRouter.delete('/:id',           deleteNotification)

// ── Reports ───────────────────────────────────────────────────────────
import {
  getMonthlyReport, getCategoryReport, getSummary,
} from '../controllers/reportController.js'
export const reportRouter = express.Router()
reportRouter.use(authenticate)
reportRouter.get('/monthly',  getMonthlyReport)
reportRouter.get('/category', getCategoryReport)
reportRouter.get('/summary',  getSummary)
