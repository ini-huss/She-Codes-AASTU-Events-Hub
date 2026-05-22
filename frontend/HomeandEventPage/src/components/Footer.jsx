import { useNavigate } from 'react-router-dom'
import { COLORS } from './constants'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer style={{ background: COLORS.bgCard, borderTop: `1px solid ${COLORS.border}`, padding: '48px 32px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, paddingBottom: 40, borderBottom: `1px solid ${COLORS.border}` }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text }}>AASTU Events Hub</span>
            </div>
            <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, maxWidth: 280 }}>
              The official campus event platform for Addis Ababa Science and Technology University. Connecting students, organizers, and administrators.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {['🐦', '📘', '📸', '💼'].map((icon, i) => (
                <button key={i} style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}`, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.text, marginBottom: 16, letterSpacing: 0.5 }}>PLATFORM</div>
            {[
              { label: 'Home',      path: '/home' },
              { label: 'Events',    path: '/events' },
              { label: 'My Events', path: '/my-events' },
              { label: 'Profile',   path: '/dashboard' },
            ].map(l => (
              <button key={l.label} onClick={() => navigate(l.path)} style={{ display: 'block', background: 'none', border: 'none', color: COLORS.textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 10, padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = COLORS.accentLight}
                onMouseLeave={e => e.currentTarget.style.color = COLORS.textMuted}
              >{l.label}</button>
            ))}
          </div>

          {/* University */}
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.text, marginBottom: 16, letterSpacing: 0.5 }}>UNIVERSITY</div>
            {['About AASTU', 'Academic Calendar', 'Student Services', 'Campus Map'].map(l => (
              <button key={l} style={{ display: 'block', background: 'none', border: 'none', color: COLORS.textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 10, padding: 0, textAlign: 'left' }}>{l}</button>
            ))}
          </div>

          {/* Support */}
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.text, marginBottom: 16, letterSpacing: 0.5 }}>SUPPORT</div>
            {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(l => (
              <button key={l} style={{ display: 'block', background: 'none', border: 'none', color: COLORS.textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 10, padding: 0, textAlign: 'left' }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: COLORS.textDim }}>
            © 2026 Addis Ababa Science and Technology University. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green, display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
