import { useState, useEffect } from 'react'
import { Card, Button } from '../components/ui.jsx'
import { expenses as apiExpenses } from '../api.js'
import { fmtDate } from '../utils.js'
import ExpenseItem from '../components/ExpenseItem.jsx'

const FILTERS = [
  { id:'all',         label:'All' },
  { id:'expense',     label:'Expenses' },
]

export default function Activity() {
  const [filter, setFilter] = useState('all')
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await apiExpenses.getUserRecent()
        setActivities(res.data.expenses)
      } catch (err) {}
      setLoading(false)
    }
    fetchActivity()
  }, [])

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        marginBottom:28, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Activity</h1>
          <p style={{ color:'#94a3b8', fontSize:14 }}>Full history of all transactions</p>
        </div>
        {/* Filter chips */}
        <div style={{ display:'flex', gap:8 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding:'6px 14px', borderRadius:99, fontSize:13, fontWeight:500,
                border: filter === f.id ? '2px solid #10b981' : '1px solid #e2e8f0',
                background: filter === f.id ? '#ecfdf5' : 'transparent',
                color: filter === f.id ? '#059669' : '#64748b',
                cursor:'pointer', transition:'all .15s' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? <div className="py-10 text-center text-slate-400">Loading activity...</div> :
         activities.length === 0 ? <div className="py-10 text-center text-slate-400 text-sm">No recent activity</div> :
         activities.map((a) => (
          <ExpenseItem key={a._id} expense={a} />
        ))}
      </Card>
    </div>
  )
}
