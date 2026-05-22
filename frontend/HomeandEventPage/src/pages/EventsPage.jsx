import { useState, useMemo, useEffect } from "react"
import { COLORS } from "../components/constants"
import { isRegistered } from "../bridge"

const SORT_OPTIONS = ["Newest First", "Oldest First", "Price: Low to High", "A-Z"]

const CAT_COLORS = {
  Workshop: "#3b82f6", Seminar: "#ffd166", Competition: "#1de9b6",
  Hackathon: "#1de9b6", "Tech Talk": "#3b82f6", "Cultural Show": "#ff6b9d",
  "Music Event": "#ff9a3c", "Art Exhibition": "#ff6b9d", "Drama & Theater": "#a855f7",
  Sports: "#4cc9f0", "Community Drive": "#22c55e", Networking: "#7c83fd",
  Fundraiser: "#f59e0b", Other: "#6b7280",
}

function catColor(c) { return CAT_COLORS[c] || "#7c83fd" }

// ── Registration Modal ────────────────────────────────────────────────────────
function EventModal({ event, student, myRegs, onRegister, onCancel, onLogin, onClose }) {
  const [done, setDone]   = useState(false)
  const [err, setErr]     = useState("")
  const [loading, setLoading] = useState(false)

  const registered = student ? isRegistered(event.id, student.id) : false
  const isFree     = !event.price || event.price === 0
  const isFull     = event.capacity && (event.registrations || 0) >= event.capacity

  async function handleRegister() {
    if (!student) { onLogin(); return }
    setLoading(true); setErr("")
    const result = onRegister(event)
    setLoading(false)
    if (result?.ok) setDone(true)
    else if (result?.reason === 'already_registered') setErr("You're already registered for this event.")
    else setErr("Something went wrong. Please try again.")
  }

  function handleCancel() {
    onCancel(event.id)
    onClose()
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.borderLight}`, borderRadius: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", animation: "fadeIn .3s ease both" }} onClick={e => e.stopPropagation()}>

        {/* Image */}
        {event.image
          ? <img src={event.image} alt={event.name} style={{ width: "100%", height: 220, objectFit: "cover", display: "block", borderRadius: "24px 24px 0 0" }} />
          : <div style={{ width: "100%", height: 160, background: `linear-gradient(135deg, ${catColor(event.category)}33, ${COLORS.accent}22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, borderRadius: "24px 24px 0 0" }}>🎪</div>
        }

        <div style={{ padding: "24px 28px 28px" }}>
          {/* Category + close */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ background: catColor(event.category), color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{event.category}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 20, cursor: "pointer" }}>✕</button>
          </div>

          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>{event.name}</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>📅 <strong style={{ color: COLORS.text }}>{event.date}</strong></div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>📍 <strong style={{ color: COLORS.text }}>{event.venue}</strong></div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>🏢 <strong style={{ color: COLORS.text }}>{event.organizer}</strong></div>
            {event.capacity && (
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                👥 <strong style={{ color: isFull ? COLORS.red : COLORS.text }}>{event.registrations || 0} / {event.capacity}</strong> registered
                {isFull && <span style={{ color: COLORS.red, fontWeight: 700 }}> — FULL</span>}
              </div>
            )}
            {!event.capacity && event.registrations > 0 && (
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>👥 <strong style={{ color: COLORS.text }}>{event.registrations}</strong> registered</div>
            )}
          </div>

          {event.description && (
            <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 20, padding: "14px 16px", background: COLORS.bg, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              {event.description}
            </p>
          )}

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: isFree ? COLORS.free : COLORS.paid }}>
              {isFree ? "Free Entry" : `ETB ${event.price}`}
            </span>
          </div>

          {/* Action */}
          {done || registered ? (
            <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
              <div style={{ color: "#86efac", fontWeight: 700, fontSize: 15 }}>You're registered!</div>
              <div style={{ color: "#4ade80", fontSize: 13, marginTop: 4 }}>See you at {event.name}</div>
              <button onClick={handleCancel} style={{ marginTop: 14, background: "none", border: "1px solid #166534", color: "#86efac", borderRadius: 8, padding: "8px 18px", fontSize: 12, cursor: "pointer" }}>
                Cancel Registration
              </button>
            </div>
          ) : isFull ? (
            <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: "14px", textAlign: "center", color: "#fca5a5", fontSize: 14 }}>
              ⚠️ This event is at full capacity
            </div>
          ) : (
            <>
              {err && <div style={{ background: "#7f1d1d", color: "#fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{err}</div>}
              {!student && (
                <div style={{ background: `${COLORS.accent}12`, border: `1px solid ${COLORS.accent}33`, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: COLORS.textMuted, marginBottom: 14 }}>
                  💡 <button onClick={onLogin} style={{ background: "none", border: "none", color: COLORS.accentLight, cursor: "pointer", fontWeight: 600 }}>Sign in or create an account</button> to register for this event.
                </div>
              )}
              <button onClick={handleRegister} disabled={loading} style={{
                width: "100%", background: `linear-gradient(135deg, ${COLORS.accent}, #a259ff)`,
                color: "#fff", border: "none", borderRadius: 12, padding: "14px",
                fontSize: 15, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
              }}>
                {loading ? "Registering..." : student ? "Register Now →" : "Sign In to Register →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event, student, onOpen }) {
  const isFree     = !event.price || event.price === 0
  const isFull     = event.capacity && (event.registrations || 0) >= event.capacity
  const registered = student ? isRegistered(event.id, student.id) : false
  const cc         = catColor(event.category)

  return (
    <article style={{
      background: COLORS.bgCard, borderRadius: 18, overflow: "hidden",
      border: `1px solid ${registered ? COLORS.accent + "66" : COLORS.border}`,
      cursor: "pointer", transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
    }}
      onClick={() => onOpen(event)}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4)` }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none" }}
    >
      <div style={{ position: "relative", height: 180 }}>
        {event.image
          ? <img src={event.image} alt={event.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${cc}22, ${COLORS.accent}11)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎪</div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,13,20,0.7) 0%, transparent 50%)" }} />
        <span style={{ position: "absolute", top: 12, left: 12, background: cc, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{event.category}</span>
        {registered && <span style={{ position: "absolute", top: 12, right: 12, background: COLORS.green, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>✓ REGISTERED</span>}
        {isFull && !registered && <span style={{ position: "absolute", top: 12, right: 12, background: COLORS.red, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>FULL</span>}
      </div>

      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 10, lineHeight: 1.3 }}>{event.name}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>📅 {event.date}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>📍 {event.venue}</div>
          {event.registrations > 0 && (
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>
              👥 {event.registrations}{event.capacity ? ` / ${event.capacity}` : ""} registered
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: isFree ? COLORS.free : COLORS.paid }}>
            {isFree ? "Free" : `ETB ${event.price}`}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: registered ? COLORS.green : isFull ? COLORS.red : COLORS.accentLight }}>
            {registered ? "Registered ✓" : isFull ? "Full" : "Register →"}
          </span>
        </div>
      </div>
    </article>
  )
}

// ── Events Page ───────────────────────────────────────────────────────────────
export default function EventsPage({ liveEvents, student, myRegs, selectedEvent, onRegister, onCancel, onLogin }) {
  const [search, setSearch]         = useState("")
  const [catFilter, setCatFilter]   = useState("All")
  const [sort, setSort]             = useState("Newest First")
  const [modal, setModal]           = useState(null)

  const categories = useMemo(() => ["All", ...new Set(liveEvents.map(e => e.category))], [liveEvents])

  useEffect(() => { if (selectedEvent) setModal(selectedEvent) }, [selectedEvent])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return liveEvents.filter(e => {
      const mQ = !q || [e.name, e.category, e.venue, e.organizer].some(v => v?.toLowerCase().includes(q))
      const mC = catFilter === "All" || e.category === catFilter
      return mQ && mC
    })
  }, [liveEvents, search, catFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === "A-Z")                return arr.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === "Oldest First")       return arr.sort((a, b) => a.id - b.id)
    if (sort === "Price: Low to High") return arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    return arr.sort((a, b) => b.id - a.id)
  }, [filtered, sort])

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>All Events</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 15 }}>
          {liveEvents.length > 0 ? `${liveEvents.length} approved event${liveEvents.length !== 1 ? "s" : ""} — register for free` : "No events yet. Check back soon!"}
        </p>
      </div>

      {/* Search + sort */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 10, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 16px" }}>
          <span style={{ color: COLORS.textMuted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, venues, organizers..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: COLORS.text, fontSize: 14 }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16 }}>✕</button>}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 16px", color: COLORS.text, fontSize: 14, outline: "none", cursor: "pointer" }}>
          {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            background: catFilter === c ? COLORS.accent : COLORS.bgCard,
            color: catFilter === c ? "#fff" : COLORS.textMuted,
            border: `1px solid ${catFilter === c ? COLORS.accent : COLORS.border}`,
            borderRadius: 50, padding: "7px 16px", fontSize: 13, fontWeight: catFilter === c ? 700 : 400,
            cursor: "pointer", transition: "all 0.2s",
          }}>{c}</button>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>
        Showing <strong style={{ color: COLORS.text }}>{sorted.length}</strong> event{sorted.length !== 1 ? "s" : ""}
        {student && myRegs.length > 0 && <span style={{ marginLeft: 12, color: COLORS.accentLight }}>· {myRegs.length} registered by you</span>}
      </div>

      {/* Grid */}
      {liveEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: COLORS.textMuted }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>No events yet</div>
          <div style={{ fontSize: 14 }}>Events approved by the Admin will appear here automatically.</div>
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: COLORS.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div>No events match your search. Try clearing filters.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 }}>
          {sorted.map(e => <EventCard key={e.id} event={e} student={student} onOpen={setModal} />)}
        </div>
      )}

      {modal && (
        <EventModal
          event={modal}
          student={student}
          myRegs={myRegs}
          onRegister={onRegister}
          onCancel={onCancel}
          onLogin={() => { setModal(null); onLogin() }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
