import { useState, useEffect } from 'react'
import { useApp, useAuth } from '../AppContext.jsx'
import { users as apiUsers } from '../api.js'
import { Card, Button, Input, Select, Toggle, Avatar } from '../components/ui.jsx'
import { toast } from '../utils.js'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:32 }}>
      <h3 style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase',
        letterSpacing:'1px', paddingBottom:12, marginBottom:16,
        borderBottom:'1px solid var(--border,#f1f5f9)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Row({ label, desc, control }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 0', borderBottom:'1px solid var(--border,#f1f5f9)' }}>
      <div>
        <p style={{ fontSize:14, fontWeight:500 }}>{label}</p>
        {desc && <p style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{desc}</p>}
      </div>
      {control}
    </div>
  )
}

export default function Settings() {
  const { state, dispatch } = useApp()
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || 'INR',
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        currency: user.currency || 'INR'
      })
    }
  }, [user])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const [notifs, setN] = useState({
    email: true, invites: true, reminders: false, push: true
  })
  const setNotif = (k, v) => setN(n => ({ ...n, [k]: v }))

  const [passwords, setP] = useState({ current:'', next:'', confirm:'' })
  const setp = (k, v) => setP(p => ({ ...p, [k]: v }))

  const saveProfile = async () => {
    try {
      const res = await apiUsers.updateMe(form)
      updateUser(res.data.user)
      toast.success('Profile updated! ✅')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const savePassword = () => {
    if (!passwords.current) { toast.error('Enter current password'); return }
    if (passwords.next.length < 6) { toast.error('New password too short'); return }
    if (passwords.next !== passwords.confirm) { toast.error('Passwords do not match'); return }
    toast.success('Password changed! 🔒')
    setP({ current:'', next:'', confirm:'' })
  }

  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' })

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Settings</h1>
        <p style={{ color:'#94a3b8', fontSize:14 }}>Manage your account & preferences</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:24 }} className="responsive-sidebar">
        {/* Avatar card */}
        <Card style={{ alignSelf:'start', textAlign:'center', padding:'28px 20px' }}>
          <div style={{ margin: '0 auto 12px' }}>
            <Avatar name={user?.name || 'User'} color={user?.color} size="lg" />
          </div>
          <p style={{ fontWeight:700, fontSize:15 }}>{user?.name}</p>
          <p style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{user?.email}</p>
          <Button variant="secondary" size="sm" style={{ marginTop:14 }}
            onClick={() => toast.success('Photo upload coming soon!')}>
            Change Photo
          </Button>
        </Card>

        {/* Settings body */}
        <Card>
          {/* Profile */}
          <Section title="Profile Information">
            <Input label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} wrapClass="mb-4" />
            <Input label="Email" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} wrapClass="mb-4" />
            <Select label="Default Currency" value={form.currency}
              onChange={e => set('currency', e.target.value)} wrapClass="mb-5">
              <option value="INR">₹ INR – Indian Rupee</option>
              <option value="USD">$ USD – US Dollar</option>
              <option value="EUR">€ EUR – Euro</option>
              <option value="GBP">£ GBP – British Pound</option>
            </Select>
            <Button onClick={saveProfile}>Save Changes</Button>
          </Section>

          {/* Preferences */}
          <Section title="Preferences">
             <Row label="Dark Mode" desc="Switch to dark theme"
              control={<Toggle checked={state.isDark} onChange={toggleTheme} />} />
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            <Row label="Email Notifications" desc="Receive expense alerts via email"
              control={<Toggle checked={notifs.email} onChange={v => setNotif('email', v)} />} />
            <Row label="Group Invites" desc="Notify when added to a group"
              control={<Toggle checked={notifs.invites} onChange={v => setNotif('invites', v)} />} />
            <Row label="Push Notifications" desc="Real-time browser alerts"
              control={<Toggle checked={notifs.push} onChange={v => setNotif('push', v)} />} />
          </Section>

          {/* Security */}
          <Section title="Security">
            <Input label="Current Password" type="password" placeholder="••••••••"
              value={passwords.current} onChange={e => setp('current', e.target.value)}
              wrapClass="mb-3" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
              <Input label="New Password" type="password" placeholder="••••••••"
                value={passwords.next} onChange={e => setp('next', e.target.value)} />
              <Input label="Confirm Password" type="password" placeholder="••••••••"
                value={passwords.confirm} onChange={e => setp('confirm', e.target.value)} />
            </div>
            <Button variant="secondary" onClick={savePassword}>Update Password</Button>
          </Section>

          {/* Danger */}
          <Section title="Danger Zone">
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Button variant="danger" onClick={() => toast.error('Account deactivated')}>
                Deactivate Account
              </Button>
            </div>
          </Section>
        </Card>
      </div>
    </div>
  )
}
