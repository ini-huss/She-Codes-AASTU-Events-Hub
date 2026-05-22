import { useState } from "react"
import { COLORS } from "./constants"

const NOTIF_ICONS = { welcome: "🎉", registered: "✅", reminder: "⏰", cancelled: "❌", info: "ℹ️" }

export default function Navbar({ page, student, notifs = [], unreadCount = 0, onMarkRead, onGoTo, onLogin, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  const NAV = [
    { id: "home",      label: "Home" },
    { id: "events",    label: "Events" },
    { id: "dashboard", label: "Dashboard" },
  ]

  function toggleNotif() {
    setNotifOpen(v => !v)
    if (!notifOpen && unreadCount > 0) onMarkRead?.()
  }

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 200,
      background: COLORS.bgNav, backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${COLORS.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: 60,
    }}>
      {/* Logo */}
      <button onClick={() => onGoTo("home")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text, letterSpacing: "-0.3px" }}>AASTU Events Hub</span>
      </button>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 4 }}>
        {NAV.map(n => {
          const active = page === n.id
          return (
            <button key={n.id} onClick={() => onGoTo(n.id)} style={{
              background: active ? `${COLORS.accent}18` : "none",
              border: "none", cursor: "pointer",
              color: active ? COLORS.accentLight : COLORS.textMuted,
              fontSize: 14, fontWeight: active ? 700 : 400,
              padding: "7px 14px", borderRadius: 9,
              borderBottom: active ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = COLORS.text }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = COLORS.textMuted }}
            >{n.label}</button>
          )
        })}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Notification bell */}
        {student && (
          <div style={{ position: "relative" }}>
            <button onClick={toggleNotif} style={{
              background: notifOpen ? `${COLORS.accent}18` : "none",
              border: `1px solid ${notifOpen ? COLORS.accent : COLORS.border}`,
              borderRadius: 10, width: 38, height: 38, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: COLORS.textMuted, position: "relative", transition: "all 0.2s",
            }}>
              🔔
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: COLORS.red, color: "#fff", fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: 320, background: COLORS.bgCard, border: `1px solid ${COLORS.borderLight}`,
                borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                zIndex: 300, overflow: "hidden",
              }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>Notifications</span>
                  <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: "32px 16px", textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>No notifications yet</div>
                  ) : notifs.slice(0, 10).map(n => (
                    <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 10, opacity: n.read ? 0.6 : 1 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || "ℹ️"}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.4 }}>{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "10px 16px", borderTop: `1px solid ${COLORS.border}` }}>
                  <button onClick={() => { setNotifOpen(false); onGoTo("dashboard") }} style={{ background: "none", border: "none", color: COLORS.accentLight, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                    View all in Dashboard →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auth */}
        {student ? (
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen(v => !v)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
              borderRadius: 10, padding: "6px 12px 6px 6px", cursor: "pointer",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
                {student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{student.name.split(" ")[0]}</span>
              <span style={{ fontSize: 10, color: COLORS.textMuted }}>▾</span>
            </button>

            {menuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: COLORS.bgCard, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, minWidth: 160, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 300, overflow: "hidden" }}>
                <button onClick={() => { setMenuOpen(false); onGoTo("dashboard") }} style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", color: COLORS.text, fontSize: 14, cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >📊 Dashboard</button>
                <div style={{ height: 1, background: COLORS.border }} />
                <button onClick={() => { setMenuOpen(false); onLogout() }} style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", color: COLORS.red, fontSize: 14, cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >🚪 Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onLogin} style={{
            background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`,
            color: "#fff", border: "none", borderRadius: 10,
            padding: "9px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: `0 4px 16px ${COLORS.accentGlow}`,
          }}>
            Get Started
          </button>
        )}
      </div>
    </nav>
  )
}
