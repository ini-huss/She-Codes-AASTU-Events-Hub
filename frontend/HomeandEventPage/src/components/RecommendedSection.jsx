import { COLORS } from "./constants";
import EventCard from "./EventCard";
import { PlusIcon } from "./Icons";

export default function RecommendedSection({ liveEvents = [], onEventClick }) {
  // Show up to 6 most recent approved events
  const display = [...liveEvents].sort((a, b) => b.id - a.id).slice(0, 6)

  return (
    <section style={{ padding: "32px 32px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.text, margin: 0 }}>
            Upcoming Events
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.textMuted, margin: "4px 0 0" }}>
            {display.length > 0
              ? `${display.length} approved event${display.length !== 1 ? "s" : ""} from organizers`
              : "Events approved by admins will appear here."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => onEventClick?.()}
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.accentLight,
              background: "none", border: "none", cursor: "pointer", textDecoration: "underline",
            }}>
            View All Events
          </button>
        </div>
      </div>

      {display.length === 0 ? (
        <div style={{
          marginTop: 20, padding: "48px 24px", textAlign: "center",
          background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}`,
          color: COLORS.textMuted, fontSize: 14,
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
          No approved events yet. Check back soon!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20 }}>
          {display.map(event => <EventCard key={event.id} event={event} onOpen={onEventClick} />)}
        </div>
      )}
    </section>
  );
}
