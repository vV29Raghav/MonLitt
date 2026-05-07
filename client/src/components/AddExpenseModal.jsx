import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from './ui.jsx'
import { useAuth } from '../AppContext.jsx'
import { groups as apiGroups, expenses as apiExpenses } from '../api.js'
import { toast, cn } from '../utils.js'

const SPLIT_TYPES = ['equal','exact','percentage','shares']
const CATS = [
  { v:'food',          l:'🍽️ Food & Dining' },
  { v:'travel',        l:'✈️ Travel' },
  { v:'housing',       l:'🏠 Housing' },
  { v:'entertainment', l:'🎬 Entertainment' },
  { v:'utilities',     l:'💡 Utilities' },
  { v:'shopping',      l:'🛍️ Shopping' },
  { v:'healthcare',    l:'⚕️ Healthcare' },
  { v:'other',         l:'💸 Other' },
]

export default function AddExpenseModal({ open, onClose, groupId: initialGroupId, onAdded }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    description: '', amount: '', currency: 'INR',
    groupId: '',
    paidBy: '', category: 'food',
    splitType: 'equal',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const [splitsData, setSplitsData] = useState({
    exactAmounts: {},
    percentages: {},
    sharesMap: {}
  })

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await apiGroups.getAll()
        setGroups(res.data.groups)
        const defaultG = initialGroupId || (res.data.groups.length > 0 ? res.data.groups[0]._id : 'personal')
        if (defaultG) {
          setForm(f => ({ ...f, groupId: defaultG, paidBy: user?._id }))
        }
      } catch (err) {}
    }
    if (open && user?._id) fetchGroups()
  }, [open, initialGroupId, user?._id])

  useEffect(() => {
    const fetchMembers = async () => {
      if (!form.groupId || form.groupId === 'personal') {
        const myId = user?._id
        if (myId) {
          setMembers([{ user: { _id: myId, name: 'You (Personal)', color: user?.color } }])
          setSplitsData({ exactAmounts: { [myId]: '' }, percentages: { [myId]: 100 }, sharesMap: { [myId]: 1 } })
        }
        return
      }
      try {
        const res = await apiGroups.getById(form.groupId)
        const mems = res.data.group.members
        setMembers(mems)
        
        // Initialize splits data
        const initialExact = {}
        const initialPct = {}
        const initialShares = {}
        mems.forEach(m => {
          initialExact[m.user._id] = ''
          initialPct[m.user._id] = ''
          initialShares[m.user._id] = '1'
        })
        setSplitsData({
          exactAmounts: initialExact,
          percentages: initialPct,
          sharesMap: initialShares
        })
      } catch (err) {}
    }
    fetchMembers()
  }, [form.groupId, user?._id])

  const setSplitVal = (type, userId, val) => {
    setSplitsData(prev => ({
      ...prev,
      [type]: { ...prev[type], [userId]: val }
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const { description, amount, paidBy, groupId } = form
    if (!groupId) { toast.error('Please select a group or personal'); return }
    if (!description.trim()) { toast.error('Please add a description'); return }
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) { toast.error('Please enter a valid amount'); return }
    if (!paidBy) { toast.error('Payer information missing. Please try logging in again.'); return }
    
    // Validation for specific split types
    if (form.splitType === 'exact') {
      const sum = Object.values(splitsData.exactAmounts).reduce((s, v) => s + parseFloat(v || 0), 0)
      if (Math.abs(sum - amount) > 0.01) {
        toast.error(`Total split amount (₹${sum}) must equal expense amount (₹${amount})`)
        return
      }
    } else if (form.splitType === 'percentage') {
      const sum = Object.values(splitsData.percentages).reduce((s, v) => s + parseFloat(v || 0), 0)
      if (Math.abs(sum - 100) > 0.01) {
        toast.error(`Total percentage (${sum}%) must equal 100%`)
        return
      }
    }

    setLoading(true)
    try {
      await apiExpenses.create({
        ...form,
        amount,
        exactAmounts: splitsData.exactAmounts,
        percentages: splitsData.percentages,
        sharesMap: splitsData.sharesMap
      })
      toast.success('Expense added! 🎉')
      onAdded && onAdded()
      onClose()
      setForm({ ...form, description: '', amount: '', note: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Expense">
      <form onSubmit={submit} className="space-y-4 px-1 pb-4">
        <Input label="Description" placeholder="e.g. Dinner at Barbeque Nation"
          value={form.description} onChange={e => set('description', e.target.value)} required/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Amount" type="number" placeholder="0.00" min="0" step="0.01"
            value={form.amount} onChange={e => set('amount', e.target.value)} required/>
          <Select label="Currency" value={form.currency} onChange={e => set('currency', e.target.value)}>
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </Select>
        </div>

        <Select label="Group / Personal" value={form.groupId} onChange={e => set('groupId', e.target.value)}>
          <option value="personal">👤 Personal Expense (Self)</option>
          {groups.map(g => <option key={g._id} value={g._id}>{g.icon} {g.name}</option>)}
        </Select>

        <Select label="Paid By" value={form.paidBy} onChange={e => set('paidBy', e.target.value)}>
          {members.map(m => (
            <option key={m.user._id} value={m.user._id}>
              {m.user._id === user?._id ? 'You' : m.user.name}
            </option>
          ))}
        </Select>

        <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
          {CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
        </Select>

        {/* Split Type */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Split Type</label>
          {form.groupId !== 'personal' && (
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
              {SPLIT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => set('splitType', t)}
                  className={cn('flex-1 py-1.5 text-xs font-medium rounded-lg transition-all capitalize',
                    form.splitType === t ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Split Inputs */}
          {form.groupId !== 'personal' && form.splitType !== 'equal' && (
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Split Details</p>
              {members.map(m => (
                <div key={m.user._id} className="flex items-center gap-3">
                  <span className="flex-1 text-sm">{m.user._id === user?._id ? 'You' : m.user.name}</span>
                  <div className="w-24">
                    {form.splitType === 'exact' && (
                      <Input type="number" placeholder="₹ 0" size="sm"
                        value={splitsData.exactAmounts[m.user._id]}
                        onChange={e => setSplitVal('exactAmounts', m.user._id, e.target.value)} />
                    )}
                    {form.splitType === 'percentage' && (
                      <Input type="number" placeholder="% 0" size="sm"
                        value={splitsData.percentages[m.user._id]}
                        onChange={e => setSplitVal('percentages', m.user._id, e.target.value)} />
                    )}
                    {form.splitType === 'shares' && (
                      <Input type="number" placeholder="1" size="sm"
                        value={splitsData.sharesMap[m.user._id]}
                        onChange={e => setSplitVal('sharesMap', m.user._id, e.target.value)} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)}/>
        <Input label="Note (optional)" placeholder="Any additional details..." value={form.note} onChange={e => set('note', e.target.value)}/>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" full onClick={onClose}>Cancel</Button>
          <Button type="submit" full loading={loading}>Add Expense</Button>
        </div>
      </form>
    </Modal>
  )
}
