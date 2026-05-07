import { useState } from 'react'
import { useApp } from '../AppContext.jsx'
import { useRouter } from '../Router.jsx'
import { Avatar } from './ui.jsx'
import AddExpenseModal from './AddExpenseModal.jsx'

const TITLES = {
  '/dashboard':     'Dashboard',
  '/groups':        'Groups',
  '/friends':       'Friends',
  '/activity':      'Activity',
  '/reports':       'Reports',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
}

export default function Topbar({ onMenu }) {
  const { state, dispatch } = useApp()
  const { path, navigate } = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const unread = state.notifications.filter(n => !n.read).length

  const base = '/' + path.split('/')[1]
  const title = path.startsWith('/groups/') ? 'Group Detail' : (TITLES[base] || 'SplitWise Pro')

  return (
    <>
      <header 
        className="sticky top-0 right-0 h-16 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 md:px-6 gap-3 w-full">
        {/* Hamburger */}
        <button onClick={onMenu}
          className="md:hidden w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
          ☰
        </button>

        {/* Title */}
        <h1 className="font-bold text-xl text-slate-900 dark:text-white mr-auto">{title}</h1>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all">
            + Add Expense
          </button>

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')}
            className="relative w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base text-slate-500 hover:border-emerald-400 transition-colors">
            🔔
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"/>}
          </button>

          {/* Theme */}
          <button onClick={() => dispatch({ type:'TOGGLE_THEME' })}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base text-slate-500 hover:border-emerald-400 transition-colors">
            {state.isDark ? '☀️' : '🌙'}
          </button>

          {/* Avatar */}
          <button onClick={() => navigate('/settings')}>
            <Avatar name={state.user?.name || 'User'} color="#22a05a" size="sm"
              className="ring-2 ring-transparent hover:ring-emerald-400 transition-all cursor-pointer"/>
          </button>
        </div>
      </header>

      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)}/>
    </>
  )
}
