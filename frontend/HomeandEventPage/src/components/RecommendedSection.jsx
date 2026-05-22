import { useNavigate } from "react-router-dom";
import { COLORS } from "./constants";
import EventCard from "./EventCard";

export default function RecommendedSection({ events = [] }) {
  const navigate = useNavigate();

  // Show up to 3 events
  const display = events.slice(0, 3);

  return (
    <section style={{ padding: "32px 32px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.text, margin: 0 }}>
            Recommended for You
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.textMuted, margin: "4px 0 0" }}>
            {display.length > 0
              ? "Based on your tech and arts interests"
              : "Events will appear here once published."}
          </p>
        </div>
        <button
          onClick={() => navigate('/events')}
          style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.accentLight,
            background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8,
            padding: "7px 16px", cursor: "pointer", transition: "border-color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
        >
          View All Events →
        </button>
      </div>

      {display.length === 0 ? (
        <div style={{
          marginTop: 20, padding: "48px 24px", textAlign: "center",
          background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`,
          color: COLORS.textMuted, fontSize: 14,
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
          No events yet. Check back soon!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20 }}>
          {display.map(event => (
            <EventCard key={event._id || event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
