# SplitWise Pro

A full-stack production-ready expense splitting app built with React + Node.js/Express.

## 🚀 Quick Start

### Option 1: Open the standalone demo (zero install)
```
open dist/index.html
```
Works directly in any modern browser. No server needed.

---

### Option 2: Full-stack local development

#### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

#### 1. Install dependencies
```bash
# Root
npm install

# Client (React + Vite)
cd client && npm install

# Server (Express)
cd ../server && npm install
```

#### 2. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env — set MONGODB_URI and JWT_SECRET
```

#### 3. Run both simultaneously
```bash
# From root
npm run dev
# → Client: http://localhost:5173
# → Server: http://localhost:5000
```

Or run separately:
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

---

## 📁 Project Structure

```
splitwise-pro/
├── dist/                     # ✅ Standalone bundled frontend (ready to open)
│   └── index.html            # Self-contained — open in browser
│
├── client/                   # React + Vite frontend (source)
│   ├── src/
│   │   ├── App.jsx           # Root component + routing
│   │   ├── AppContext.jsx    # Global state (React Context + useReducer)
│   │   ├── Router.jsx        # Lightweight client-side router
│   │   ├── components/
│   │   │   ├── ui.jsx        # Button, Input, Modal, Card, Badge, Avatar...
│   │   │   ├── Sidebar.jsx   # Navigation sidebar
│   │   │   ├── Topbar.jsx    # Top navigation bar
│   │   │   ├── AddExpenseModal.jsx
│   │   │   └── ExpenseItem.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Groups.jsx
│   │   │   ├── GroupDetail.jsx
│   │   │   ├── Friends.jsx
│   │   │   ├── Activity.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── AuthPages.jsx (Login + Signup)
│   │   ├── data/data.js      # Mock data for demo mode
│   │   └── utils.js          # Helpers, toast system
│   └── package.json
│
└── server/                   # Node.js + Express backend
    ├── src/
    │   ├── index.js          # Entry point — Express + Socket.IO
    │   ├── config/db.js      # MongoDB connection
    │   ├── models/index.js   # User, Group, Expense, Settlement, Notification
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── userController.js
    │   │   ├── groupController.js
    │   │   ├── expenseController.js
    │   │   ├── settlementController.js
    │   │   ├── notificationController.js
    │   │   └── reportController.js
    │   ├── routes/index.js   # All API routes
    │   ├── middleware/index.js # Auth, error handler, validate
    │   ├── sockets/index.js  # Socket.IO real-time events
    │   └── utils/balanceEngine.js # Debt simplification algorithm
    └── package.json
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/logout` | Invalidate refresh token |
| POST | `/api/auth/refresh` | Refresh access token |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Get all my groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Group details + simplified debts |
| PUT | `/api/groups/:id` | Update group |
| DELETE | `/api/groups/:id` | Delete group |
| POST | `/api/groups/:id/members` | Add member |
| DELETE | `/api/groups/:id/members/:userId` | Remove member |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/group/:groupId` | List expenses (paginated) |
| POST | `/api/expenses` | Add expense (equal/exact/percentage/shares) |
| PUT | `/api/expenses/:id` | Edit expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Settlements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settlements/:groupId` | History + simplified debts |
| POST | `/api/settlements/pay` | Record payment |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/monthly` | 6-month spending chart data |
| GET | `/api/reports/category` | Category breakdown |
| GET | `/api/reports/summary` | Total owed/owing |

---

## ⚡ Real-Time Events (Socket.IO)

Connect: `const socket = io('http://localhost:5000', { auth: { token } })`

Join a group room: `socket.emit('join_group', groupId)`

| Event (receive) | Payload |
|-----------------|---------|
| `expense_added` | `{ expense }` |
| `expense_updated` | `{ expense }` |
| `expense_deleted` | `{ expenseId, groupId }` |
| `balance_updated` | `{ groupId }` |
| `settlement_done` | `{ settlement }` |
| `group_member_added` | `{ groupId, user }` |
| `notification_new` | `{ title, message }` |

---

## 🛡️ Features

- ✅ JWT authentication with refresh tokens
- ✅ bcrypt password hashing (cost 12)
- ✅ Rate limiting (200 req/15min general, 20 for auth)
- ✅ Helmet security headers
- ✅ CORS configured for your client URL
- ✅ Input validation (express-validator)
- ✅ MongoDB indexes for fast queries
- ✅ Debt simplification algorithm (greedy min-transactions)
- ✅ Equal / Exact / Percentage / Shares split types
- ✅ Real-time updates via Socket.IO rooms
- ✅ Dark mode
- ✅ Fully responsive (mobile-first)
- ✅ Works as standalone HTML (no server needed for demo)

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel
```

### Backend → Railway / Render
```bash
# Set env vars in Railway/Render dashboard
# PORT, MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL
cd server
# Railway auto-detects package.json start script
```

### MongoDB → Atlas
1. Create free cluster at mongodb.com/atlas
2. Copy connection string to `MONGODB_URI` env var
