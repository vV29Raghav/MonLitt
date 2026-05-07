import { useState } from 'react'
import { useRouter } from '../Router.jsx'
import { useAuth } from '../AppContext.jsx'
import { Button, Input } from '../components/ui.jsx'
import { toast } from '../utils.js'

function AuthLayout({ title, sub, children }) {
  const { navigate } = useRouter()
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg">S</div>
          <span className="font-bold text-slate-900 dark:text-white">SplitWise Pro</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-400 mb-7">{sub}</p>
        {children}
        <button onClick={() => navigate('/')} className="mt-5 w-full text-center text-sm text-slate-400 hover:text-emerald-500 transition-colors">
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { navigate } = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('alex@splitwise.pro')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)
    if (success) navigate('/dashboard')
  }

  const handleDemo = async () => {
    // In a real app, you might have a demo endpoint
    // For now, let's try a default login or just show an error if no user exists
    toast.info('Demo login disabled. Please sign up or login with real credentials.')
  }

  return (
    <AuthLayout title="Welcome back" sub="Sign in to your account to continue">
      <button onClick={handleDemo}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-400 transition-all mb-4">
        🚀 Continue as Demo User
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"/>
        <span className="text-xs text-slate-400">or sign in with email</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"/>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email address" type="email" placeholder="alex@example.com"
          value={email} onChange={e => setEmail(e.target.value)} required/>
        <Input label="Password" type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)} required/>
        <div className="text-right">
          <button type="button" className="text-sm text-emerald-500 hover:underline">Forgot password?</button>
        </div>
        <Button type="submit" full loading={loading} size="lg">Sign In</Button>
      </form>
      <p className="text-center text-sm text-slate-400 mt-5">
        Don't have an account?{' '}
        <button onClick={() => navigate('/signup')} className="text-emerald-500 hover:underline font-medium">Sign up free</button>
      </p>
    </AuthLayout>
  )
}

export function SignupPage() {
  const { navigate } = useRouter()
  const { signup } = useAuth()
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.password) { toast.error('Please fill in all fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    const success = await signup({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      password: form.password
    })
    setLoading(false)
    if (success) {
      toast.success(`Welcome, ${form.firstName}! 🎉`)
      navigate('/dashboard')
    }
  }

  return (
    <AuthLayout title="Create account" sub="Join 50,000+ users already saving time">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" placeholder="Alex" value={form.firstName} onChange={e => set('firstName', e.target.value)} required/>
          <Input label="Last name"  placeholder="Johnson" value={form.lastName} onChange={e => set('lastName', e.target.value)}/>
        </div>
        <Input label="Email address" type="email" placeholder="alex@example.com"
          value={form.email} onChange={e => set('email', e.target.value)} required/>
        <Input label="Password" type="password" placeholder="Min 6 characters"
          value={form.password} onChange={e => set('password', e.target.value)} required/>
        <Button type="submit" full loading={loading} size="lg">Create Account</Button>
      </form>
      <p className="text-center text-sm text-slate-400 mt-5">
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} className="text-emerald-500 hover:underline font-medium">Sign in</button>
      </p>
    </AuthLayout>
  )
}
