import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { eventService } from "../services/event.service"

const C = { bg:"#0a0d14",card:"#111827",accent:"#7c5cfc",accentGlow:"#7c5cfc40",text:"#f0f2f8",muted:"#8892a4",border:"#1e2a3a",red:"#ef4444",green:"#22c55e",yellow:"#f59e0b" }

// Backend enum values (lowercase)
const CATS = ["workshop","seminar","tech","social","sports","arts","career","other"]
const CAT_LABELS = { workshop:"Workshop",seminar:"Seminar",tech:"Tech / Hackathon",social:"Social / Cultural",sports:"Sports",arts:"Arts",career:"Career",other:"Other" }

function EventForm({ initial, onSave, onCancel }) {
  const blank = { title:"",description:"",date:"",location:"",category:"workshop",capacity:"100",price:"",imageUrl:"",status:"published" }
  const [form, setForm] = useState(initial || blank)
  const [err, setErr]   = useState("")
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function handleSave(e) {
    e.preventDefault(); setErr(""); setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price)||0, capacity: Number(form.capacity)||100 }
      await onSave(payload)
    } catch(ex) { setErr(ex.message) }
    finally { setSaving(false) }
  }

  const inp = { width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box" }

  return (
    <form onSubmit={handleSave} style={{ display:"flex",flexDirection:"column",gap:13 }}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:13 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Event Title *</label>
          <input value={form.title} onChange={e=>set("title",e.target.value)} required style={inp} placeholder="e.g. AI Workshop 2025" onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
        </div>
        <div>
          <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Date *</label>
          <input value={form.date?.slice?.(0,10)||""} onChange={e=>set("date",e.target.value)} type="date" required style={inp} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
        </div>
        <div>
          <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Location *</label>
          <input value={form.location} onChange={e=>set("location",e.target.value)} required style={inp} placeholder="e.g. Main Hall A" onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
        </div>
        <div>
          <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Category</label>
          <select value={form.category} onChange={e=>set("category",e.target.value)} style={inp}>
            {CATS.map(c=><option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Capacity (required)</label>
          <input value={form.capacity||""} onChange={e=>set("capacity",e.target.value)} type="number" min="1" required style={inp} placeholder="e.g. 200" onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
        </div>
        <div>
          <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Price (ETB, 0 = free)</label>
          <input value={form.price||""} onChange={e=>set("price",e.target.value)} type="number" min="0" style={inp} placeholder="0" onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Description</label>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={3} style={{ ...inp,resize:"vertical" }} placeholder="Brief description..." onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:5 }}>Image URL (optional)</label>
          <input value={form.imageUrl||""} onChange={e=>set("imageUrl",e.target.value)} style={inp} placeholder="https://..." onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
        </div>
      </div>
      {err && <div style={{ background:"#7f1d1d",color:"#fca5a5",borderRadius:8,padding:"10px 14px",fontSize:13 }}>{err}</div>}
      <div style={{ display:"flex",gap:10 }}>
        <button type="button" onClick={onCancel} style={{ flex:1,background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:10,padding:"11px",fontSize:14,cursor:"pointer" }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ flex:2,background:`linear-gradient(135deg,${C.accent},#a259ff)`,color:"#fff",border:"none",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700,cursor:saving?"wait":"pointer" }}>
          {saving ? "Saving..." : initial ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  )
}

export default function AdminDashboard() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null) // null | 'create' | event-object
  const [deleting, setDeleting] = useState(null)
  const [tab, setTab]         = useState("all")

  function load() {
    setLoading(true)
    eventService.getAll({ limit:50 })
      .then(d => setEvents(d.events||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }
  useEffect(load, [])

  async function handleCreate(data) {
    await eventService.create(data); setModal(null); load()
  }
  async function handleUpdate(data) {
    await eventService.update(modal._id, data); setModal(null); load()
  }
  async function handleDelete(id) {
    if (!window.confirm("Delete this event? This cannot be undone.")) return
    setDeleting(id)
    try { await eventService.delete(id); load() }
    catch(e) { alert(e.message) }
    finally { setDeleting(null) }
  }

  const filtered = tab==="all" ? events : events.filter(e=>e.status===tab)

  return (
    <div style={{ maxWidth:1100,margin:"0 auto",padding:"40px 24px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32,flexWrap:"wrap",gap:14 }}>
        <div>
          <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:C.text,marginBottom:4 }}>Admin Dashboard</h1>
          <p style={{ color:C.muted,fontSize:14 }}>Manage all events — create, edit, delete</p>
        </div>
        <button onClick={()=>setModal("create")} style={{ background:`linear-gradient(135deg,${C.accent},#a259ff)`,color:"#fff",border:"none",borderRadius:12,padding:"11px 24px",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px ${C.accentGlow}` }}>
          + New Event
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28 }}>
        {[
          {label:"Total Events",  val:events.length,                                    color:C.accent},
          {label:"Published",     val:events.filter(e=>e.status==="published").length,   color:C.green},
          {label:"Draft",         val:events.filter(e=>e.status==="draft").length,       color:C.yellow},
          {label:"Registrations", val:events.reduce((s,e)=>s+(e.registeredCount||0),0), color:"#06b6d4"},
        ].map(s=>(
          <div key={s.label} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px" }}>
            <div style={{ fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12,color:C.muted,marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex",gap:4,marginBottom:22,background:C.card,borderRadius:12,padding:4,border:`1px solid ${C.border}`,width:"fit-content" }}>
        {["all","published","draft"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 18px",borderRadius:9,border:"none",cursor:"pointer",background:tab===t?C.accent:"transparent",color:tab===t?"#fff":C.muted,fontSize:13,fontWeight:tab===t?700:400,textTransform:"capitalize" }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center",padding:"60px 0",color:C.muted }}>Loading events...</div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:"center",padding:"60px 0",color:C.muted }}>
          <div style={{ fontSize:40,marginBottom:10 }}>📭</div>
          <div style={{ color:C.text,fontWeight:600,marginBottom:6 }}>No events yet</div>
          <button onClick={()=>setModal("create")} style={{ background:C.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px 22px",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8 }}>Create First Event</button>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {filtered.map(ev=>(
            <div key={ev._id} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:16 }}>
              {ev.image
                ? <img src={ev.image} alt={ev.title} style={{ width:72,height:56,objectFit:"cover",borderRadius:10,flexShrink:0 }} />
                : <div style={{ width:72,height:56,background:`${C.accent}18`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>🎪</div>
              }
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.title}</div>
                <div style={{ fontSize:12,color:C.muted }}>
                  📅 {new Date(ev.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})} &nbsp;·&nbsp;
                  📍 {ev.location} &nbsp;·&nbsp;
                  👥 {ev.registeredCount||0}{ev.capacity?` / ${ev.capacity}`:""} &nbsp;·&nbsp;
                  <span style={{ color:ev.status==="published"?C.green:C.yellow,fontWeight:600 }}>{ev.status}</span>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,flexShrink:0 }}>
                <Link to={`/events/${ev._id}`} style={{ background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"6px 12px",fontSize:12,textDecoration:"none",display:"inline-flex",alignItems:"center" }}>View</Link>
                <button onClick={()=>setModal(ev)} style={{ background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>Edit</button>
                <button onClick={()=>handleDelete(ev._id)} disabled={deleting===ev._id} style={{ background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.color=C.red}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>
                  {deleting===ev._id?"...":"Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={()=>setModal(null)}>
          <div style={{ background:C.card,border:`1px solid #2d3a4f`,borderRadius:22,width:"100%",maxWidth:560,padding:"32px 28px",maxHeight:"90vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:800,color:C.text,marginBottom:24 }}>
              {modal==="create" ? "Create New Event" : `Edit: ${modal.title}`}
            </h2>
            <EventForm
              initial={modal==="create" ? null : modal}
              onSave={modal==="create" ? handleCreate : handleUpdate}
              onCancel={()=>setModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
