import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const C = { bg:"#0a0d14",card:"#111827",accent:"#7c5cfc",accentGlow:"#7c5cfc40",text:"#f0f2f8",muted:"#8892a4",border:"#1e2a3a" }

const DEPTS = ["Computer Science & Engineering","Software Engineering","Electrical & Computer Engineering","Civil & Environmental Engineering","Mechanical Engineering","Chemical Engineering","Industrial Engineering","Architecture & Urban Planning","Applied Mathematics","Applied Physics","Applied Chemistry","Biotechnology","Student Union","GDSC AASTU","IEEE Student Branch","Other"]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:"",email:"",password:"",confirm:"",department:"",studentId:"" })
  const [err, setErr]   = useState("")
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function handleSubmit(e) {
    e.preventDefault(); setErr("")
    if (form.password !== form.confirm) { setErr("Passwords do not match."); return }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.department, form.studentId)
      navigate("/")
    } catch (ex) { setErr(ex.message || "Registration failed.") }
    finally { setLoading(false) }
  }

  const inp = { width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box" }

  return (
    <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:C.card,border:`1px solid #1e2a3a`,borderRadius:24,width:"100%",maxWidth:460,padding:"40px 32px",boxShadow:"0 24px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${C.accent},#a259ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 14px" }}>⚡</div>
          <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:6 }}>Create your account</h1>
          <p style={{ color:C.muted,fontSize:14 }}>Join AASTU Events Hub — it's free</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:13 }}>
          {[
            { label:"Full Name *",      key:"name",     type:"text",     ph:"e.g. Selam Tesfaye" },
            { label:"Email Address *",  key:"email",    type:"email",    ph:"you@aastu.edu.et" },
            { label:"Password *",       key:"password", type:"password", ph:"Min. 6 characters" },
            { label:"Confirm Password *",key:"confirm", type:"password", ph:"Repeat password" },
            { label:"Student ID",       key:"studentId",type:"text",     ph:"e.g. ETS0123/14 (optional)" },
          ].map(f=>(
            <div key={f.key}>
              <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>{f.label}</label>
              <input value={form[f.key]} onChange={e=>set(f.key,e.target.value)} type={f.type} placeholder={f.ph}
                style={inp} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
          ))}
          <div>
            <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Department</label>
            <select value={form.department} onChange={e=>set("department",e.target.value)} style={{ ...inp,color:form.department?C.text:C.muted }}>
              <option value="">— Select department —</option>
              {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {err && <div style={{ background:"#7f1d1d",color:"#fca5a5",borderRadius:8,padding:"10px 14px",fontSize:13 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ background:`linear-gradient(135deg,${C.accent},#a259ff)`,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,cursor:loading?"wait":"pointer",marginTop:4 }}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign:"center",marginTop:20,fontSize:13,color:C.muted }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color:"#9b7ffe",fontWeight:600,textDecoration:"none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
