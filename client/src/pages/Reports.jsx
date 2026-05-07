import { useState, useEffect } from 'react'
import { Card, SectionHeader, Button, Badge } from '../components/ui.jsx'
import { reports as apiReports, expenses as apiExpenses } from '../api.js'
import { fmt, fmtK, fmtDate, catIcon, toast } from '../utils.js'

// ── Chart Components ────────────────────────────────────────────────
function BarChart({ data }) {
  if (!data || data.length === 0) return <div className="py-10 text-center text-slate-400 text-sm">No data available</div>
  const max = Math.max(...data.map(d => d.amount), 1)
  const BAR_W = 32, GAP = 12, H = 160, PAD = 20
  const svgW = data.length * (BAR_W + GAP)
  
  return (
    <div style={{ overflowX:'auto', padding:'10px 0' }}>
      <svg width="100%" viewBox={`0 0 ${svgW} ${H + PAD}`} style={{ height: H + PAD, minWidth: svgW }}>
        {data.map((d, i) => {
          const barH = Math.max(4, Math.round((d.amount / max) * H))
          const x = i * (BAR_W + GAP)
          const y = H - barH
          return (
            <g key={i}>
              <rect x={x} y={y} width={BAR_W} height={barH} rx="6" fill="#10b981" 
                opacity={i === data.length - 1 ? 1 : 0.4} />
              <text x={x + BAR_W/2} y={H + PAD - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.month}</text>
              <text x={x + BAR_W/2} y={y - 6} textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="600">{fmtK(d.amount)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function DonutChart({ data }) {
  if (!data || data.length === 0) return <div className="py-10 text-center text-slate-400 text-sm">No category data</div>
  const total = data.reduce((sum, d) => sum + d.amount, 0)
  const R = 60, CX = 80, CY = 80, STROKE = 18
  const CIRCUM = 2 * Math.PI * R
  let offset = 0

  return (
    <div style={{ display:'flex', alignItems:'center', gap:20, padding:'10px 0' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.map((d, i) => {
          const perc = d.amount / total
          const dash = perc * CIRCUM
          const res = (
            <circle key={i} cx={CX} cy={CY} r={R} fill="transparent"
              stroke={d.color} strokeWidth={STROKE}
              strokeDasharray={`${dash} ${CIRCUM}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${CX} ${CY})`} />
          )
          offset += dash
          return res
        })}
        <circle cx={CX} cy={CY} r={R - STROKE/2 - 2} fill="white" />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#1e293b">
          {fmtK(total)}
        </text>
      </svg>
      <div style={{ flex:1 }}>
        {data.slice(0, 5).map(d => (
          <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:d.color }} />
            <span style={{ fontSize:12, fontWeight:500, flex:1 }}>{d.name}</span>
            <span style={{ fontSize:11, color:'#94a3b8' }}>{Math.round(d.amount/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryBars({ data }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {data.map(d => (
        <div key={d.name}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
            <span style={{ fontWeight:600, textTransform:'capitalize' }}>{d.name}</span>
            <span style={{ color:'#64748b' }}>{fmt(d.amount)} ({Math.round(d.amount/total*100)}%)</span>
          </div>
          <div style={{ height:8, background:'#f1f5f9', borderRadius:10, overflow:'hidden' }}>
            <div style={{ height:'100%', background:d.color, width:`${(d.amount/total*100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monRes, catRes, expRes] = await Promise.all([
          apiReports.getMonthly(),
          apiReports.getCategory(),
          apiExpenses.getUserRecent()
        ])
        setMonthlyData(monRes.data.monthly)
        setCategoryData(catRes.data.categories)
        setExpenses(expRes.data.expenses)
      } catch (err) {
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="py-20 text-center text-slate-400">Loading analytics...</div>

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        marginBottom:28, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Reports</h1>
          <p style={{ color:'#94a3b8', fontSize:14 }}>Spending analytics & insights</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="secondary" size="sm" onClick={() => toast.success('Exporting CSV… 📊')}>Export CSV</Button>
          <Button variant="secondary" size="sm" onClick={() => toast.success('Generating PDF… 📄')}>Export PDF</Button>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}
           className="responsive-2col">
        <Card>
          <SectionHeader title="Monthly Spending" sub="Last 6 months"
            action={<Badge variant="green">Live Data</Badge>} />
          <BarChart data={monthlyData} />
        </Card>
        <Card>
          <SectionHeader title="By Category" sub="This month's breakdown" />
          <DonutChart data={categoryData} />
        </Card>
      </div>

      {/* Category breakdown */}
      <Card style={{ marginBottom:20 }}>
        <SectionHeader title="Category Breakdown" sub="Detailed breakdown" />
        <CategoryBars data={categoryData} />
      </Card>

      {/* Expense table */}
      <Card>
        <SectionHeader title="Expense History" sub={`${expenses.length} transactions`} />
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border,#f1f5f9)' }}>
                {['Description','Group','Date','Amount','Your Share'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Amount' || h === 'Your Share' ? 'right' : 'left',
                    padding:'8px 6px 10px', color:'#94a3b8', fontWeight:600,
                    fontSize:11, textTransform:'uppercase', letterSpacing:'.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e._id} style={{ borderBottom:'1px solid var(--border,#f1f5f9)' }}>
                  <td style={{ padding:'11px 6px', fontWeight:500 }}>
                    {catIcon(e.category)} {e.description}
                  </td>
                  <td style={{ padding:'11px 6px', color:'#64748b' }}>{e.groupId?.name || 'Private'}</td>
                  <td style={{ padding:'11px 6px', color:'#94a3b8' }}>{fmtDate(e.date)}</td>
                  <td style={{ padding:'11px 6px', textAlign:'right', fontWeight:600 }}>{fmt(e.amount)}</td>
                  <td style={{ padding:'11px 6px', textAlign:'right', fontWeight:700,
                    color: (e.myShare || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                    {(e.myShare || 0) >= 0 ? '+' : '−'}{fmt(Math.abs(e.myShare || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
