import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { eventService } from "../services/event.service"

const C = { bg:"#0a0d14",card:"#111827",accent:"#7c5cfc",accentGlow:"#7c5cfc40",text:"#f0f2f8",muted:"#8892a4",border:"#1e2a3a",free:"#22c55e",paid:"#f59e0b",red:"#ef4444",green:"#22c55e" }

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [regLoading, setRegLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [regId, setRegId]         = useState(null)
  const [msg, setMsg]             = useState(null) // {type:'ok'|'err', text}

  useEffect(() => {
    eventService.getById(id)
      .then(d => setEvent(d.event))
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    if (!user) return
    eventService.myRegistrations()
      .then(regs => {
        const found = regs.find?.(r => r.event?._id === id || r.event === id)
        if (found && found.status !== "cancelled") { setRegistered(true); setRegId(found._id) }
      })
      .catch(() => {})
  }, [user, id])

  async function handleRegister() {
    if (!user) { navigate("/login"); return }
    setRegLoading(true); setMsg(null)
    try {
      const data = await eventService.register(id)
      setRegistered(true)
      setRegId(data.registration?._id)
      setMsg({ type:"ok", text:`Registered! Ticket #${data.ticketNumber || "—"}` })
      setEvent(prev => prev ? { ...prev, registeredCount: (prev.registeredCount||0)+1 } : prev)
    } catch(e) { setMsg({ type:"err", text: e.message }) }
    finally { setRegLoading(false) }
  }

  async function handleCancel() {
    if (!regId) return
    setRegLoading(true); setMsg(null)
    try {
      await eventService.cancelReg(regId)
      setRegistered(false); setRegId(null)
      setMsg({ type:"ok", text:"Registration cancelled." })
      setEvent(prev => prev ? { ...prev, registeredCount: Math.max(0,(prev.registeredCount||1)-1) } : prev)
    } catch(e) { setMsg({ type:"err", text: e.message }) }
    finally { setRegLoading(false) }
  }

  if (loading) return <div style={{ textAlign:"center",padding:"100px 0",color:C.muted }}>Loading event...</div>
  if (!event)  return null

  const isFree = !event.price || event.price === 0
  const isFull = event.capacity && event.registeredCount >= event.capacity
  const dateStr = new Date(event.date).toLocaleDateString("en-US",{ weekday:"long",year:"numeric",month:"long",day:"numeric" })

  return (
    <div style={{ maxWidth:860,margin:"0 auto",padding:"40px 24px" }}>
      <Link to="/events" style={{ color:C.muted,fontSize:14,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,marginBottom:28 }}>← Back to Events</Link>

      {/* Hero image */}
      {event.image
        ? <img src={event.image} alt={event.title} style={{ width:"100%",height:320,objectFit:"cover",borderRadius:20,display:"block",marginBottom:32 }} />
        : <div style={{ width:"100%",height:240,background:`linear-gradient(135deg,${C.accent}22,#06b6d422)`,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,marginBottom:32 }}>🎪</div>
      }

      <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:32,alignItems:"start" }}>
        {/* Left */}
        <div>
          <span style={{ background:C.accent,color:"#fff",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:20,marginBottom:14,display:"inline-block" }}>{event.category}</span>
          <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:"clamp(24px,4vw,36px)",fontWeight:800,color:C.text,marginBottom:20,lineHeight:1.2 }}>{event.title}</h1>

          <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:28 }}>
            {[["📅",dateStr],["📍",event.location],["🏢",event.createdBy?.name||"AASTU"],["👥",event.capacity?`${event.registeredCount||0} / ${event.capacity} registered`:`${event.registeredCount||0} registered`]].map(([icon,val])=>(
              <div key={icon} style={{ display:"flex",alignItems:"center",gap:10,fontSize:14,color:C.muted }}>
                <span>{icon}</span><span style={{ color:C.text }}>{val}</span>
              </div>
            ))}
          </div>

          {event.description && (
            <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 22px" }}>
              <h3 style={{ fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:10 }}>About this event</h3>
              <p style={{ fontSize:14,color:C.muted,lineHeight:1.8 }}>{event.description}</p>
            </div>
          )}
        </div>

        {/* Right — registration card */}
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"24px 22px",position:"sticky",top:80 }}>
          <div style={{ fontSize:24,fontWeight:800,color:isFree?C.free:C.paid,marginBottom:4 }}>
            {isFree ? "Free Entry" : `ETB ${event.price}`}
          </div>
          <div style={{ fontSize:13,color:C.muted,marginBottom:20 }}>
            {isFull ? "⚠️ Event is at full capacity" : event.capacity ? `${event.capacity - (event.registeredCount||0)} spots remaining` : "Open registration"}
          </div>

          {msg && (
            <div style={{ background:msg.type==="ok"?"#052e16":"#7f1d1d",color:msg.type==="ok"?"#86efac":"#fca5a5",borderRadius:10,padding:"12px 14px",fontSize:13,marginBottom:16 }}>
              {msg.type==="ok"?"✅":"⚠️"} {msg.text}
            </div>
          )}

          {registered ? (
            <>
              <div style={{ background:"#052e16",border:"1px solid #166534",borderRadius:12,padding:"14px",textAlign:"center",marginBottom:14 }}>
                <div style={{ fontSize:20,marginBottom:4 }}>✅</div>
                <div style={{ color:"#86efac",fontWeight:700,fontSize:14 }}>You're registered!</div>
              </div>
              <button onClick={handleCancel} disabled={regLoading} style={{ width:"100%",background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:10,padding:"11px",fontSize:14,cursor:"pointer" }}>
                {regLoading ? "Cancelling..." : "Cancel Registration"}
              </button>
            </>
          ) : isFull ? (
            <div style={{ background:"#450a0a",border:"1px solid #7f1d1d",borderRadius:12,padding:"14px",textAlign:"center",color:"#fca5a5",fontSize:14 }}>
              This event is full
            </div>
          ) : (
            <button onClick={handleRegister} disabled={regLoading} style={{ width:"100%",background:`linear-gradient(135deg,${C.accent},#a259ff)`,color:"#fff",border:"none",borderRadius:12,padding:"14px",fontSize:15,fontWeight:700,cursor:regLoading?"wait":"pointer",boxShadow:`0 4px 20px ${C.accentGlow}` }}>
              {regLoading ? "Registering..." : user ? "Register Now →" : "Sign In to Register →"}
            </button>
          )}

          {!user && !registered && (
            <p style={{ textAlign:"center",marginTop:12,fontSize:12,color:C.muted }}>
              <Link to="/login" style={{ color:"#9b7ffe",fontWeight:600,textDecoration:"none" }}>Sign in</Link> or{" "}
              <Link to="/register" style={{ color:"#9b7ffe",fontWeight:600,textDecoration:"none" }}>create account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
