import { useState, useEffect } from 'react'
import { useApp, useAuth } from '../AppContext.jsx'
import { useRouter } from '../Router.jsx'
import { Card, StatCard, SectionHeader, Button, Avatar, AvatarGroup, Badge, EmptyState } from '../components/ui.jsx'
import AddExpenseModal from '../components/AddExpenseModal.jsx'
import ExpenseItem from '../components/ExpenseItem.jsx'
import { reports, expenses as apiExpenses, groups as apiGroups, settlements as apiSettlements } from '../api.js'
import { fmt, fmtK, greeting, toast } from '../utils.js'

// ── Mini bar chart (pure SVG, no recharts) ──────────────────────────
function BarChart({ data }) {
  if (!data || data.length === 0) return <div className="py-10 text-center text-slate-400 text-sm">No data available</div>
  const max = Math.max(...data.map(d => d.amount), 1)
  const BAR_W = 28, GAP = 10, H = 160, PAD = 20
  const total = data.length
  const svgW = total * (BAR_W + GAP)

  return (
    <div style={{ overflowX:'auto' }}>
      <svg width="100%" viewBox={`0 0 ${svgW} ${H + PAD}`} style={{ height: H + PAD }}>
        {data.map((d, i) => {
          const barH = Math.max(6, Math.round((d.amount / max) * H))
          const x = i * (BAR_W + GAP)
          const y = H - barH
          return (
            <g key={`${d.year}-${d.month}`}>
              <rect
                x={x} y={y} width={BAR_W} height={barH}
                rx="6" fill="#10b981"
                opacity={i === data.length - 1 ? 1 : 0.3}
              />
              <text x={x + BAR_W / 2} y={H + PAD - 4}
                textAnchor="middle" fontSize="11" fill="#94a3b8">{d.month}</text>
              {i === data.length - 1 && (
                <text x={x + BAR_W / 2} y={y - 6}
                  textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="600">
                  {fmtK(d.amount)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function DebtRow({ debt, onPay }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
      background:'var(--elevated,#f8fafc)', borderRadius:12, marginBottom:8 }}>
      <Avatar name={debt.from} color={debt.fromColor} size="sm" />
      <span style={{ color:'#94a3b8', fontSize:16 }}>→</span>
      <Avatar name={debt.to}   color={debt.toColor}   size="sm" />
      <div style={{ flex:1, minWidth:0, marginLeft:2 }}>
        <p style={{ fontSize:12, fontWeight:500, color:'var(--text-secondary,#475569)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {debt.from.split(' ')[0]} → {debt.to.split(' ')[0]}
        </p>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:'#ef4444', marginRight:8 }}>{fmt(debt.amount)}</span>
      <Button size="xs" variant="outline" onClick={() => onPay(debt)}>Pay</Button>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { navigate } = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [summary, setSummary] = useState({ totalOwed: 0, totalOwe: 0, netBalance: 0 })
  const [recentExpenses, setRecentExpenses] = useState([])
  const [groups, setGroups] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  const name = user?.name?.split(' ')[0] || 'there'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, expRes, grpRes, monRes] = await Promise.all([
          reports.getSummary(),
          apiExpenses.getUserRecent(),
          apiGroups.getAll(),
          reports.getMonthly()
        ])
        setSummary(sumRes.data)
        setRecentExpenses(expRes.data.expenses)
        setGroups(grpRes.data.groups)
        setMonthlyData(monRes.data.monthly)
        
        // Derive pending settlements from groups
        const allDebts = []
        grpRes.data.groups.forEach(g => {
          if (g.simplifiedDebts) {
            g.simplifiedDebts.forEach(d => {
              if (d.fromUser?._id === user?._id || d.toUser?._id === user?._id) {
                allDebts.push({
                  ...d,
                  groupId: g._id,
                  from: d.fromUser?.name || 'User',
                  to: d.toUser?.name || 'User',
                  fromColor: d.fromUser?.color,
                  toColor: d.toUser?.color
                })
              }
            })
          }
        })
        setDebts(allDebts.slice(0, 5))
        setLoading(false)
      } catch (err) {
        toast.error('Failed to load dashboard data')
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePay = async (debt) => {
    try {
      await apiSettlements.pay({
        groupId: debt.groupId,
        fromUserId: debt.fromUser?._id,
        toUserId: debt.toUser?._id,
        amount: debt.amount
      })
      toast.success('Settlement recorded! ✅')
      window.location.reload()
    } catch (err) {
      toast.error('Failed to record settlement')
    }
  }

  return (
    <>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>
            {greeting()}, {name} 👋
          </h1>
          <p style={{ color:'#94a3b8', fontSize:14 }}>Here's your financial overview</p>
        </div>
        <Button icon="+" onClick={() => setShowAdd(true)}>Add Expense</Button>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:24 }}>
        <StatCard label="Owed to You" value={fmt(summary.totalOwed)}  sub="Across all groups"   color="emerald" icon="💰" />
        <StatCard label="You Owe"     value={fmt(summary.totalOwe)}   sub="Pending settlements" color="red"     icon="📤" />
        <StatCard label="Net Balance" value={(summary.netBalance >= 0 ? '+' : '') + fmt(summary.netBalance)} sub="Overall standing" color="blue"    icon="⚖️" />
        <StatCard label="This Month"  value={fmt(monthlyData[monthlyData.length-1]?.amount || 0)} sub="Total expenses"    color="amber"   icon="📋" />
      </div>

      {/* Middle row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}
           className="responsive-2col">
        {/* Recent Expenses */}
        <Card>
          <SectionHeader title="Recent Expenses" sub="Latest transactions"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>View All →</Button>} />
          {recentExpenses.length === 0 
            ? <div className="py-10 text-center text-slate-400 text-sm">No recent expenses</div>
            : recentExpenses.slice(0,5).map(e => <ExpenseItem key={e._id} expense={e} />)
          }
        </Card>

        {/* Monthly chart */}
        <Card>
          <SectionHeader title="Monthly Spending" sub="Last 6 months"
            action={<Badge variant="green">Live Data</Badge>} />
          <BarChart data={monthlyData} />
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}
           className="responsive-2col">
        {/* Pending Settlements */}
        <Card>
          <SectionHeader title="Pending Settlements" sub="Simplified debts" />
          {debts.length === 0
            ? <div style={{ textAlign:'center', padding:'24px 0', color:'#94a3b8', fontSize:14 }}>🎉 All settled up!</div>
            : debts.map((d, i) => <DebtRow key={i} debt={d} onPay={() => handlePay(d)} />)
          }
        </Card>

        {/* Active Groups */}
        <Card>
          <SectionHeader title="Active Groups" sub={`${groups.length} active groups`}
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>See All →</Button>} />
          {groups.length === 0 
            ? <div className="py-10 text-center text-slate-400 text-sm">No active groups</div>
            : groups.slice(0,4).map(g => (
            <div key={g._id} onClick={() => navigate('/groups/'+g._id)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                borderBottom:'1px solid var(--border,#f1f5f9)', cursor:'pointer' }}
              className="hover-row">
              <div style={{ width:36, height:36, borderRadius:10, background:(g.color || '#10b981')+'22',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {g.icon || '👥'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.name}</p>
                <p style={{ fontSize:12, color:'#94a3b8' }}>{g.members.length} members</p>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color: (g.myBalance || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                {(g.myBalance || 0) >= 0 ? '+' : '−'}{fmtK(Math.abs(g.myBalance || 0))}
              </span>
            </div>
          ))}
        </Card>
      </div>

      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)} />
    </>
  )
}
