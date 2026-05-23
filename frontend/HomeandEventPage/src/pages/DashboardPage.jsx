import { useState } from "react"
import { COLORS } from "../components/constants"
import { isRegistered } from "../bridge"

const NOTIF_COLORS = {
  welcome:    { bg: "#1e1b4b", border: "#4338ca", icon: "🎉", color: "#a5b4fc" },
  registered: { bg: "#052e16", border: "#166534", icon: "✅", color: "#86efac" },
  reminder:   { bg: "#451a03", border: "#92400e", icon: "⏰", color: "#fcd34d" },
  cancelled:  { bg: "#450a0a", border: "#7f1d1d", icon: "❌", color: "#fca5a5" },
  info:       { bg: "#0c1a2e", border: "#1e3a5f", icon: "ℹ️", color: "#93c5fd" },
}

function timeAgo(iso) {
  if (!iso) return ""
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)   return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date(); now.setHours(0,0,0,0)
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
  return diff
}

export default function DashboardPage({ student, liveEvents, myRegs, notifs, onMarkRead, onGoTo, onCancel }) {
  const [tab, setTab] = useState("upcoming")

  const upcoming = myRegs.filter(r => {
    const d = daysUntil(r.eventDate)
    return d === null || d >= 0
  }).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

  const past = myRegs.filter(r => {
    const d = daysUntil(r.eventDate)
    return d !== null && d < 0
  })

  const unread = notifs.filter(n => !n.read).length

  // Enrich registrations with live event data
  function enrichReg(reg) {
    const live = liveEvents.find(e => e.id === reg.eventId)
    return { ...reg, ...(live ? { eventName: live.name, eventDate: live.date, eventVenue: live.venue, eventImage: live.image, eventPrice: live.price } : {}) }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

      {/* Profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40, padding: "28px 32px", background: COLORS.bgCard, borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
            Welcome back, {student.name.split(" ")[0]}! 👋
          </h1>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>
            {student.email}
            {student.department && <span> · {student.department}</span>}
            {student.role && <span> · {student.role}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
          {[
            { label: "Registered", value: myRegs.length, color: COLORS.accent },
            { label: "Upcoming",   value: upcoming.length, color: COLORS.green },
            { label: "Notifications", value: unread, color: COLORS.yellow },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "12px 18px", background: COLORS.bg, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

        {/* Left: registrations */}
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: COLORS.bgCard, borderRadius: 12, padding: 4, border: `1px solid ${COLORS.border}` }}>
            {[
              { id: "upcoming", label: `Upcoming (${upcoming.length})` },
              { id: "past",     label: `Past (${past.length})` },
              { id: "browse",   label: "Browse Events" },
            ].map(t => (
              <button key={t.id} onClick={() => t.id === "browse" ? onGoTo("events") : setTab(t.id)} style={{
                flex: 1, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer",
                background: tab === t.id ? COLORS.accent : "transparent",
                color: tab === t.id ? "#fff" : COLORS.textMuted,
                fontSize: 13, fontWeight: tab === t.id ? 700 : 400, transition: "all 0.2s",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Upcoming */}
          {tab === "upcoming" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {upcoming.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", color: COLORS.textMuted }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>No upcoming events</div>
                  <div style={{ fontSize: 14, marginBottom: 20 }}>Register for events to see them here.</div>
                  <button onClick={() => onGoTo("events")} style={{ background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    Browse Events
                  </button>
                </div>
              ) : upcoming.map(reg => {
                const r = enrichReg(reg)
                const days = daysUntil(r.eventDate)
                const urgency = days === 0 ? "TODAY" : days === 1 ? "TOMORROW" : days !== null && days <= 3 ? `${days} DAYS` : null
                return (
                  <div key={r.id} style={{ background: COLORS.bgCard, border: `1px solid ${urgency ? COLORS.accent + "66" : COLORS.border}`, borderRadius: 16, overflow: "hidden", display: "flex" }}>
                    {r.eventImage
                      ? <img src={r.eventImage} alt={r.eventName} style={{ width: 100, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 100, background: `${COLORS.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🎪</div>
                    }
                    <div style={{ padding: "16px 18px", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.text }}>{r.eventName}</h3>
                        {urgency && (
                          <span style={{ background: urgency === "TODAY" ? COLORS.red : COLORS.yellow, color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                            {urgency}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>📅 {r.eventDate}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>📍 {r.eventVenue}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: !r.eventPrice || r.eventPrice === 0 ? COLORS.free : COLORS.paid }}>
                          {!r.eventPrice || r.eventPrice === 0 ? "Free" : `ETB ${r.eventPrice}`}
                        </span>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>· Registered {timeAgo(r.registeredAt)}</span>
                      </div>
                    </div>
                    <div style={{ padding: "16px 14px", display: "flex", alignItems: "center" }}>
                      <button onClick={() => onCancel(r.eventId)} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted }}
                      >Cancel</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Past */}
          {tab === "past" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {past.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", color: COLORS.textMuted }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏁</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>No past events yet</div>
                </div>
              ) : past.map(reg => {
                const r = enrichReg(reg)
                return (
                  <div key={r.id} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, opacity: 0.7 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${COLORS.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏁</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 14 }}>{r.eventName}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>📅 {r.eventDate} · 📍 {r.eventVenue}</div>
                    </div>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>Attended</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: notifications */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.text }}>
              Notifications {unread > 0 && <span style={{ background: COLORS.accent, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20, marginLeft: 6 }}>{unread}</span>}
            </h2>
            {unread > 0 && (
              <button onClick={onMarkRead} style={{ background: "none", border: "none", color: COLORS.accentLight, fontSize: 12, cursor: "pointer" }}>Mark all read</button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px", color: COLORS.textMuted, background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 13 }}>No notifications yet</div>
              </div>
            ) : notifs.slice(0, 15).map(n => {
              const style = NOTIF_COLORS[n.type] || NOTIF_COLORS.info
              return (
                <div key={n.id} style={{
                  background: style.bg, border: `1px solid ${style.border}`,
                  borderRadius: 12, padding: "14px 16px",
                  opacity: n.read ? 0.65 : 1,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{style.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: style.color, marginBottom: 3 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 6 }}>{timeAgo(n.time)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
