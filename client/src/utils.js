export const fmt = (amount, currency = 'INR') => {
  const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || '₹'
  return `${sym}${Math.abs(amount).toLocaleString('en-IN')}`
}

export const fmtK = (amount, currency = 'INR') => {
  const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || '₹'
  if (Math.abs(amount) >= 1000) return `${sym}${(Math.abs(amount)/1000).toFixed(1)}k`
  return `${sym}${Math.abs(amount).toLocaleString('en-IN')}`
}

export const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
  } catch { return d }
}

export const catIcon = (c = '') => ({
  food: '🍽️', travel: '✈️', housing: '🏠', home: '🏠',
  entertainment: '🎬', utilities: '💡', shopping: '🛍️', healthcare: '⚕️'
}[c.toLowerCase()] || '💸')

export const catBg = (c = '') => ({
  food: '#fef3c7', travel: '#dbeafe', housing: '#d1fae5', home: '#d1fae5',
  entertainment: '#f3e8ff', utilities: '#f1f5f9', shopping: '#fce7f3'
}[c.toLowerCase()] || '#f1f5f9')

export const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export const initials = (name = '') =>
  name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()

export const cn = (...args) => args.filter(Boolean).join(' ')

// Toast system
let toastId = 0
const toastListeners = new Set()
const toasts = []

export const toast = {
  _listeners: toastListeners,
  _toasts: toasts,
  show(msg, type = 'success') {
    const t = { id: ++toastId, msg, type }
    toasts.unshift(t)
    if (toasts.length > 5) toasts.pop()
    toastListeners.forEach(fn => fn([...toasts]))
    setTimeout(() => {
      const i = toasts.findIndex(x => x.id === t.id)
      if (i !== -1) toasts.splice(i, 1)
      toastListeners.forEach(fn => fn([...toasts]))
    }, 3200)
  },
  success(msg) { this.show(msg, 'success') },
  error(msg)   { this.show(msg, 'error') },
  info(msg)    { this.show(msg, 'info') },
}
