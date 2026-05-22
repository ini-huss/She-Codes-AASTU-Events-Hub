import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../components/constants'
import api from '../api'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24))
}

export default function MyEventsPage() {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [tab, setTab]                     = useState('upcoming')
  const [cancellingId, setCancellingId]   = useState(null)

  useEffect(() => {
    api.get('/registrations/my-registrations')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.registrations || [])
        setRegistrations(data)
      })
      .catch(() => setError('Failed to load your registrations.'))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = registrations.filter(r => {
    if (r.status === 'cancelled') return false
    const d = daysUntil(r.event?.date)
    return d === null || d >= 0
  }).sort((a, b) => new Date(a.event?.date) - new Date(b.event?.date))

  const past = registrations.filter(r => {
    if (r.status === 'cancelled') return false
    const d = daysUntil(r.event?.date)
    return d !== null && d < 0
  })

  async function handleCancel(reg) {
    const regId = reg._id || reg.id
    setCancellingId(regId)
    try {
      await api.delete(`/registrations/${regId}/cancel`)
      setRegistrations(prev => prev.map(r =>
        (r._id || r.id) === regId ? { ...r, status: 'cancelled' } : r
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.')
    } finally {
      setCancellingId(null)
    }
  }

  const list = tab === 'upcoming' ? upcoming : past

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>My Events</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 15 }}>All events you've registered for.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: COLORS.bgCard, borderRadius: 12, padding: 4, border: `1px solid ${COLORS.border}`, width: 'fit-content' }}>
        {[
          { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { id: 'past',     label: `Past (${past.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === t.id ? COLORS.accent : 'transparent',
            color: tab === t.id ? '#fff' : COLORS.textMuted,
            fontSize: 14, fontWeight: tab === t.id ? 700 : 400, transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, height: 100, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: COLORS.red }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div>{error}</div>
        </div>
      )}

      {/* List */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: COLORS.textMuted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === 'upcoming' ? '📅' : '🏁'}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
                {tab === 'upcoming' ? 'No upcoming events' : 'No past events yet'}
              </div>
              {tab === 'upcoming' && (
                <>
                  <div style={{ fontSize: 14, marginBottom: 20 }}>Register for events to see them here.</div>
                  <button onClick={() => navigate('/events')} style={{ background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Browse Events
                  </button>
                </>
              )}
            </div>
          ) : list.map(reg => {
            const ev    = reg.event || {}
            const days  = daysUntil(ev.date)
            const urgency = days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : days !== null && days <= 3 ? `${days} DAYS` : null
            const regId = reg._id || reg.id
            const isCancelling = cancellingId === regId

            return (
              <div key={regId} style={{ background: COLORS.bgCard, border: `1px solid ${urgency ? COLORS.accent + '66' : COLORS.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex' }}>
                {ev.imageUrl
                  ? <img src={ev.imageUrl} alt={ev.title} style={{ width: 100, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 100, background: `${COLORS.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🎪</div>
                }
                <div style={{ padding: '16px 18px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.text }}>{ev.title || '—'}</h3>
                    {urgency && (
                      <span style={{ background: urgency === 'TODAY' ? COLORS.red : COLORS.yellow, color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                        {urgency}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>📅 {ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>📍 {ev.location || '—'}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                    Ticket: <span style={{ color: !ev.price || ev.price === 0 ? COLORS.free : COLORS.paid, fontWeight: 700 }}>
                      {!ev.price || ev.price === 0 ? 'Free' : `ETB ${ev.price}`}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                  <button onClick={() => navigate(`/events/${ev._id}`)} style={{ background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.accentLight, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                    View
                  </button>
                  {tab === 'upcoming' && (
                    <button onClick={() => handleCancel(reg)} disabled={isCancelling} style={{ background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: isCancelling ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      onMouseEnter={e => { if (!isCancelling) { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red } }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted }}
                    >
                      {isCancelling && <span style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: COLORS.textMuted, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                      {isCancelling ? '...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
