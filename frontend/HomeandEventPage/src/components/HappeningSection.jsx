import { useState } from "react";
import { CALENDAR_EVENTS, COLORS } from "./constants";
import { CalendarIcon, ChevronLeft, ChevronRight, WifiIcon } from "./Icons";

export default function HappeningSection() {
  const [slide, setSlide] = useState(0);

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, padding: "28px 32px 0" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <WifiIcon />
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text }}>
              Happening Now
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[ChevronLeft, ChevronRight].map((IconComponent, index) => (
              <button key={index} onClick={() => setSlide(s => s + (index === 0 ? -1 : 1))} style={{
                width: 30, height: 30, borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgCard, color: COLORS.textMuted, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IconComponent />
              </button>
            ))}
          </div>
        </div>

        <div style={{
          borderRadius: 16, overflow: "hidden", position: "relative", minHeight: 260,
          background: `linear-gradient(135deg, #1a0a3d 0%, #0d1b3e 50%, #0a1628 100%)`,
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(124,92,252,0.25) 0%, rgba(59,130,246,0.15) 60%, transparent 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.08, backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

          <div style={{ position: "relative", padding: "24px 28px", height: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
              <span style={{ background: COLORS.live, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 6, letterSpacing: 0.5 }}>
                LIVE
              </span>
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                Main Hall • 242 attending
              </span>
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.3, maxWidth: 420 }}>
              2024 Tech Innovation Summit: Shaping the Future
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, maxWidth: 400, margin: "0 0 24px" }}>
              Join the biggest tech gathering of the semester. Industry leaders from across Addis Ababa are sharing insights on AI, FinTech, and Renewable Energy.
            </p>
            <button style={{
              background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10,
              padding: "11px 24px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              fontSize: 14, cursor: "pointer", boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
              transition: "transform 0.15s, box-shadow 0.15s",
            }} onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = `0 8px 28px ${COLORS.accentGlow}`; }} onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 4px 20px ${COLORS.accentGlow}`; }}>
              Join Live Session
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text, margin: "0 0 14px" }}>
          Upcoming Calendar
        </h2>
        <div style={{ background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: COLORS.text }}>
              October 2024
            </span>
            <CalendarIcon />
          </div>
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {CALENDAR_EVENTS.map((ev, index) => (
              <div key={index} style={{
                display: "flex", gap: 14, alignItems: "center", padding: "12px 14px", borderRadius: 12,
                background: COLORS.calBg, border: `1px solid ${COLORS.border}`,
                transition: "border-color 0.2s", cursor: "pointer",
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}>
                <div style={{
                  background: COLORS.accent, borderRadius: 10, width: 44, height: 44,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: 1 }}>{ev.date}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.75)", letterSpacing: 0.5 }}>{ev.day}</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.text }}>{ev.title}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>
                    {ev.time} • {ev.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <button style={{
              width: "100%", background: "none", border: `1px solid ${COLORS.border}`,
              color: COLORS.textMuted, borderRadius: 10, padding: "10px",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }} onMouseEnter={e => { e.target.style.borderColor = COLORS.accent; e.target.style.color = COLORS.accentLight; }} onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.textMuted; }}>
              View Full Schedule
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
