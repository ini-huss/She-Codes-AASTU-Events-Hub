import { ClockIcon, PinIcon } from "./Icons";
import { COLORS } from "./constants";

const CATEGORY_COLORS = {
  Workshop:          "#3b82f6",
  Seminar:           "#ffd166",
  Competition:       "#1de9b6",
  Hackathon:         "#1de9b6",
  "Tech Talk":       "#3b82f6",
  "Cultural Show":   "#ff6b9d",
  "Music Event":     "#ff9a3c",
  "Art Exhibition":  "#ff6b9d",
  "Drama & Theater": "#a855f7",
  Sports:            "#4cc9f0",
  "Community Drive": "#22c55e",
  Networking:        "#7c83fd",
  Fundraiser:        "#f59e0b",
  Other:             "#6b7280",
}

function catColor(cat) {
  return CATEGORY_COLORS[cat] || "#7c83fd"
}

export default function EventCard({ event, onOpen }) {
  // Support both live bridge format (name, image, price as number, venue, date)
  // and legacy format (title, img, tag, time, location) for backwards compat
  const title    = event.name    || event.title    || "Untitled Event"
  const imgSrc   = event.image   || event.img      || null
  const category = event.category || event.tag     || "Other"
  const date     = event.date    || event.time     || ""
  const venue    = event.venue   || event.location || ""
  const isFree   = !event.price || event.price === 0 || event.price === "Free Entry" || event.price === "Students Only"
  const priceLabel = isFree ? "Free" : (typeof event.price === "number" ? `ETB ${event.price}` : event.price)
  const isFull   = event.capacity && (event.registrations || 0) >= event.capacity
  const tagBg    = event.tagColor || catColor(category)

  return (
    <article style={{
      background: COLORS.bgCard, borderRadius: 16, overflow: "hidden",
      border: `1px solid ${COLORS.border}`, cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
    }} onClick={() => onOpen?.(event)}>

      {/* Image / placeholder */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        {imgSrc
          ? <img src={imgSrc} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", background: "#1a2236", display: "flex", alignItems: "center", justifyContent: "center", color: "#8899bb", fontSize: 13 }}>
              {category}
            </div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,17,23,0.6) 0%, transparent 60%)" }} />

        {/* Category badge */}
        <span style={{
          position: "absolute", top: 12, left: 12,
          background: tagBg, color: "#fff",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11,
          padding: "4px 10px", borderRadius: 6, letterSpacing: 0.3,
        }}>
          {category}
        </span>

        {/* Full badge */}
        {isFull && (
          <span style={{
            position: "absolute", top: 12, right: 44,
            background: "#ef4444", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 10,
            padding: "3px 8px", borderRadius: 6,
          }}>FULL</span>
        )}

        {/* Calendar button */}
        <button style={{
          position: "absolute", top: 10, right: 10, background: "rgba(13,17,23,0.7)",
          border: `1px solid ${COLORS.border}`, borderRadius: 8, width: 30, height: 30,
          color: COLORS.textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }} onClick={e => { e.stopPropagation(); alert(`Added "${title}" to your calendar!`) }}>
          📆
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.text, margin: 0, lineHeight: 1.3, flex: 1, paddingRight: 10 }}>
            {title}
          </h3>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12,
            color: isFree ? COLORS.free : COLORS.paid, flexShrink: 0,
            background: isFree ? `${COLORS.free}18` : `${COLORS.paid}18`,
            padding: "3px 9px", borderRadius: 6,
          }}>
            {priceLabel}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
          {date && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <ClockIcon /> {date}
            </div>
          )}
          {venue && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <PinIcon /> {venue}
            </div>
          )}
          {event.registrations > 0 && (
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              👥 {event.registrations}{event.capacity ? ` / ${event.capacity}` : ""} registered
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: isFree ? COLORS.free : COLORS.paid, fontWeight: 600 }}>
            {isFree ? "Free Entry" : "Paid"}
          </span>
          <button style={{
            background: isFull ? "#374151" : "linear-gradient(90deg, #7c83fd, #a259ff)",
            color: isFull ? "#9ca3af" : "#fff", border: "none",
            borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700,
            cursor: isFull ? "not-allowed" : "pointer",
          }} onClick={e => { e.stopPropagation(); if (!isFull) onOpen?.(event) }}>
            {isFull ? "Full" : "Register"}
          </button>
        </div>
      </div>
    </article>
  );
}
