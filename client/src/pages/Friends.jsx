import { useState, useEffect } from 'react'
import { Card, Button, Modal, Input, Avatar, Badge, SectionHeader, EmptyState } from '../components/ui.jsx'
import ExpenseItem from '../components/ExpenseItem.jsx'
import { useAuth } from '../AppContext.jsx'
import { users as apiUsers, expenses as apiExpenses, auth as apiAuth } from '../api.js'
import { fmt, toast, cn } from '../utils.js'

function FriendDetail({ friend }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchShared = async () => {
      if (!friend) return
      setLoading(true)
      try {
        const res = await apiExpenses.getUserRecent() // We might need a specific shared endpoint later
        // Filter expenses where this friend is involved
        const shared = res.data.expenses.filter(exp => 
          exp.paidBy._id === friend._id || exp.splits.some(s => s.user === friend._id)
        )
        setExpenses(shared)
      } catch (err) {}
      setLoading(false)
    }
    fetchShared()
  }, [friend])

  if (!friend) return (
    <Card style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300 }}>
      <EmptyState icon="👈" title="Select a Friend"
        desc="Click a friend from the list to see shared expenses and balance." />
    </Card>
  )

  return (
    <Card>
      {/* Profile */}
      <div style={{ display:'flex', alignItems:'center', gap:16, paddingBottom:20, marginBottom:20,
        borderBottom:'1px solid var(--border,#f1f5f9)' }}>
        <Avatar name={friend.name} color={friend.color} size="lg" />
        <div style={{ flex:1 }}>
          <h3 style={{ fontSize:18, fontWeight:800, marginBottom:2 }}>{friend.name}</h3>
          <p style={{ fontSize:13, color:'#94a3b8' }}>{friend.email}</p>
        </div>
        <Button size="sm" onClick={() => toast.success('Settlement sent! ✅')}>Settle Up</Button>
      </div>

      <SectionHeader title="Shared Expenses" />
      {loading ? <div className="py-10 text-center text-slate-400">Loading expenses...</div> :
       expenses.length === 0 ? <div className="py-10 text-center text-slate-400 text-sm">No shared expenses found</div> :
       expenses.map(e => <ExpenseItem key={e._id} expense={e} />)}
    </Card>
  )
}

function AddFriendModal({ open, onClose, onAdded }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = async (v) => {
    setQuery(v)
    if (v.length < 3) { setResults([]); return }
    setLoading(true)
    try {
      const res = await apiUsers.search(v)
      setResults(res.data.users)
    } catch (err) {}
    setLoading(false)
  }

  const handleAdd = async (friendId) => {
    try {
      await apiUsers.addFriend(friendId)
      toast.success('Friend added! 🤝')
      onAdded && onAdded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add friend')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Friend" size="sm">
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Input label="Search by name or email" placeholder="priya@example.com"
          value={query} onChange={e => search(e.target.value)} />
        
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {results.map(u => (
            <div key={u._id} style={{ padding:12, background:'var(--elevated,#f8fafc)', borderRadius:12,
              display:'flex', alignItems:'center', gap:12, marginBottom: 8 }}>
              <Avatar name={u.name} color={u.color} size="sm" />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:500 }}>{u.name}</p>
                <p style={{ fontSize:12, color:'#94a3b8' }}>{u.email}</p>
              </div>
              <Button size="xs" onClick={() => handleAdd(u._id)}>Add</Button>
            </div>
          ))}
          {query.length >= 3 && results.length === 0 && !loading && (
            <p className="text-center text-sm text-slate-400 py-4">No users found</p>
          )}
        </div>
        <Button variant="secondary" full onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  )
}

export default function Friends() {
  const [friends, setFriends]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [loading, setLoading]     = useState(true)

  const fetchFriends = async () => {
    try {
      const res = await apiAuth.me()
      setFriends(res.data.user.friends || [])
    } catch (err) {}
    setLoading(false)
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        marginBottom:28, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Friends</h1>
          <p style={{ color:'#94a3b8', fontSize:14 }}>Manage balances with friends</p>
        </div>
        <Button icon="+" onClick={() => setShowAdd(true)}>Add Friend</Button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20 }} className="responsive-sidebar">
        {/* List */}
        <Card>
          <Input placeholder="🔍 Search friends..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom:16 }} wrapClass="mb-4" />

          {loading ? <div className="py-10 text-center text-slate-400">Loading...</div> :
           filtered.length === 0 && (
            <p style={{ textAlign:'center', color:'#94a3b8', fontSize:14, padding:'24px 0' }}>No friends found</p>
          )}

          {filtered.map(f => (
            <button key={f._id} onClick={() => setSelected(f)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 8px',
                borderBottom:'1px solid var(--border,#f1f5f9)', cursor:'pointer', textAlign:'left',
                background: selected?._id === f._id ? '#f0fdf4' : 'transparent',
                borderRadius: selected?._id === f._id ? 10 : 0,
                transition:'background .15s' }}>
              <Avatar name={f.name} color={f.color} size="sm" />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:500, overflow:'hidden',
                  textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</p>
                <p style={{ fontSize:12, marginTop:2, color: '#94a3b8' }}>
                  {f.email}
                </p>
              </div>
            </button>
          ))}
        </Card>

        {/* Detail */}
        <FriendDetail friend={selected} />
      </div>

      <AddFriendModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={fetchFriends} />
    </>
  )
}
