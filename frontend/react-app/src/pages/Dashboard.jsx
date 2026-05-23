import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { eventService } from "../services/event.service"

const C = { bg:"#0a0d14",card:"#111827",accent:"#7c5cfc",text:"#f0f2f8",muted:"#8892a4",border:"#1e2a3a",free:"#22c55e",paid:"#f59e0b",red:"#ef4444",green:"#22c55e",yellow:"#f59e0b" }

function daysUntil(dateStr) {
  const d = new Date(dateStr); const now = new Date(); now.setHours(0,0,0,0)
  return Math.ceil((d - now) / 86400000)
}

export default function Dashboard() {
  const { user } = useAuth()
  const [regs, setRegs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState("upcoming")
  const [cancelId, setCancelId] = useState(null)

  useEffect(() => {
    eventService.myRegistrations()
      .then(data => setRegs(Array.isArray(data) ? data : []))
      .catch(() => setRegs([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel(regId) {
    setCancelId(regId)
    try {
      await eventService.cancelReg(regId)
      setRegs(prev => prev.filter(r => r._id !== regId))
    } catch(e) { alert(e.message) }
    finally { setCancelId(null) }
  }

  const upcoming = regs.filter(r => r.status !== "cancelled" && new Date(r.event?.date) >= new Date())
  const past     = regs.filter(r => r.status !== "cancelled" && new Date(r.event?.date) < new Date())
  const display  = tab === "upcoming" ? upcoming : past

  return (
    <div style={{ maxWidth:900,margin:"0 auto",padding:"40px 24px" }}>
      {/* Profile */}
      <div style={{ display:"flex",alignItems:"center",gap:18,marginBottom:36,padding:"24px 28px",background:C.card,borderRadius:20,border:`1px solid ${C.border}` }}>
        <div style={{ width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#7c5cfc,#a259ff)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:800,color:"#fff",flexShrink:0 }}>
          {user?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:800,color:C.text,marginBottom:3 }}>Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <div style={{ fontSize:13,color:C.muted }}>{user?.email}{user?.department && ` · ${user.department}`}</div>
        </div>
        <div style={{ display:"flex",gap:14 }}>
          {[{label:"Registered",val:regs.filter(r=>r.status!=="cancelled").length,color:C.accent},{label:"Upcoming",val:upcoming.length,color:C.green}].map(s=>(
            <div key={s.label} style={{ textAlign:"center",padding:"10px 16px",background:C.bg,borderRadius:12,border:`1px solid ${C.border}` }}>
              <div style={{ fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",gap:4,marginBottom:24,background:C.card,borderRadius:12,padding:4,border:`1px solid ${C.border}` }}>
        {[{id:"upcoming",label:`Upcoming (${upcoming.length})`},{id:"past",label:`Past (${past.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,padding:"9px 12px",borderRadius:9,border:"none",cursor:"pointer",background:tab===t.id?C.accent:"transparent",color:tab===t.id?"#fff":C.muted,fontSize:13,fontWeight:tab===t.id?700:400,transition:"all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center",padding:"60px 0",color:C.muted }}>Loading your events...</div>
      ) : display.length === 0 ? (
        <div style={{ textAlign:"center",padding:"60px 24px",color:C.muted }}>
          <div style={{ fontSize:48,marginBottom:12 }}>{tab==="upcoming"?"📅":"🏁"}</div>
          <div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:8 }}>{tab==="upcoming"?"No upcoming events":"No past events"}</div>
          {tab==="upcoming" && <Link to="/events" style={{ background:C.accent,color:"#fff",borderRadius:10,padding:"10px 24px",fontSize:14,fontWeight:700,textDecoration:"none",display:"inline-block",marginTop:8 }}>Browse Events</Link>}
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {display.map(reg => {
            const ev = reg.event || {}
            const days = ev.date ? daysUntil(ev.date) : null
            const urgency = days===0?"TODAY":days===1?"TOMORROW":days!==null&&days<=3?`${days} DAYS`:null
            const isFree = !ev.price || ev.price===0
            return (
              <div key={reg._id} style={{ background:C.card,border:`1px solid ${urgency?C.accent+"66":C.border}`,borderRadius:16,overflow:"hidden",display:"flex" }}>
                {ev.image
                  ? <img src={ev.image} alt={ev.title} style={{ width:100,objectFit:"cover",flexShrink:0 }} />
                  : <div style={{ width:100,background:`${C.accent}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0 }}>🎪</div>
                }
                <div style={{ padding:"16px 18px",flex:1 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
                    <Link to={`/events/${ev._id}`} style={{ fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:C.text,textDecoration:"none" }}>{ev.title||"Event"}</Link>
                    {urgency && <span style={{ background:urgency==="TODAY"?C.red:C.yellow,color:"#000",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20,flexShrink:0,marginLeft:8 }}>{urgency}</span>}
                  </div>
                  <div style={{ fontSize:12,color:C.muted,marginBottom:2 }}>📅 {ev.date ? new Date(ev.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}</div>
                  <div style={{ fontSize:12,color:C.muted,marginBottom:10 }}>📍 {ev.location||"—"}</div>
                  <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                    <span style={{ fontSize:12,fontWeight:700,color:isFree?C.free:C.paid }}>{isFree?"Free":`ETB ${ev.price}`}</span>
                    <span style={{ fontSize:11,color:C.muted }}>· Ticket #{reg.ticketNumber||"—"}</span>
                  </div>
                </div>
                {tab==="upcoming" && (
                  <div style={{ padding:"16px 14px",display:"flex",alignItems:"center" }}>
                    <button onClick={()=>handleCancel(reg._id)} disabled={cancelId===reg._id} style={{ background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.color=C.red}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>
                      {cancelId===reg._id?"...":"Cancel"}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
