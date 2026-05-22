import { EVENTS, COLORS } from "./constants";
import EventCard from "./EventCard";
import { PlusIcon } from "./Icons";

export default function RecommendedSection({ onEventClick }) {
  return (
    <section style={{ padding: "32px 32px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.text, margin: 0 }}>
            Recommended for You
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.textMuted, margin: "4px 0 0" }}>
            Based on your interests in Tech and Creative Arts.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.accentLight, textDecoration: "none" }}>
            View All Suggestions
          </a>
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            background: COLORS.accent, color: "#fff", border: "none",
            borderRadius: 50, padding: "10px 20px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
            boxShadow: `0 4px 16px ${COLORS.accentGlow}`,
          }}>
            <PlusIcon /> Post Event
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20 }}>
        {EVENTS.map(event => <EventCard key={event.id} event={event} onOpen={onEventClick} />)}
      </div>
    </section>
  );
}
