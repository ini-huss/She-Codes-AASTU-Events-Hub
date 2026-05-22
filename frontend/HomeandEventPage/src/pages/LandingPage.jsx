import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../components/constants'
import api from '../api'
import { getSession } from '../App'

// ── Event preview card — clicking navigates to detail page ───────────────────
function PreviewCard({ ev }) {
  const navigate = useNavigate()
  const free = !ev.price || ev.price === 0
  return (
    <div
      onClick={() => navigate(`/events/${ev._id || ev.id}`)}
      style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s,transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = 'none' }}
    >
      {ev.imageUrl
        ? <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', height: 150, background: `linear-gradient(135deg,${COLORS.accent}22,#06b6d422)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🎪</div>
      }
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.accentLight, letterSpacing: 1, marginBottom: 5 }}>{ev.category?.toUpperCase()}</div>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 6, lineHeight: 1.3 }}>{ev.title}</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 3 }}>📅 {ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>📍 {ev.location}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: free ? COLORS.free : COLORS.paid }}>{free ? 'Free' : `ETB ${ev.price}`}</span>
          {ev.registeredCount > 0 && <span style={{ fontSize: 11, color: COLORS.textMuted }}>👥 {ev.registeredCount}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate  = useNavigate()
  const session   = getSession()
  const student   = session?.user || null
  const [visible, setVisible]     = useState(false)
  const [events, setEvents]       = useState([])
  const [loadingEvts, setLoading] = useState(true)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  useEffect(() => {
    api.get('/events?limit=6&upcoming=true')
      .then(res => setEvents(res.data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  function handleGetStarted() {
    if (student) { navigate('/events'); return }
    navigate('/auth')
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── HERO ── */}
      <section style={{ minHeight: '94vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '8%', left: '3%', width: 560, height: 560, borderRadius: '50%', background: `radial-gradient(circle,${COLORS.accentGlow} 0%,transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '3%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 800, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)', transition: 'all 0.9s cubic-bezier(.16,1,.3,1)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.25)', borderRadius: 50, padding: '6px 18px', marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.free, display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.accentLight, letterSpacing: 0.6 }}>
              {events.length > 0 ? `${events.length} EVENT${events.length !== 1 ? 'S' : ''} OPEN FOR REGISTRATION` : 'AASTU OFFICIAL EVENT PLATFORM'}
            </span>
          </div>

          {student && (
            <div style={{ marginBottom: 16, fontSize: 'clamp(16px,2vw,20px)', color: COLORS.textMuted, fontWeight: 500 }}>
              Welcome back, <span style={{ color: COLORS.accentLight, fontWeight: 700 }}>{student.name.split(' ')[0]}</span>! 👋
            </div>
          )}

          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(38px,6.5vw,72px)', fontWeight: 800, color: COLORS.text, lineHeight: 1.08, marginBottom: 22, letterSpacing: '-1.5px' }}>
            Every Campus Event,<br />
            <span style={{ background: `linear-gradient(135deg,${COLORS.accent},#06b6d4)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One Place
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: COLORS.textMuted, lineHeight: 1.75, maxWidth: 560, margin: '0 auto 44px' }}>
            AASTU Events Hub is where students discover workshops, hackathons, cultural nights, sports events and more — all verified and live the moment admins approve them.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleGetStarted} style={{ background: `linear-gradient(135deg,${COLORS.accent},#a259ff)`, color: '#fff', border: 'none', borderRadius: 14, padding: '15px 38px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 32px ${COLORS.accentGlow}`, transition: 'transform 0.2s,box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 16px 44px ${COLORS.accentGlow}` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 32px ${COLORS.accentGlow}` }}>
              {student ? 'Browse Events →' : 'Get Started — Free'}
            </button>
            <button onClick={() => navigate('/events')} style={{ background: 'transparent', color: COLORS.text, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: '15px 38px', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'border-color 0.2s,color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accentLight }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.borderLight; e.currentTarget.style.color = COLORS.text }}>
              View All Events
            </button>
          </div>

          <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {[['12k+', 'Students'], ['340+', 'Events'], ['48', 'Clubs'], ['98%', 'Satisfaction']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: COLORS.text }}>{v}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE EVENTS ── */}
      <section style={{ padding: '80px 32px', background: COLORS.bgCard, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentLight, letterSpacing: 1, marginBottom: 8 }}>LIVE FROM BACKEND</div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>Upcoming Events</h2>
              <p style={{ color: COLORS.textMuted, fontSize: 14 }}>
                {events.length > 0 ? `${events.length} upcoming event${events.length !== 1 ? 's' : ''}` : 'Events appear here once published'}
              </p>
            </div>
            <button onClick={() => navigate('/events')} style={{ background: 'transparent', color: COLORS.accentLight, border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              See All Events →
            </button>
          </div>

          {loadingEvts ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 16, height: 260, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: COLORS.textMuted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>No events yet</div>
              <div style={{ fontSize: 13 }}>Once an admin publishes an event it shows up here automatically.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
              {events.slice(0, 6).map(ev => <PreviewCard key={ev._id} ev={ev} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ padding: '100px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentLight, letterSpacing: 1, marginBottom: 14 }}>ABOUT AASTU EVENTS HUB</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, color: COLORS.text, lineHeight: 1.2, marginBottom: 20 }}>
              The official campus event ecosystem
            </h2>
            <p style={{ color: COLORS.textMuted, fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
              Built by students, for students. AASTU Events Hub connects every part of campus life — from the admin who approves events to the student who shows up on the day.
            </p>
            <p style={{ color: COLORS.textMuted, fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
              Organizers submit events through the admin panel. Admins review and approve. Students discover, register, and get automatic reminders. Everything is live and in sync.
            </p>
            <button onClick={handleGetStarted} style={{ background: `linear-gradient(135deg,${COLORS.accent},#a259ff)`, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              {student ? 'Browse Events' : 'Join the Platform'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: '🎯', title: 'Discover', desc: 'Browse all approved campus events in one place' },
              { icon: '⚡', title: 'Register Fast', desc: 'One click registration with instant confirmation' },
              { icon: '🔔', title: 'Get Reminded', desc: 'Automatic notifications 2 days before your events' },
              { icon: '📊', title: 'Track History', desc: 'See all your past and upcoming events in your dashboard' },
            ].map((f, i) => (
              <div key={i} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: '22px 18px', transition: 'border-color 0.2s,transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = 'none' }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 32px', background: COLORS.bgCard, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentLight, letterSpacing: 1, marginBottom: 14 }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: COLORS.text, marginBottom: 48 }}>Three steps to your next event</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {[
              { step: '01', icon: '🔍', title: 'Discover', desc: 'Browse all upcoming events approved by AASTU admins — workshops, hackathons, sports, cultural shows and more.' },
              { step: '02', icon: '✍️', title: 'Register', desc: 'Create a free account and register for any event in seconds. Your spot is confirmed instantly.' },
              { step: '03', icon: '🎉', title: 'Attend', desc: 'Get automatic reminders as the date approaches. Show up, check in, and enjoy the experience.' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {i < 2 && <div style={{ position: 'absolute', top: 28, left: 'calc(50% + 40px)', width: 'calc(100% - 80px)', height: 1, background: `linear-gradient(to right,${COLORS.accent},transparent)`, zIndex: 0 }} />}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${COLORS.accent},#a259ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 16px', boxShadow: `0 4px 20px ${COLORS.accentGlow}` }}>{s.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.accent, letterSpacing: 2, marginBottom: 8 }}>STEP {s.step}</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center,${COLORS.accentGlow} 0%,transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, color: COLORS.text, marginBottom: 16, lineHeight: 1.15 }}>
            Ready to be part of it?
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
            Join thousands of AASTU students already using the platform. It takes 30 seconds to sign up.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleGetStarted} style={{ background: `linear-gradient(135deg,${COLORS.accent},#a259ff)`, color: '#fff', border: 'none', borderRadius: 14, padding: '16px 44px', fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 40px ${COLORS.accentGlow}` }}>
              {student ? 'Browse Events →' : 'Create Free Account →'}
            </button>
            <button onClick={() => navigate('/events')} style={{ background: 'transparent', color: COLORS.text, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              View Events
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
