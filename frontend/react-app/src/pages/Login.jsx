import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const C = { bg:"#0a0d14",card:"#111827",accent:"#7c5cfc",accentGlow:"#7c5cfc40",text:"#f0f2f8",muted:"#8892a4",border:"#1e2a3a",red:"#ef4444" }

export default function Login() {
  const { login, setError: setCtxErr } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || "/"

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr]           = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setErr(""); setLoading(true)
    try {
      const data = await login(email, password)
      navigate(data.user?.role === "admin" ? "/admin" : from, { replace: true })
    } catch (ex) {
      setErr(ex.message || "Invalid email or password.")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:C.card,border:`1px solid #1e2a3a`,borderRadius:24,width:"100%",maxWidth:420,padding:"40px 32px",boxShadow:"0 24px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${C.accent},#a259ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 14px" }}>⚡</div>
          <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:C.muted,fontSize:14 }}>Sign in to your AASTU Events Hub account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:6 }}>Email Address</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@aastu.edu.et" required
              style={{ width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
          </div>
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:6 }}>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" required
              style={{ width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
          </div>
          {err && <div style={{ background:"#7f1d1d",color:"#fca5a5",borderRadius:8,padding:"10px 14px",fontSize:13 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ background:`linear-gradient(135deg,${C.accent},#a259ff)`,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,cursor:loading?"wait":"pointer",boxShadow:`0 4px 20px ${C.accentGlow}`,marginTop:4 }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign:"center",marginTop:20,fontSize:13,color:C.muted }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color:"#9b7ffe",fontWeight:600,textDecoration:"none" }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
