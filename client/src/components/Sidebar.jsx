import { useApp, useAuth } from '../AppContext.jsx'
import { useRouter } from '../Router.jsx'
import { Avatar } from './ui.jsx'
import { cn } from '../utils.js'

const NAV = [
  { to:'/dashboard',      icon:'📊', label:'Dashboard' },
  { to:'/groups',         icon:'👥', label:'Groups' },
  { to:'/friends',        icon:'🤝', label:'Friends' },
  { to:'/activity',       icon:'🕐', label:'Activity' },
  { to:'/reports',        icon:'📈', label:'Reports' },
  { to:'/notifications',  icon:'🔔', label:'Notifications', badge:true },
  { to:'/settings',       icon:'⚙️',  label:'Settings' },
]

function NavItem({ to, icon, label, badge, unread, path, navigate, onClose }) {
  const active = path === to || (to !== '/dashboard' && path.startsWith(to))
  return (
    <button
      onClick={() => { navigate(to); onClose && onClose() }}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5',
        active ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
      )}
    >
      <span className="text-base w-5 text-center">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && unread > 0 && (
        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unread}</span>
      )}
    </button>
  )
}

export default function Sidebar({ open, onClose }) {
  const { state } = useApp()
  const { user, logout } = useAuth()
  const { path, navigate } = useRouter()
  const unread = state.notifications.filter(n => !n.read).length

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={onClose}/>}
      <aside 
        className={cn('app-sidebar bg-slate-900 dark:bg-slate-950 border-r border-white/[0.04] flex flex-col transition-transform duration-300', open && 'open')}>
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg">S</div>
            <div>
              <div className="text-white font-bold text-sm">SplitWise Pro</div>
              <div className="text-white/30 text-[10px] tracking-widest uppercase">Expense Tracker</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name || 'User'} color={user?.color} size="sm"/>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-white/35 text-[11px] truncate">{user?.email || ''}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="text-white/25 text-[10px] uppercase tracking-[1.2px] px-3 py-1.5 mb-1">Main</div>
          {NAV.slice(0,4).map(item => (
            <NavItem key={item.to} {...item} unread={unread} path={path} navigate={navigate} onClose={onClose}/>
          ))}
          <div className="text-white/25 text-[10px] uppercase tracking-[1.2px] px-3 py-1.5 mt-4 mb-1">Insights</div>
          {NAV.slice(4).map(item => (
            <NavItem key={item.to} {...item} unread={unread} path={path} navigate={navigate} onClose={onClose}/>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/35 hover:bg-white/[0.05] hover:text-white/70 transition-all">
            <span className="text-base w-5 text-center">🚪</span>Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
