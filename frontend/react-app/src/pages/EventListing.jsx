import { useState } from "react"
import { useEvents } from "../hooks/useEvents"
import EventCard from "../components/EventCard"

const C = { bg:"#0a0d14",card:"#111827",accent:"#7c5cfc",text:"#f0f2f8",muted:"#8892a4",border:"#1e2a3a" }
const CATS = ["all","Workshop","Seminar","Competition","Hackathon","Tech Talk","Cultural Show","Music Event","Sports","Networking","Fundraiser","Other"]

export default function EventListing() {
  const [search, setSearch]   = useState("")
  const [cat, setCat]         = useState("all")
  const [upcoming, setUpcoming] = useState(true)

  const { events, loading, error, pagination, refetch } = useEvents({
    ...(cat !== "all" && { category: cat }),
    ...(upcoming && { upcoming: "true" }),
    ...(search && { search }),
    limit: 12,
  })

  return (
    <div style={{ maxWidth:1200,margin:"0 auto",padding:"40px 24px" }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:800,color:C.text,marginBottom:8 }}>All Events</h1>
        <p style={{ color:C.muted,fontSize:15 }}>Browse and register for upcoming AASTU events</p>
      </div>

      {/* Search + filter */}
      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:220,display:"flex",alignItems:"center",gap:10,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 16px" }}>
          <span style={{ color:C.muted }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events..."
            style={{ flex:1,background:"none",border:"none",outline:"none",color:C.text,fontSize:14 }} />
          {search && <button onClick={()=>setSearch("")} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16 }}>✕</button>}
        </div>
        <button onClick={()=>setUpcoming(v=>!v)} style={{ background:upcoming?C.accent:C.card,color:upcoming?"#fff":C.muted,border:`1px solid ${upcoming?C.accent:C.border}`,borderRadius:12,padding:"10px 18px",fontSize:14,fontWeight:600,cursor:"pointer" }}>
          {upcoming ? "Upcoming Only" : "All Events"}
        </button>
      </div>

      {/* Category pills */}
      <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:32 }}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{ background:cat===c?C.accent:C.card,color:cat===c?"#fff":C.muted,border:`1px solid ${cat===c?C.accent:C.border}`,borderRadius:50,padding:"7px 16px",fontSize:13,fontWeight:cat===c?700:400,cursor:"pointer",transition:"all 0.2s",textTransform:"capitalize" }}>
            {c==="all"?"All Categories":c}
          </button>
        ))}
      </div>

      {error && <div style={{ background:"#7f1d1d",color:"#fca5a5",borderRadius:10,padding:"14px",marginBottom:20,fontSize:14 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ textAlign:"center",padding:"80px 0",color:C.muted }}>Loading events...</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign:"center",padding:"80px 0",color:C.muted }}>
          <div style={{ fontSize:48,marginBottom:12 }}>📭</div>
          <div style={{ fontSize:16,fontWeight:600,color:C.text,marginBottom:6 }}>No events found</div>
          <div style={{ fontSize:14 }}>Try changing your filters or check back later.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize:13,color:C.muted,marginBottom:20 }}>
            Showing <strong style={{ color:C.text }}>{events.length}</strong> event{events.length!==1?"s":""}
            {pagination && ` of ${pagination.totalEvents}`}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:22 }}>
            {events.map(e=><EventCard key={e._id} event={e} />)}
          </div>
        </>
      )}
    </div>
  )
}
