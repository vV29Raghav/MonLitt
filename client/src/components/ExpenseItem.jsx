import { catIcon, catBg, fmt, fmtDate, cn } from '../utils.js'

export default function ExpenseItem({ expense, showGroup = true }) {
  const { description, amount, paidBy, category, date, myShare, settled } = expense
  const gName = expense.groupName || (expense.groupId && typeof expense.groupId === 'object' ? expense.groupId.name : null)
  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: catBg(category) }}>
        {catIcon(category)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{description}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {paidBy?.name || 'Someone'} paid
          {showGroup && gName && <> · <span className="text-slate-500">{gName}</span></>}
          {' · '}{fmtDate(date)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{fmt(amount)}</p>
        {myShare !== undefined && (
          <p className={cn('text-xs font-medium mt-0.5',
            myShare > 0 ? 'text-emerald-500' : myShare < 0 ? 'text-red-500' : 'text-slate-400')}>
            {myShare > 0 ? '+' : myShare < 0 ? '−' : ''}{myShare !== 0 ? fmt(Math.abs(myShare)) : 'settled'}
          </p>
        )}
        {settled && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full px-1.5 py-0.5">settled</span>}
      </div>
    </div>
  )
}
