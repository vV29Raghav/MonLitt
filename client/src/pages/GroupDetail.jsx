import { useState, useEffect } from 'react'
import { useRouter } from '../Router.jsx'
import { Card, StatCard, Button, Badge, Avatar, Tabs, SectionHeader, Modal, Input } from '../components/ui.jsx'
import AddExpenseModal from '../components/AddExpenseModal.jsx'
import ExpenseItem from '../components/ExpenseItem.jsx'
import { groups as apiGroups, expenses as apiExpenses, users as apiUsers, settlements as apiSettlements } from '../api.js'
import { fmt, toast } from '../utils.js'

function SettleRow({ debt, onPay }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
      background:'var(--elevated,#f8fafc)', borderRadius:10, marginBottom:6 }}>
      <Avatar name={debt.fromUser?.name || 'User'} color={debt.fromUser?.color} size="xs" />
      <span style={{ color:'#94a3b8' }}>→</span>
      <Avatar name={debt.toUser?.name || 'User'} color={debt.toUser?.color} size="xs" />
      <span style={{ flex:1, fontSize:12, color:'#64748b', marginLeft:2 }}>
        {(debt.fromUser?.name || 'Someone').split(' ')[0]} → {(debt.toUser?.name || 'Someone').split(' ')[0]}
      </span>
      <span style={{ fontWeight:700, fontSize:13, color:'#ef4444' }}>{fmt(debt.amount)}</span>
      <Button size="xs" variant="outline" onClick={onPay}>Pay</Button>
    </div>
  )
}

const TABS = [
  { id:'expenses', label:'Expenses' },
  { id:'activity', label:'Activity' },
]

export default function GroupDetail() {
  const { path, navigate } = useRouter()
  const groupId = path.split('/').pop()

  const [group, setGroup]         = useState(null)
  const [expenses, setExpenses]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('expenses')
  const [showAdd, setShowAdd]     = useState(false)
  const [showInvite, setInvite]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const fetchData = async () => {
    try {
      const [gRes, eRes] = await Promise.all([
        apiGroups.getById(groupId),
        apiExpenses.getByGroup(groupId)
      ])
      setGroup(gRes.data.group)
      setExpenses(eRes.data.expenses)
    } catch (err) {
      toast.error('Failed to load group details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (groupId) fetchData()
  }, [groupId])

  const handlePay = async (debt) => {
    try {
      await apiSettlements.pay({
        groupId,
        fromUserId: debt.fromUser._id,
        toUserId: debt.toUser._id,
        amount: debt.amount
      })
      toast.success('Settlement recorded ✅')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle')
    }
  }

  const handleSearch = async (q) => {
    setSearchQuery(q)
    if (q.length < 3) { setSearchResults([]); return }
    try {
      const res = await apiUsers.search(q)
      setSearchResults(res.data.users)
    } catch (err) {}
  }

  const handleAddMember = async (userId) => {
    try {
      await apiGroups.addMember(groupId, userId)
      toast.success('Member added! 🤝')
      setInvite(false)
      setSearchQuery('')
      setSearchResults([])
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Loading group details...</div>
  if (!group) return <div className="py-20 text-center text-red-500">Group not found</div>

  const debts = group.simplifiedDebts || []

  return (
    <>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28, flexWrap:'wrap' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>← Back</Button>
        <div style={{ width:40, height:40, borderRadius:12, background:(group.color || '#10b981')+'22',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
          {group.icon || '👥'}
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:2 }}>{group.name}</h1>
          <p style={{ fontSize:13, color:'#94a3b8' }}>{group.members.length} members · {group.category}</p>
        </div>
        <Button icon="+" onClick={() => setShowAdd(true)}>Add Expense</Button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}
           className="responsive-3col">
        <StatCard label="Total Expenses" value={fmt(group.totalExpenses || 0)} color="blue"   icon="📋" />
        <StatCard label={(group.myBalance || 0) >= 0 ? 'You Are Owed' : 'You Owe'}
                  value={fmt(Math.abs(group.myBalance || 0))}
                  color={(group.myBalance || 0) >= 0 ? 'emerald' : 'red'} icon={(group.myBalance || 0) >= 0 ? '💰' : '📤'} />
        <StatCard label="Members" value={group.members.length} color="amber" icon="👥" />
      </div>

      {/* Body */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }} className="responsive-sidebar">
        {/* Left */}
        <Card>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          {tab === 'expenses' && (
            <div>
              {expenses.length === 0 
                ? <div className="py-10 text-center text-slate-400 text-sm">No expenses yet</div>
                : expenses.map(e => <ExpenseItem key={e._id} expense={e} showGroup={false} />)
              }
            </div>
          )}
          {tab === 'activity' && (
            <div className="py-10 text-center text-slate-400 text-sm">Activity feed coming soon...</div>
          )}
        </Card>

        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Settle Up */}
          <Card>
            <SectionHeader title="Settle Up" sub="Simplified debts" />
            {debts.length === 0
              ? <div style={{ textAlign:'center', padding:'20px 0', color:'#10b981', fontWeight:600 }}>🎉 All settled!</div>
              : <>
                  {debts.map((d, i) => <SettleRow key={i} debt={d} onPay={() => handlePay(d)} />)}
                </>
            }
          </Card>

          {/* Members */}
          <Card>
            <SectionHeader title="Members"
              action={<Button variant="outline" size="xs" onClick={() => setInvite(true)}>+ Add</Button>} />
            {group.members.map((m, i) => (
              <div key={m.user?._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                borderBottom: i < group.members.length - 1 ? '1px solid var(--border,#f1f5f9)' : 'none' }}>
                <Avatar name={m.user?.name || 'User'} color={m.user?.color} size="sm" />
                <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{m.user?.name || 'User'}</span>
                {m.role === 'admin' && <Badge variant="gray">Admin</Badge>}
              </div>
            ))}
          </Card>
        </div>
      </div>

      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)} groupId={groupId} onAdded={fetchData} />

      <Modal open={showInvite} onClose={() => setInvite(false)} title="Add Member" size="sm">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Search for a user" placeholder="Name or email..." 
            value={searchQuery} onChange={e => handleSearch(e.target.value)} />
          
          <div className="max-h-60 overflow-y-auto">
            {searchResults.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                onClick={() => handleAddMember(u._id)}>
                <Avatar name={u.name} color={u.color} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <Button size="xs" variant="outline">Add</Button>
              </div>
            ))}
            {searchQuery.length >= 3 && searchResults.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">No users found</p>
            )}
          </div>
          
          <Button variant="secondary" full onClick={() => setInvite(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  )
}
