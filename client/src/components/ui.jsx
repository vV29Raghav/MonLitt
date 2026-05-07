import { useEffect, useState, useRef } from 'react'
import { cn, toast as toastSys } from '../utils.js'

// ── Button ────────────────────────────────────────────────────────────
const BTN_V = {
  primary:   'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:bg-emerald-700',
  secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
  ghost:     'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
  danger:    'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900',
  outline:   'border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-600 text-slate-600 dark:text-slate-300',
}
const BTN_S = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1',
  sm: 'px-3 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2',
}
export function Button({ children, variant='primary', size='md', className='', loading, icon, full, ...p }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
        BTN_V[variant], BTN_S[size], full && 'w-full', className
      )}
      disabled={p.disabled || loading} {...p}
    >
      {loading
        ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
        : icon && <span className="text-base">{icon}</span>
      }
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────
export function Input({ label, error, wrapClass='', iconL, iconR, ...p }) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapClass)}>
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        {iconL && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{iconL}</span>}
        <input
          className={cn(
            'w-full rounded-xl border bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100',
            'placeholder-slate-400 border-slate-200 dark:border-slate-700',
            'focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            error && 'border-red-400 focus:ring-red-300/40',
            iconL && 'pl-9', iconR && 'pr-9'
          )} {...p}
        />
        {iconR && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{iconR}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────
export function Select({ label, wrapClass='', children, ...p }) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapClass)}>
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <select
        className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all cursor-pointer"
        {...p}
      >{children}</select>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size='md' }) {
  const sizes = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-2xl' }
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className={cn('relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/60 max-h-[90vh] overflow-y-auto animate-modal', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────
export function Card({ children, className='', hover, onClick, pad=true }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm',
        pad && 'p-5',
        hover && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-400/50',
        onClick && 'cursor-pointer',
        className
      )}
    >{children}</div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color='emerald', icon }) {
  const border = { emerald:'border-l-emerald-400', red:'border-l-red-400', blue:'border-l-blue-400', amber:'border-l-amber-400' }[color]
  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 p-5 shadow-sm', border)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        {icon}<span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────
export function Avatar({ name='', color, size='md', src, className='' }) {
  const sz = { xs:'w-6 h-6 text-[9px]', sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-12 h-12 text-base', xl:'w-16 h-16 text-xl' }[size]
  const ini = name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  if (src) return <img src={src} alt={name} className={cn('rounded-full object-cover flex-shrink-0', sz, className)}/>
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0', sz, className)}
      style={{ background: color || '#22a05a' }}>
      {ini}
    </div>
  )
}

export function AvatarGroup({ members=[], max=4 }) {
  const vis = members.slice(0, max), rest = members.length - max
  return (
    <div className="flex">
      {vis.map((m,i) => (
        <div key={m.id||i} className="-ml-2 first:ml-0" title={m.name}>
          <Avatar name={m.name} color={m.color} size="xs" className="ring-2 ring-white dark:ring-slate-900"/>
        </div>
      ))}
      {rest > 0 && (
        <div className="-ml-2 w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-semibold text-slate-600 dark:text-slate-300">+{rest}</div>
      )}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────
export function Badge({ children, variant='gray', className='' }) {
  const V = {
    green:  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    red:    'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    amber:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    blue:   'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
    gray:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  }
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', V[variant], className)}>{children}</span>
}

// ── Toggle ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1', checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700')}
    >
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200', checked ? 'translate-x-6' : 'translate-x-1')}/>
    </button>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150',
            active === t.id ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}>
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-full px-1.5 py-0.5">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────
export function EmptyState({ icon='📭', title, desc, action }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs mx-auto mb-5">{desc}</p>
      {action}
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ className='' }) {
  return <div className={cn('rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse', className)}/>
}

// ── Toast Container ───────────────────────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    toastSys._listeners.add(setToasts)
    return () => toastSys._listeners.delete(setToasts)
  }, [])
  const icons = { success:'✅', error:'❌', info:'ℹ️' }
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={cn(
            'flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-slide-in',
            t.type === 'success' && 'border-l-4 border-l-emerald-400',
            t.type === 'error' && 'border-l-4 border-l-red-400',
          )}>
          <span>{icons[t.type]}</span>
          <span className="text-slate-800 dark:text-slate-200">{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
