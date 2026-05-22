import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../components/constants'
import api from '../api'
import { getSession } from '../App'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24))
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const session  = getSession()
  const student  = session?.user

  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    api.get('/registrations/my-registrations')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.registrations || [])
        setRegistrations(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const upcoming = registrations.filter(r => {
    if (r.status === 'cancelled') return false
    const d = daysUntil(r.event?.date)
    return d === null || d >= 0
  })

  const past = registrations.filter(r => {
    if (r.status === 'cancelled') return false
    const d = daysUntil(r.event?.date)
    return d !== null && d < 0
  })

  if (!student) return null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40, padding: '28px 32px', background: COLORS.bgCard, borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
            Welcome back, {student.name.split(' ')[0]}! 👋
          </h1>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>
            {student.email}
            {student.role && <span> · {student.role}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
          {[
            { label: 'Registered', value: loading ? '…' : registrations.filter(r => r.status !== 'cancelled').length, color: COLORS.accent },
            { label: 'Upcoming',   value: loading ? '…' : upcoming.length, color: COLORS.green },
            { label: 'Past',       value: loading ? '…' : past.length, color: COLORS.textMuted },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px 18px', background: COLORS.bg, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { icon: '🎪', label: 'Browse Events', path: '/events' },
          { icon: '📋', label: 'My Events', path: '/my-events' },
        ].map(l => (
          <button key={l.path} onClick={() => navigate(l.path)} style={{
            background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16,
            padding: '20px 24px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s,transform 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{l.icon}</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: COLORS.text }}>{l.label}</div>
          </button>
        ))}
      </div>

      {/* Upcoming events preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.text }}>Upcoming Events</h2>
          <button onClick={() => navigate('/my-events')} style={{ background: 'none', border: 'none', color: COLORS.accentLight, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            View all →
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => <div key={i} style={{ background: COLORS.bgCard, borderRadius: 14, height: 80, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: COLORS.textMuted, background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>No upcoming events</div>
            <button onClick={() => navigate('/events')} style={{ background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
              Browse Events
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.slice(0, 3).map(reg => {
              const ev   = reg.event || {}
              const days = daysUntil(ev.date)
              const urgency = days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : days !== null && days <= 3 ? `${days} DAYS` : null
              return (
                <div key={reg._id} style={{ background: COLORS.bgCard, border: `1px solid ${urgency ? COLORS.accent + '55' : COLORS.border}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                  onClick={() => navigate(`/events/${ev._id}`)}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${COLORS.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🎪</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 14 }}>{ev.title || '—'}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>
                      📅 {ev.date ? new Date(ev.date).toLocaleDateString() : '—'} · 📍 {ev.location || '—'}
                    </div>
                  </div>
                  {urgency && (
                    <span style={{ background: urgency === 'TODAY' ? COLORS.red : COLORS.yellow, color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>
                      {urgency}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
