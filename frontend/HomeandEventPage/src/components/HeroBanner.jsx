import { COLORS } from "./constants";

export default function HeroBanner() {
  return (
    <section style={{ padding: "36px 32px 0" }}>
      <h1 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800,
        color: COLORS.text, margin: 0, letterSpacing: "-0.5px",
      }}>
        Welcome to the AASTU Events Hub
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 14, margin: "8px 0 0", lineHeight: 1.6 }}>
        Discover what's happening on campus today — from workshops to socials, all in one place.
      </p>
    </section>
  );
}
