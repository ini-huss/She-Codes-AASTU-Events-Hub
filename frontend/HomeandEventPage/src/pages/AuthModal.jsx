import { useState } from "react"
import { COLORS } from "../components/constants"

const ROLES = ["Student", "Faculty", "Staff", "Alumni", "Other"]

const DEPARTMENTS = [
  "Computer Science & Engineering", "Software Engineering",
  "Electrical & Computer Engineering", "Civil & Environmental Engineering",
  "Mechanical Engineering", "Chemical Engineering",
  "Industrial Engineering", "Architecture & Urban Planning",
  "Applied Mathematics", "Applied Physics", "Applied Chemistry",
  "Biotechnology", "Student Union", "GDSC AASTU", "IEEE Student Branch",
  "Office of the Registrar", "Dean of Students Office",
  "IT & Systems Department", "Finance & Administration", "Other",
]

export default function AuthModal({ mode, onClose, onLogin, onSignup, onSwitch }) {
  const [step, setStep]       = useState(mode === 'signup' ? 'role' : 'form')
  const [role, setRole]       = useState("")
  const [name, setName]       = useState("")
  const [email, setEmail]     = useState("")
  const [dept, setDept]       = useState("")
  const [studentId, setStudentId] = useState("")
  const [err, setErr]         = useState("")

  function handleRoleSelect(r) {
    setRole(r)
    setStep('form')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setErr("")
    if (!name.trim() || !email.trim()) { setErr("Please fill in all required fields."); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Please enter a valid email address."); return }

    if (mode === 'signup') {
      onSignup({ name: name.trim(), email: email.trim().toLowerCase(), role: role || "Student", department: dept, studentId: studentId.trim() })
    } else {
      // Login: look up existing student session by email
      const existing = (() => {
        try {
          const s = JSON.parse(localStorage.getItem('aastu_student_session') || 'null')
          return s && s.email === email.trim().toLowerCase() ? s : null
        } catch { return null }
      })()
      if (existing) {
        onLogin(existing)
      } else {
        // Create a new session for this email (first-time login)
        onLogin({ id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(), role: role || "Student", department: dept })
      }
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: COLORS.bgCard, border: `1px solid ${COLORS.borderLight}`,
        borderRadius: 24, width: "100%", maxWidth: 460,
        padding: "36px 32px", position: "relative",
        boxShadow: `0 24px 80px rgba(0,0,0,0.6)`,
        animation: "fadeIn .3s ease both",
      }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: COLORS.textMuted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text }}>AASTU Events Hub</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Student Platform</div>
          </div>
        </div>

        {/* Role selection step (signup only) */}
        {mode === 'signup' && step === 'role' && (
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Join as...</h2>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>Choose your role to get the right experience.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => handleRoleSelect(r)} style={{
                  background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                  borderRadius: 12, padding: "14px 18px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "border-color 0.2s, background 0.2s",
                  color: COLORS.text, fontSize: 15, fontWeight: 600,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.background = `${COLORS.accent}12` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.bg }}
                >
                  <span>{r === "Student" ? "🎓" : r === "Faculty" ? "👨‍🏫" : r === "Staff" ? "🏢" : r === "Alumni" ? "🏅" : "👤"} {r}</span>
                  <span style={{ color: COLORS.textMuted, fontSize: 18 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form step */}
        {step === 'form' && (
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
              {mode === 'signup' ? `Create Account` : "Welcome Back"}
            </h2>
            {mode === 'signup' && role && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${COLORS.accent}18`, border: `1px solid ${COLORS.accent}44`, borderRadius: 50, padding: "3px 12px", marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: COLORS.accentLight, fontWeight: 600 }}>Joining as {role}</span>
                <button onClick={() => setStep('role')} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 11, cursor: "pointer" }}>change</button>
              </div>
            )}
            {mode === 'login' && <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>Sign in to your account to access your dashboard.</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Selam Tesfaye"
                  style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = COLORS.accent}
                  onBlur={e => e.target.style.borderColor = COLORS.border}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Email Address *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@aastu.edu.et" type="email"
                  style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = COLORS.accent}
                  onBlur={e => e.target.style.borderColor = COLORS.border}
                />
              </div>
              {mode === 'signup' && (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Department</label>
                    <select value={dept} onChange={e => setDept(e.target.value)}
                      style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: dept ? COLORS.text : COLORS.textMuted, fontSize: 14, outline: "none" }}>
                      <option value="">— Select your department —</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {role === "Student" && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Student ID (optional)</label>
                      <input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="e.g. ETS0123/14"
                        style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none" }}
                        onFocus={e => e.target.style.borderColor = COLORS.accent}
                        onBlur={e => e.target.style.borderColor = COLORS.border}
                      />
                    </div>
                  )}
                </>
              )}

              {err && <div style={{ background: "#7f1d1d", color: "#fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>{err}</div>}

              <button type="submit" style={{
                background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`,
                color: "#fff", border: "none", borderRadius: 12,
                padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: `0 4px 20px ${COLORS.accentGlow}`, marginTop: 4,
              }}>
                {mode === 'signup' ? "Create My Account →" : "Sign In →"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: COLORS.textMuted }}>
              {mode === 'signup'
                ? <>Already have an account? <button onClick={() => onSwitch('login')} style={{ background: "none", border: "none", color: COLORS.accentLight, cursor: "pointer", fontWeight: 600 }}>Sign in</button></>
                : <>New here? <button onClick={() => onSwitch('signup')} style={{ background: "none", border: "none", color: COLORS.accentLight, cursor: "pointer", fontWeight: 600 }}>Create account</button></>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
