import { COLORS } from "./constants";

export default function CategoryFilter({ active, setActive, categories }) {
  return (
    <section style={{ display: "flex", alignItems: "center", gap: 10, padding: "28px 32px 0", flexWrap: "wrap" }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.textMuted, marginRight: 4 }}>
        Browse by:
      </span>
      {categories.map(cat => (
        <button key={cat} onClick={() => setActive(cat)} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: cat === active ? 600 : 400,
          padding: "8px 18px", borderRadius: 50, cursor: "pointer",
          border: cat === active ? "none" : `1px solid ${COLORS.border}`,
          background: cat === active ? COLORS.accent : "none",
          color: cat === active ? "#fff" : COLORS.textMuted,
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { if (cat !== active) { e.target.style.borderColor = COLORS.accent; e.target.style.color = COLORS.accentLight; } }}
          onMouseLeave={e => { if (cat !== active) { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.textMuted; } }}>
          {cat}
        </button>
      ))}
    </section>
  );
}
