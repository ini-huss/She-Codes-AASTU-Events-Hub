import { COLORS } from "./constants";

export default function HeroBanner({ studentName }) {
  const firstName = studentName ? studentName.split(" ")[0] : null;

  return (
    <section style={{ padding: "36px 32px 0" }}>
      <h1 style={{
        fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800,
        color: COLORS.text, margin: 0, letterSpacing: "-0.5px",
      }}>
        {firstName
          ? <>Welcome back, <span style={{ color: COLORS.accentLight }}>{firstName}</span>! 👋</>
          : "Welcome to AASTU Events Hub"}
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: COLORS.textMuted, fontSize: 14, margin: "8px 0 0", lineHeight: 1.6, maxWidth: 600 }}>
        Ready to discover what's happening on campus today? Check out your personalized feed based on your tech and arts interests.
      </p>
    </section>
  );
}
