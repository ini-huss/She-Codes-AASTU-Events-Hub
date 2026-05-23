import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const C = {
  bg:"#0a0d14", card:"#111827", accent:"#7c5cfc", accentLight:"#9b7ffe",
  text:"#f0f2f8", muted:"#8892a4", border:"#1e2a3a", red:"#ef4444",
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const links = user?.role === "admin"
    ? [{ to:"/", label:"Home" },{ to:"/events", label:"Events" },{ to:"/admin", label:"Admin" }]
    : [{ to:"/", label:"Home" },{ to:"/events", label:"Events" },{ to:"/dashboard", label:"My Events" }]

  return (
    <nav style={{ position:"sticky",top:0,zIndex:100,background:`${C.bg}ee`,backdropFilter:"blur(14px)",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",height:58 }}>
      <Link to="/" style={{ display:"flex",alignItems:"center",gap:9,textDecoration:"none" }}>
        <div style={{ width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.accent},#a259ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>⚡</div>
        <span style={{ fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.text }}>AASTU Events Hub</span>
      </Link>

      <div style={{ display:"flex",gap:2 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ padding:"6px 13px",borderRadius:8,fontSize:14,fontWeight:pathname===l.to?600:400,color:pathname===l.to?C.text:C.muted,textDecoration:"none",borderBottom:pathname===l.to?`2px solid ${C.accent}`:"2px solid transparent",transition:"color 0.2s" }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
        {user ? (
          <>
            <div style={{ width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#a259ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff" }}>
              {user.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <span style={{ fontSize:13,color:C.text,fontWeight:600 }}>{user.name?.split(" ")[0]}</span>
            <button onClick={()=>{logout();navigate("/")}} style={{ background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"6px 12px",fontSize:13,cursor:"pointer" }}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color:C.muted,fontSize:14,textDecoration:"none",padding:"7px 14px" }}>Sign In</Link>
            <Link to="/register" style={{ background:`linear-gradient(135deg,${C.accent},#a259ff)`,color:"#fff",borderRadius:9,padding:"8px 18px",fontSize:14,fontWeight:700,textDecoration:"none" }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
