import { useState, useEffect } from 'react'
import { useRouter } from '../Router.jsx'
import { Card, Button, Modal, Input, Select, Badge, AvatarGroup, Tabs, EmptyState } from '../components/ui.jsx'
import { groups as apiGroups } from '../api.js'
import { fmt, toast, cn } from '../utils.js'

const CATS = [
  { v:'Trip',   icon:'✈️', label:'Trip'   },
  { v:'Home',   icon:'🏠', label:'Home'   },
  { v:'Office', icon:'💼', label:'Office' },
  { v:'Other',  icon:'🎯', label:'Other'  },
]

function GroupCard({ group, onClick }) {
  return (
    <Card hover onClick={onClick} style={{ cursor:'pointer' }}>
      <div style={{ width:48, height:48, borderRadius:14, background:(group.color || '#10b981')+'22',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:14 }}>
        {group.icon || '👥'}
      </div>
      <h3 style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{group.name}</h3>
      <p style={{ fontSize:12, color:'#94a3b8', marginBottom:14 }}>{group.members.length} members · {group.category}</p>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        paddingTop:14, borderTop:'1px solid var(--border,#f1f5f9)' }}>
        <AvatarGroup members={group.members.map(m => m.user)} max={4} />
        <Badge variant={(group.myBalance || 0) >= 0 ? 'green' : 'red'}>
          {(group.myBalance || 0) >= 0 ? '+' : '−'}{fmt(Math.abs(group.myBalance || 0))}
        </Badge>
      </div>
    </Card>
  )
}

function CreateGroupModal({ open, onClose, onCreated }) {
  const [name, setName]     = useState('')
  const [cat, setCat]       = useState('Other')
  const [loading, setLoad]  = useState(false)

  const submit = async () => {
    if (!name.trim()) { toast.error('Please enter a group name'); return }
    setLoad(true)
    try {
      const res = await apiGroups.create({ name, category: cat, icon: CATS.find(c => c.v === cat)?.icon || '👥' })
      toast.success(`Group "${name}" created! 🎉`)
      onCreated(res.data.group)
      onClose(); setName(''); setCat('Other')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoad(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Group">
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Input label="Group Name" placeholder="e.g. Goa Trip 2024"
          value={name} onChange={e => setName(e.target.value)} />

        <div>
          <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:8 }}>Category</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {CATS.map(c => (
              <button key={c.v} onClick={() => setCat(c.v)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 8px',
                  borderRadius:12, border: cat===c.v ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: cat===c.v ? '#ecfdf5' : 'transparent',
                  cursor:'pointer', fontSize:22, gap:4, transition:'all .15s' }}>
                {c.icon}
                <span style={{ fontSize:11, color:'#64748b' }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <Button variant="secondary" full onClick={onClose}>Cancel</Button>
          <Button full loading={loading} onClick={submit}>Create Group</Button>
        </div>
      </div>
    </Modal>
  )
}

const TABS = [
  { id:'all',      label:'All Groups' },
  { id:'archived', label:'Archived', count:0 },
]

export default function Groups() {
  const { navigate } = useRouter()
  const [tab, setTab]       = useState('all')
  const [showCreate, setC]  = useState(false)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchGroups = async () => {
    try {
      const res = await apiGroups.getAll()
      setGroups(res.data.groups)
    } catch (err) {
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        marginBottom:28, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Groups</h1>
          <p style={{ color:'#94a3b8', fontSize:14 }}>Manage your expense groups</p>
        </div>
        <Button icon="+" onClick={() => setC(true)}>Create Group</Button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'all' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
          {groups.length === 0 && !loading && (
            <div className="col-span-full">
              <EmptyState icon="👥" title="No Groups Yet" desc="Create a group to start splitting expenses with friends!" />
            </div>
          )}
          {groups.map(g => (
            <GroupCard key={g._id} group={g} onClick={() => navigate('/groups/'+g._id)} />
          ))}
        </div>
      )}

      {tab === 'archived' && (
        <EmptyState icon="📦" title="No Archived Groups"
          desc="Groups you archive will appear here for reference." />
      )}

      <CreateGroupModal open={showCreate} onClose={() => setC(false)} onCreated={(newG) => setGroups([newG, ...groups])} />
    </div>
  )
}
