import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { COLORS } from '../components/constants'
import api from '../api'
import { getSession } from '../App'

const CAT_COLORS = {
  tech: '#3b82f6', workshop: '#ffd166', seminar: '#1de9b6',
  social: '#ff6b9d', sports: '#4cc9f0', arts: '#a855f7',
  career: '#22c55e', other: '#6b7280',
}
function catColor(c) { return CAT_COLORS[c?.toLowerCase()] || '#7c83fd' }

export default function EventDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const session    = getSession()

  const [event, setEvent]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [myReg, setMyReg]           = useState(null)   // registration object if registered
  const [regLoading, setRegLoading] = useState(false)
  const [regMsg, setRegMsg]         = useState('')
  const [regErr, setRegErr]         = useState('')

  // Load event + check if already registered
  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/events/${id}`),
      session ? api.get('/registrations/my-registrations') : Promise.resolve(null),
    ])
      .then(([evtRes, regRes]) => {
        setEvent(evtRes.data.event || evtRes.data)
        if (regRes) {
          const regs = Array.isArray(regRes.data) ? regRes.data : (regRes.data.registrations || [])
          const found = regs.find(r => {
            const evtId = r.event?._id || r.event
            return String(evtId) === String(id)
          })
          if (found) setMyReg(found)
        }
      })
      .catch(() => setError('Failed to load event. Please try again.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleRegister() {
    if (!session) { navigate('/auth'); return }
    setRegLoading(true); setRegErr(''); setRegMsg('')
    try {
      const res = await api.post(`/registrations/${id}/register`)
      setMyReg(res.data.registration || res.data)
      setRegMsg('You have successfully registered for this event!')
      // Update local count
      setEvent(prev => prev ? { ...prev, registeredCount: (prev.registeredCount || 0) + 1 } : prev)
    } catch (err) {
      setRegErr(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setRegLoading(false)
    }
  }

  async function handleCancel() {
    if (!myReg) return
    setRegLoading(true); setRegErr(''); setRegMsg('')
    try {
      const regId = myReg._id || myReg.id
      await api.delete(`/registrations/${regId}/cancel`)
      setMyReg(null)
      setRegMsg('')
      setEvent(prev => prev ? { ...prev, registeredCount: Math.max(0, (prev.registeredCount || 1) - 1) } : prev)
    } catch (err) {
      setRegErr(err.response?.data?.message || 'Cancellation failed. Please try again.')
    } finally {
      setRegLoading(false)
    }
  }

  if (loading) return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px' }}>
      <div style={{ background: COLORS.bgCard, borderRadius: 24, height: 500, animation: 'pulse 1.5s infinite' }} />
    </div>
  )

  if (error || !event) return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', textAlign: 'center', color: COLORS.textMuted }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>{error || 'Event not found'}</div>
      <button onClick={() => navigate('/events')} style={{ background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>
        ← Back to Events
      </button>
    </div>
  )

  const isFree     = !event.price || event.price === 0
  const isFull     = event.capacity && (event.registeredCount || 0) >= event.capacity
  const spotsLeft  = event.capacity ? event.capacity - (event.registeredCount || 0) : null
  const cc         = catColor(event.category)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Back */}
      <button onClick={() => navigate('/events')} style={{ background: 'none', border: 'none', color: COLORS.textMuted, fontSize: 14, cursor: 'pointer', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
        onMouseEnter={e => e.currentTarget.style.color = COLORS.text}
        onMouseLeave={e => e.currentTarget.style.color = COLORS.textMuted}
      >
        ← Back to Events
      </button>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.borderLight}`, borderRadius: 24, overflow: 'hidden' }}>
        {/* Hero image */}
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: 220, background: `linear-gradient(135deg, ${cc}33, ${COLORS.accent}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🎪</div>
        }

        <div style={{ padding: '28px 32px 36px' }}>
          {/* Category badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ background: cc, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{event.category}</span>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>
              {event.status === 'published' ? <span style={{ color: COLORS.green }}>● Published</span> : event.status}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: COLORS.text, marginBottom: 24, lineHeight: 1.2 }}>
            {event.title}
          </h1>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28, padding: '20px 24px', background: COLORS.bg, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
            {[
              { icon: '📅', label: 'Date', value: event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { icon: '📍', label: 'Location', value: event.location },
              { icon: '🏢', label: 'Organizer', value: event.organizer || (event.createdBy?.name) || '—' },
              { icon: '💰', label: 'Price', value: isFree ? 'Free Entry' : `ETB ${event.price}` },
              ...(event.capacity ? [{ icon: '👥', label: 'Capacity', value: `${event.registeredCount || 0} / ${event.capacity} registered` }] : []),
              ...(spotsLeft !== null ? [{ icon: '🎟️', label: 'Spots Left', value: isFull ? 'FULL' : `${spotsLeft} spots remaining` }] : []),
            ].map(({ icon, label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, marginBottom: 4 }}>{icon} {label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: isFull && label === 'Spots Left' ? COLORS.red : COLORS.text }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>About this event</h2>
              <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.8 }}>{event.description}</p>
            </div>
          )}

          {/* Price highlight */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '16px 20px', background: COLORS.bg, borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>TICKET PRICE</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: isFree ? COLORS.free : COLORS.paid }}>
                {isFree ? 'Free Entry' : `ETB ${event.price}`}
              </div>
            </div>
            {spotsLeft !== null && !isFull && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>SPOTS LEFT</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: spotsLeft <= 10 ? COLORS.yellow : COLORS.green }}>{spotsLeft}</div>
              </div>
            )}
          </div>

          {/* Registration action */}
          {regMsg && (
            <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 12, padding: '16px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
              <div style={{ color: '#86efac', fontWeight: 700, fontSize: 15 }}>{regMsg}</div>
            </div>
          )}
          {regErr && (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 14, marginBottom: 16 }}>
              {regErr}
            </div>
          )}

          {!session ? (
            <div style={{ background: `${COLORS.accent}12`, border: `1px solid ${COLORS.accent}33`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 12 }}>
                💡 You need to be signed in to register for this event.
              </div>
              <button onClick={() => navigate('/auth')} style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Sign In to Register →
              </button>
            </div>
          ) : myReg ? (
            <div>
              <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 12, padding: '16px', textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                <div style={{ color: '#86efac', fontWeight: 700, fontSize: 15 }}>You're registered for this event!</div>
                <div style={{ color: '#4ade80', fontSize: 13, marginTop: 4 }}>See you there 🎉</div>
              </div>
              <button onClick={handleCancel} disabled={regLoading} style={{
                width: '100%', background: 'none', border: `1px solid ${COLORS.border}`,
                color: COLORS.textMuted, borderRadius: 12, padding: '12px',
                fontSize: 14, cursor: regLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {regLoading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: COLORS.textMuted, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                {regLoading ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            </div>
          ) : isFull ? (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 12, padding: '16px', textAlign: 'center', color: '#fca5a5', fontSize: 15, fontWeight: 700 }}>
              ⚠️ This event is at full capacity
            </div>
          ) : (
            <button onClick={handleRegister} disabled={regLoading} style={{
              width: '100%', background: regLoading ? COLORS.border : `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`,
              color: '#fff', border: 'none', borderRadius: 12, padding: '15px',
              fontSize: 16, fontWeight: 700, cursor: regLoading ? 'not-allowed' : 'pointer',
              boxShadow: regLoading ? 'none' : `0 4px 20px ${COLORS.accentGlow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}>
              {regLoading && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
              {regLoading ? 'Registering...' : 'Register Now →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
