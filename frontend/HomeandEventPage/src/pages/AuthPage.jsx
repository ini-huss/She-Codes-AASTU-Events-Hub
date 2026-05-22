import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../components/constants'
import api from '../api'
import { saveSession, getSession } from '../App'

export default function AuthPage() {
  const navigate    = useNavigate()
  const [mode, setMode]         = useState('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr]           = useState('')
  const [loading, setLoading]   = useState(false)

  // If already logged in as student, go to /home
  useEffect(() => {
    const session = getSession()
    if (!session) return
    const r = (session.user?.role || '').toLowerCase()
    if (r !== 'admin') {
      navigate('/home', { replace: true })
    }
    // admins: do nothing — they have their own panel at 5173
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function switchMode(m) {
    setMode(m); setErr('')
    setName(''); setEmail(''); setPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const { data } = await api.post('/auth/register', { name, email, password, role: 'user' })
        saveSession(data.token, data.user)
        navigate('/home', { replace: true })
      } else {
        const { data } = await api.post('/auth/login', { email, password })
        saveSession(data.token, data.user)
        const r = (data.user?.role || '').toLowerCase()
        if (r === 'admin') {
          window.location.href = 'http://localhost:5173'
        } else {
          navigate('/home', { replace: true })
        }
      }
    } catch (error) {
      setErr(mode === 'login' ? 'Invalid email or password.' : (error.response?.data?.message || 'Registration failed.'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: COLORS.bg, border: `1px solid ${COLORS.border}`,
    borderRadius: 10, padding: '11px 14px', color: COLORS.text, fontSize: 14, outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh', background: COLORS.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle,${COLORS.accentGlow} 0%,transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        background: COLORS.bgCard, border: `1px solid ${COLORS.borderLight}`,
        borderRadius: 24, width: '100%', maxWidth: 460,
        padding: '36px 32px', position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'fadeIn .3s ease both',
      }}>
        {/* Back */}
        <button onClick={() => navigate('/')} style={{ position: 'absolute', top: 16, left: 20, background: 'none', border: 'none', color: COLORS.textMuted, fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, marginTop: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text }}>AASTU Events Hub</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Student Platform</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: COLORS.bg, borderRadius: 12, padding: 4, marginBottom: 24, border: `1px solid ${COLORS.border}` }}>
          {[['login', 'Sign In'], ['register', 'Create Account']].map(([m, label]) => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: mode === m ? COLORS.accent : 'transparent',
              color: mode === m ? '#fff' : COLORS.textMuted,
              fontSize: 14, fontWeight: mode === m ? 700 : 400, transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
          {mode === 'register' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>
          {mode === 'register' ? 'Join AASTU Events Hub to discover and register for events.' : 'Sign in to access your student dashboard.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: 'block', marginBottom: 6 }}>Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Selam Tesfaye" required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = COLORS.accent}
                onBlur={e => e.target.style.borderColor = COLORS.border}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: 'block', marginBottom: 6 }}>Email Address *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@aastu.edu.et" required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = COLORS.accent}
              onBlur={e => e.target.style.borderColor = COLORS.border}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: 'block', marginBottom: 6 }}>Password *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = COLORS.accent}
              onBlur={e => e.target.style.borderColor = COLORS.border}
            />
          </div>

          {err && (
            <div style={{ background: '#7f1d1d', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              {err}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? COLORS.border : `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`,
            color: '#fff', border: 'none', borderRadius: 12, padding: '13px',
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : `0 4px 20px ${COLORS.accentGlow}`,
            marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}>
            {loading && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
            {loading ? 'Please wait...' : mode === 'register' ? 'Create My Account →' : 'Sign In →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: COLORS.textMuted }}>
          {mode === 'register'
            ? <>Already have an account? <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: COLORS.accentLight, cursor: 'pointer', fontWeight: 600 }}>Sign in</button></>
            : <>New here? <button onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: COLORS.accentLight, cursor: 'pointer', fontWeight: 600 }}>Create account</button></>
          }
        </div>

        {/* Link to admin panel */}
        <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>Are you an admin? </span>
          <button onClick={() => window.open('http://localhost:5173', '_blank')} style={{ background: 'none', border: 'none', color: COLORS.accentLight, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
            Go to Admin Panel →
          </button>
        </div>
      </div>
    </div>
  )
}
