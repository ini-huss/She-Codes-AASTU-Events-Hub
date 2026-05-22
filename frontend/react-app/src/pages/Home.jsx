import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useEvents } from "../hooks/useEvents"
import EventCard from "../components/EventCard"

const C = { bg:"#0a0d14",card:"#111827",accent:"#7c5cfc",accentGlow:"#7c5cfc40",text:"#f0f2f8",muted:"#8892a4",border:"#1e2a3a",borderLight:"#2d3a4f" }

export default function Home() {
  const { user } = useAuth()
  const { events, loading } = useEvents({ upcoming: "true", limit: 6 })

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>

      {/* Hero */}
      <section style={{ minHeight:"88vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 24px",textAlign:"center",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:"10%",left:"5%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${C.accentGlow} 0%,transparent 70%)`,pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:"5%",right:"5%",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px)",backgroundSize:"44px 44px",pointerEvents:"none" }} />

        <div style={{ position:"relative",maxWidth:760 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(124,92,252,0.1)",border:"1px solid rgba(124,92,252,0.25)",borderRadius:50,padding:"6px 18px",marginBottom:28 }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:12,fontWeight:600,color:"#9b7ffe",letterSpacing:0.6 }}>
              {events.length>0 ? `${events.length} UPCOMING EVENTS` : "AASTU OFFICIAL EVENT PLATFORM"}
            </span>
          </div>

          <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:"clamp(36px,6vw,68px)",fontWeight:800,color:C.text,lineHeight:1.08,marginBottom:20,letterSpacing:"-1.5px" }}>
            Every Campus Event,{" "}
            <span style={{ background:"linear-gradient(135deg,#7c5cfc,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
              One Place
            </span>
          </h1>

          <p style={{ fontSize:"clamp(15px,2vw,18px)",color:C.muted,lineHeight:1.75,maxWidth:540,margin:"0 auto 40px" }}>
            Discover workshops, hackathons, cultural nights, and sports events at AASTU — all verified and live the moment admins approve them.
          </p>

          <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
            <Link to="/events" style={{ background:"linear-gradient(135deg,#7c5cfc,#a259ff)",color:"#fff",borderRadius:14,padding:"14px 36px",fontSize:16,fontWeight:700,textDecoration:"none",boxShadow:`0 8px 32px ${C.accentGlow}` }}>
              Browse Events
            </Link>
            {!user && (
              <Link to="/register" style={{ background:"transparent",color:C.text,border:`1px solid ${C.borderLight}`,borderRadius:14,padding:"14px 36px",fontSize:16,fontWeight:600,textDecoration:"none" }}>
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section style={{ padding:"80px 32px",background:C.card,borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36,flexWrap:"wrap",gap:12 }}>
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:"#9b7ffe",letterSpacing:1,marginBottom:8 }}>UPCOMING</div>
              <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:C.text }}>Events Happening Soon</h2>
            </div>
            <Link to="/events" style={{ color:"#9b7ffe",fontSize:14,fontWeight:600,textDecoration:"none",border:"1px solid #7c5cfc",borderRadius:10,padding:"9px 20px" }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign:"center",padding:"60px 0",color:C.muted }}>Loading events...</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign:"center",padding:"60px 0",color:C.muted }}>
              <div style={{ fontSize:48,marginBottom:12 }}>📭</div>
              <div style={{ fontSize:16,fontWeight:600,color:C.text,marginBottom:6 }}>No upcoming events yet</div>
              <div style={{ fontSize:14 }}>Check back soon — events appear here once approved.</div>
            </div>
          ) : (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:22 }}>
              {events.map(e=><EventCard key={e._id} event={e} />)}
            </div>
          )}
        </div>
      </section>

      {/* Microsites links */}
      <section style={{ padding:"80px 32px",maxWidth:1100,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:C.text,marginBottom:10 }}>Event Campaigns</h2>
          <p style={{ color:C.muted,fontSize:14 }}>Dedicated pages for major AASTU events</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
          {[
            { title:"She Codes Bootcamp",  desc:"Learn to code with AASTU's premier bootcamp program",  icon:"💻", href:"../../microsites/bootcamp-page/index.html",    color:"#7c5cfc" },
            { title:"Hackathon Campaign",  desc:"Build, compete, and win at the AASTU Hackathon",        icon:"🏆", href:"../../microsites/hackathon-campaign/index.html", color:"#f59e0b" },
            { title:"Women in Tech Conf.", desc:"Inspiring the next generation of women in technology",  icon:"👩‍💻", href:"../../microsites/women-in-tech/index.html",      color:"#ec4899" },
          ].map(m=>(
            <a key={m.title} href={m.href} target="_blank" rel="noreferrer" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"28px 24px",textDecoration:"none",display:"block",transition:"border-color 0.2s,transform 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=m.color;e.currentTarget.style.transform="translateY(-3px)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none"}}>
              <div style={{ fontSize:32,marginBottom:12 }}>{m.icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:C.text,marginBottom:8 }}>{m.title}</div>
              <div style={{ fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:16 }}>{m.desc}</div>
              <span style={{ fontSize:13,fontWeight:600,color:m.color }}>Visit Page →</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
