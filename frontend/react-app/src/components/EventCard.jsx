import { Link } from "react-router-dom"

const C = { card:"#111827",border:"#1e2a3a",accent:"#7c5cfc",text:"#f0f2f8",muted:"#8892a4",free:"#22c55e",paid:"#f59e0b" }
const tc = s => s?.replace(/\b\w/g, c => c.toUpperCase()) || s

export default function EventCard({ event }) {
  const isFree = !event.price || event.price === 0
  const isFull = event.capacity && event.registeredCount >= event.capacity
  const img    = event.imageUrl || event.image || null
  const title  = event.title  || event.name  || "Untitled"
  const loc    = event.location || event.venue || ""
  const cat    = tc(event.category || "event")

  return (
    <Link to={`/events/${event._id}`} style={{ textDecoration:"none" }}>
      <article style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",transition:"transform 0.2s,border-color 0.2s,box-shadow 0.2s",display:"block" }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.4)"}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none"}}>
        <div style={{ position:"relative",height:170 }}>
          {img
            ? <img src={img} alt={title} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} />
            : <div style={{ width:"100%",height:"100%",background:`linear-gradient(135deg,${C.accent}22,#06b6d422)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36 }}>🎪</div>
          }
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,13,20,0.65) 0%,transparent 50%)" }} />
          <span style={{ position:"absolute",top:10,left:10,background:C.accent,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20 }}>{cat}</span>
          {isFull && <span style={{ position:"absolute",top:10,right:10,background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20 }}>FULL</span>}
        </div>
        <div style={{ padding:"14px 16px 16px" }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:8,lineHeight:1.3 }}>{title}</h3>
          <div style={{ fontSize:12,color:C.muted,marginBottom:3 }}>📅 {new Date(event.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
          <div style={{ fontSize:12,color:C.muted,marginBottom:3 }}>📍 {loc}</div>
          {event.registeredCount>0 && <div style={{ fontSize:12,color:C.muted,marginBottom:10 }}>👥 {event.registeredCount}{event.capacity?` / ${event.capacity}`:""} registered</div>}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10 }}>
            <span style={{ fontSize:13,fontWeight:700,color:isFree?C.free:C.paid }}>{isFree?"Free":`ETB ${event.price}`}</span>
            <span style={{ fontSize:12,color:C.accent,fontWeight:600 }}>View Details →</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
