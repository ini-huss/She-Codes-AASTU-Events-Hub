import { useNavigate } from "react-router-dom";
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
  tech:              "#3b82f6",
  workshop:          "#ffd166",
  seminar:           "#1de9b6",
  social:            "#ff6b9d",
  sports:            "#4cc9f0",
  arts:              "#a855f7",
  career:            "#22c55e",
  other:             "#6b7280",
};

function catColor(cat) {
  return CATEGORY_COLORS[cat] || "#7c83fd";
}

export default function EventCard({ event }) {
  const navigate = useNavigate();

  // Support both backend format (_id, title, location) and legacy format (id, name, venue)
  const id         = event._id     || event.id;
  const title      = event.title   || event.name      || "Untitled Event";
  const imgSrc     = event.imageUrl || event.image    || event.img || null;
  const category   = event.category || event.tag      || "Other";
  const rawDate    = event.date    || event.time       || "";
  const dateStr    = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const venue      = event.location || event.venue    || "";
  const isFree     = !event.price  || event.price === 0;
  const priceLabel = isFree ? "Free" : `ETB ${event.price}`;
  const regCount   = event.registeredCount || event.registrations || 0;
  const isFull     = event.capacity && regCount >= event.capacity;
  const tagBg      = catColor(category);

  function handleClick() {
    if (id) navigate(`/events/${id}`);
  }

  return (
    <article
      style={{
        background: COLORS.bgCard, borderRadius: 16, overflow: "hidden",
        border: `1px solid ${COLORS.border}`, cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
      }}
      onClick={handleClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)";
        e.currentTarget.style.borderColor = COLORS.accent;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = COLORS.border;
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        {imgSrc
          ? <img src={imgSrc} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${tagBg}22, ${COLORS.accent}11)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎪</div>
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
            position: "absolute", top: 12, right: 12,
            background: "#ef4444", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 10,
            padding: "3px 8px", borderRadius: 6,
          }}>FULL</span>
        )}
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

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {dateStr && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <ClockIcon /> {dateStr}
            </div>
          )}
          {venue && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <PinIcon /> {venue}
            </div>
          )}
          {regCount > 0 && (
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              👥 {regCount}{event.capacity ? ` / ${event.capacity}` : ""} registered
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
