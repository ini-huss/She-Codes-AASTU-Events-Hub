import { NAV_LINKS, COLORS } from "./constants";
import { BellIcon, SearchIcon } from "./Icons";

export default function Navbar({ activePage, onViewHome, onViewEvents }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: COLORS.bgNav, backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${COLORS.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: 56,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.text, letterSpacing: "-0.3px" }}>
          AASTU Events Hub
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          {NAV_LINKS.map(link => {
            const isActive = (link === "Home" && activePage === "home") || (link === "Events" && activePage === "event");
            return (
              <a
                key={link}
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (link === "Home") onViewHome?.();
                  if (link === "Events") onViewEvents?.();
                }}
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: isActive ? 600 : 400,
                  color: isActive ? COLORS.text : COLORS.textMuted,
                  textDecoration: "none", padding: "6px 12px", borderRadius: 8,
                  borderBottom: isActive ? `2px solid ${COLORS.accent}` : "2px solid transparent",
                  transition: "color 0.2s",
                }}
              >
                {link}
              </a>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#1a2236", border: `1px solid ${COLORS.border}`,
          borderRadius: 10, padding: "7px 14px",
        }}>
          <SearchIcon />
          <input placeholder="Search events..." style={{
            background: "none", border: "none", outline: "none",
            color: COLORS.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", width: 140,
          }} />
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 6 }}>
          <BellIcon />
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.accent}, #c084fc)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
        }}>
          A
        </div>
      </div>
    </nav>
  );
}
