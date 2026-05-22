import { BookmarkIcon, ClockIcon, PinIcon } from "./Icons";
import { COLORS } from "./constants";

export default function EventCard({ event, onOpen }) {
  const isFree = event.price === "Free Entry" || event.price === "Students Only";

  return (
    <article style={{
      background: COLORS.bgCard, borderRadius: 16, overflow: "hidden",
      border: `1px solid ${COLORS.border}`, cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
    }} onClick={() => onOpen?.(event)}>
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img src={event.img} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,17,23,0.6) 0%, transparent 60%)" }} />
        <span style={{
          position: "absolute", top: 12, left: 12,
          background: event.tagColor, color: "#fff",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11,
          padding: "4px 10px", borderRadius: 6, letterSpacing: 0.3,
        }}>
          {event.tag}
        </span>
        <button style={{
          position: "absolute", top: 10, right: 10, background: "rgba(13,17,23,0.7)", border: `1px solid ${COLORS.border}`,
          borderRadius: 8, width: 30, height: 30, color: COLORS.textMuted,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }} onClick={e => { e.stopPropagation(); alert(`Added "${event.title}" to your calendar!`); }}>
          📆
        </button>
      </div>

      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.text, margin: 0, lineHeight: 1.3, flex: 1, paddingRight: 10 }}>
            {event.title}
          </h3>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12,
            color: event.priceColor, flexShrink: 0,
            background: `${event.priceColor}18`, padding: "3px 9px", borderRadius: 6,
          }}>
            {event.price}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
            <ClockIcon /> {event.time}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
            <PinIcon /> {event.location}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: isFree ? COLORS.free : COLORS.paid, fontWeight: 600 }}>
            {isFree ? "Free" : "Paid"}
          </span>
          <button style={{
            background: "linear-gradient(90deg, #7c83fd, #a259ff)", color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            Register
          </button>
        </div>
      </div>
    </article>
  );
}
