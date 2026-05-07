import { useRouter } from '../Router.jsx'
import { Button } from '../components/ui.jsx'

const FEATURES = [
  { icon:'⚡', title:'Real-Time Sync', desc:'Expenses update instantly via WebSockets. No refresh needed.' },
  { icon:'🧮', title:'Smart Debt Settlement', desc:'Algorithm minimizes total transactions to settle all debts optimally.' },
  { icon:'📊', title:'Spending Analytics', desc:'Visual charts, category breakdowns, and monthly trends.' },
  { icon:'🔒', title:'Bank-Level Security', desc:'JWT auth, bcrypt hashing, rate limiting, and HTTPS protection.' },
  { icon:'📱', title:'Fully Responsive', desc:'Works beautifully on mobile, tablet, and desktop.' },
  { icon:'🌍', title:'Multi-Currency', desc:'Support for INR, USD, EUR and 50+ currencies.' },
]

export default function LandingPage() {
  const { navigate } = useRouter()
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg">S</div>
          <span className="font-bold text-slate-900 dark:text-white">SplitWise Pro</span>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/login')}>Sign In</Button>
          <Button onClick={() => navigate('/signup')}>Get Started Free</Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          🎉 Trusted by 50,000+ teams worldwide
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6">
          Split expenses,<br/><span className="text-emerald-500">not friendships.</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Track shared expenses, split bills fairly, and settle debts instantly. The smartest way to manage money with friends, family, and teams.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" onClick={() => navigate('/signup')}>Start for Free →</Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>View Demo</Button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
