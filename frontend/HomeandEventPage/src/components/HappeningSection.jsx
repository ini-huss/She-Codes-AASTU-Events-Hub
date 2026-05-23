import { useState } from "react";
import { COLORS } from "./constants";
import { CalendarIcon, ChevronLeft, ChevronRight, WifiIcon } from "./Icons";

export default function HappeningSection({ liveEvents = [], onEventClick }) {
  const [slide, setSlide] = useState(0);

  // Featured = cycle through approved events
  const featured = liveEvents.length > 0
    ? liveEvents[((slide % liveEvents.length) + liveEvents.length) % liveEvents.length]
    : null;

  // Upcoming calendar = next 3 events (excluding featured)
  const calendarEvents = liveEvents
    .filter((_, i) => i !== ((slide % liveEvents.length) + liveEvents.length) % liveEvents.length)
    .slice(0, 3);

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, padding: "28px 32px 0" }}>
      {/* Featured event */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <WifiIcon />
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text }}>
              {liveEvents.length > 0 ? "Featured Event" : "Happening Now"}
            </span>
          </div>
          {liveEvents.length > 1 && (
            <div style={{ display: "flex", gap: 6 }}>
              {[ChevronLeft, ChevronRight].map((IconComponent, index) => (
                <button key={index}
                  onClick={() => setSlide(s => s + (index === 0 ? -1 : 1))}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.bgCard, color: COLORS.textMuted, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                  <IconComponent />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{
          borderRadius: 16, overflow: "hidden", position: "relative", minHeight: 260,
          background: featured?.image
            ? `linear-gradient(to bottom, rgba(13,17,35,0.3), rgba(13,17,35,0.85)), url(${featured.image}) center/cover no-repeat`
            : "linear-gradient(135deg, #1a0a3d 0%, #0d1b3e 50%, #0a1628 100%)",
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(124,92,252,0.2) 0%, transparent 100%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", padding: "24px 28px", height: "100%", boxSizing: "border-box" }}>
            {featured ? (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                  <span style={{ background: "#7c5cfc", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 6, letterSpacing: 0.5 }}>
                    {featured.category?.toUpperCase()}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                    {featured.venue}
                    {featured.registrations > 0 && ` • ${featured.registrations} attending`}
                  </span>
                </div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.3, maxWidth: 420 }}>
                  {featured.name}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, maxWidth: 400, margin: "0 0 10px" }}>
                  📅 {featured.date} &nbsp;·&nbsp; 🏢 {featured.organizer}
                </p>
                {featured.description && (
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, maxWidth: 400, margin: "0 0 20px" }}>
                    {featured.description.slice(0, 120)}{featured.description.length > 120 ? "…" : ""}
                  </p>
                )}
                <button
                  onClick={() => onEventClick?.(featured)}
                  style={{
                    background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10,
                    padding: "11px 24px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                    fontSize: 14, cursor: "pointer", boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
                  }}>
                  View & Register
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                No approved events yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming calendar */}
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text, margin: "0 0 14px" }}>
          Upcoming Events
        </h2>
        <div style={{ background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.text }}>
              Schedule
            </span>
            <CalendarIcon />
          </div>
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {calendarEvents.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
                No upcoming events
              </div>
            ) : calendarEvents.map((ev) => {
              // Parse day number from date string if possible
              const dateParts = ev.date?.split(/[-\/\s]/) || []
              const dayNum = dateParts[dateParts.length - 1]?.replace(/\D/g, '') || "—"
              const dayName = ev.date ? new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() : ""

              return (
                <div key={ev.id}
                  onClick={() => onEventClick?.(ev)}
                  style={{
                    display: "flex", gap: 14, alignItems: "center", padding: "12px 14px", borderRadius: 12,
                    background: COLORS.calBg, border: `1px solid ${COLORS.border}`,
                    cursor: "pointer", transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
                >
                  <div style={{
                    background: COLORS.accent, borderRadius: 10, width: 44, height: 44,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: 1 }}>{dayNum}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.75)", letterSpacing: 0.5 }}>{dayName}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.text }}>{ev.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>
                      {ev.date} · {ev.venue}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <button
              onClick={() => onEventClick?.()}
              style={{
                width: "100%", background: "none", border: `1px solid ${COLORS.border}`,
                color: COLORS.textMuted, borderRadius: 10, padding: "10px",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
              }}
              onMouseEnter={e => { e.target.style.borderColor = COLORS.accent; e.target.style.color = COLORS.accentLight }}
              onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.textMuted }}
            >
              View All Events
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
