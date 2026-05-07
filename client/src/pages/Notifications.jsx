import { useState, useEffect } from 'react'
import { Card, Button, Badge } from '../components/ui.jsx'
import { notifications as apiNotifs } from '../api.js'
import { toast } from '../utils.js'

const TYPE_ICONS = {
  expense:    '💸',
  settlement: '✅',
  invite:     '📨',
  reminder:   '⏰',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = async () => {
    try {
      const res = await apiNotifs.getAll()
      setNotifications(res.data.notifications)
    } catch (err) {}
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id) => {
    try {
      await apiNotifs.markRead(id)
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (err) {}
  }

  const markAllRead = async () => {
    try {
      await apiNotifs.markAllRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('All marked as read')
    } catch (err) {}
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        marginBottom:28, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Notifications</h1>
          {unreadCount > 0 && <p style={{ color:'#94a3b8', fontSize:14 }}>{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {loading ? <div className="py-10 text-center text-slate-400">Loading notifications...</div> :
         notifications.length === 0 ? (
          <Card>
            <div style={{ textAlign:'center', padding:'48px 0', color:'#94a3b8' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
              <p>You're all caught up!</p>
            </div>
          </Card>
        ) :
        notifications.map(n => (
          <div key={n._id} onClick={() => !n.read && markRead(n._id)}
            style={{ display:'flex', gap:12, padding:'14px 16px', borderRadius:16,
              border: n.read ? '1px solid var(--border,#e2e8f0)' : '1px solid #a7f3d0',
              background: n.read ? 'white' : '#f0fdf4',
              cursor: n.read ? 'default' : 'pointer',
              transition:'all .15s' }}>
            {/* Unread dot */}
            <div style={{ width:8, height:8, borderRadius:'50%',
              background: n.read ? 'transparent' : '#10b981',
              flexShrink:0, marginTop:6 }} />
            {/* Icon */}
            <div style={{ width:36, height:36, borderRadius:10, background:'#f1f5f9',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, flexShrink:0 }}>
              {TYPE_ICONS[n.type] || '🔔'}
            </div>
            {/* Content */}
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{n.title}</p>
              <p style={{ fontSize:13, color:'#64748b', lineHeight:1.5 }}>{n.message}</p>
              <p style={{ fontSize:11, color:'#94a3b8', marginTop:6 }}>{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.read && <Badge variant="green">New</Badge>}
          </div>
        ))}
      </div>
    </div>
  )
}
