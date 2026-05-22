import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { COLORS } from './constants'

export default function Navbar({ student, onLogout }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const NAV = student
    ? [
        { path: '/home',      label: 'Home' },
        { path: '/events',    label: 'Events' },
        { path: '/my-events', label: 'My Events' },
        { path: '/dashboard', label: 'Profile' },
      ]
    : [
        { path: '/',       label: 'Home' },
        { path: '/events', label: 'Events' },
      ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: COLORS.bgNav, backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${COLORS.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 60,
    }}>
      {/* Logo */}
      <button onClick={() => navigate(student ? '/home' : '/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text, letterSpacing: '-0.3px' }}>AASTU Events Hub</span>
      </button>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {NAV.map(n => {
          const active = location.pathname === n.path
          return (
            <button key={n.path} onClick={() => navigate(n.path)} style={{
              background: active ? `${COLORS.accent}18` : 'none',
              border: 'none', cursor: 'pointer',
              color: active ? COLORS.accentLight : COLORS.textMuted,
              fontSize: 14, fontWeight: active ? 700 : 400,
              padding: '7px 14px', borderRadius: 9,
              borderBottom: active ? `2px solid ${COLORS.accent}` : '2px solid transparent',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = COLORS.text }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = COLORS.textMuted }}
            >{n.label}</button>
          )
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {student ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
              borderRadius: 10, padding: '6px 12px 6px 6px', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                {student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{student.name.split(' ')[0]}</span>
              <span style={{ fontSize: 10, color: COLORS.textMuted }}>▾</span>
            </button>

            {menuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: COLORS.bgCard, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 300, overflow: 'hidden' }}>
                <button onClick={() => { setMenuOpen(false); navigate('/dashboard') }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: COLORS.text, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >📊 Profile</button>
                <div style={{ height: 1, background: COLORS.border }} />
                <button onClick={() => { setMenuOpen(false); onLogout() }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: COLORS.red, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >🚪 Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => navigate('/auth')} style={{
            background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`,
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 16px ${COLORS.accentGlow}`,
          }}>
            Get Started
          </button>
        )}
      </div>
    </nav>
  )
}
