import { COLORS } from "./constants";

export default function Footer() {
  return (
    <footer style={{
      marginTop: 64, borderTop: `1px solid ${COLORS.border}`,
      padding: "40px 32px 30px", background: COLORS.bg, marginLeft: 0, marginRight: 0,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 40, paddingBottom: 36, borderBottom: `1px solid ${COLORS.border}` }}>
        <div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text, marginBottom: 8 }}>
            AASTU Events Hub
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, margin: 0 }}>
            Connecting students through innovation, culture, and community events.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.text }}>Quick Links</div>
          {['Home', 'Events', 'Profile'].map(link => (
            <a key={link} href="#" style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted,
              textDecoration: "none", transition: "color 0.2s",
            }} onMouseEnter={e => e.target.style.color = COLORS.accentLight} onMouseLeave={e => e.target.style.color = COLORS.textMuted}>
              {link}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.text }}>Support</div>
          {['Privacy Policy', 'Terms of Service', 'Contact Support'].map(link => (
            <a key={link} href="#" style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted,
              textDecoration: "none", transition: "color 0.2s",
            }} onMouseEnter={e => e.target.style.color = COLORS.accentLight} onMouseLeave={e => e.target.style.color = COLORS.textMuted}>
              {link}
            </a>
          ))}
        </div>
      </div>
      <div style={{
        textAlign: "center", padding: "20px 0 0",
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textDim,
      }}>
        © 2026 Addis Ababa Science and Technology University. All Rights Reserved.
      </div>
    </footer>
  );
}
