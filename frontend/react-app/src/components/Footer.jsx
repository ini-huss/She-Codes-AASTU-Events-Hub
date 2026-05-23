import { Link } from "react-router-dom"
const C = { bg:"#0a0d14",card:"#111827",text:"#f0f2f8",muted:"#8892a4",border:"#1e2a3a",accent:"#7c5cfc",dim:"#4a5568" }

export default function Footer() {
  return (
    <footer style={{ background:C.card,borderTop:`1px solid ${C.border}`,padding:"40px 32px 24px",marginTop:"auto" }}>
      <div style={{ maxWidth:1100,margin:"0 auto" }}>
        <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:40,paddingBottom:32,borderBottom:`1px solid ${C.border}` }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:12 }}>
              <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#7c5cfc,#a259ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>⚡</div>
              <span style={{ fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.text }}>AASTU Events Hub</span>
            </div>
            <p style={{ fontSize:13,color:C.muted,lineHeight:1.7,maxWidth:260 }}>The official campus event platform for Addis Ababa Science and Technology University.</p>
          </div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:12,color:C.text,marginBottom:14,letterSpacing:0.5 }}>PLATFORM</div>
            {[{to:"/",l:"Home"},{to:"/events",l:"Events"},{to:"/dashboard",l:"My Events"},{to:"/login",l:"Sign In"}].map(x=>(
              <Link key={x.to} to={x.to} style={{ display:"block",color:C.muted,fontSize:13,textDecoration:"none",marginBottom:9 }}>{x.l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:12,color:C.text,marginBottom:14,letterSpacing:0.5 }}>CAMPAIGNS</div>
            {[
              {l:"She Codes Bootcamp",href:"../../microsites/bootcamp-page/index.html"},
              {l:"Hackathon Campaign",href:"../../microsites/hackathon-campaign/index.html"},
              {l:"Women in Tech",href:"../../microsites/women-in-tech/index.html"},
            ].map(x=>(
              <a key={x.l} href={x.href} target="_blank" rel="noreferrer" style={{ display:"block",color:C.muted,fontSize:13,textDecoration:"none",marginBottom:9 }}>{x.l}</a>
            ))}
          </div>
        </div>
        <div style={{ paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
          <div style={{ fontSize:12,color:C.dim }}>© 2026 Addis Ababa Science and Technology University. All Rights Reserved.</div>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block" }} />
            <span style={{ fontSize:12,color:C.muted }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
