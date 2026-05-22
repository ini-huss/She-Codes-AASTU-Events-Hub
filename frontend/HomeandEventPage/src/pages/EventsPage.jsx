import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { COLORS } from '../components/constants'
import api from '../api'

const SORT_OPTIONS = ['Newest First', 'Oldest First', 'Price: Low to High', 'A-Z']

const CAT_COLORS = {
  tech: '#3b82f6', workshop: '#ffd166', seminar: '#1de9b6',
  social: '#ff6b9d', sports: '#4cc9f0', arts: '#a855f7',
  career: '#22c55e', other: '#6b7280',
}
function catColor(c) { return CAT_COLORS[c?.toLowerCase()] || '#7c83fd' }

// ── Event Card — no register button, clicking navigates to detail ─────────────
function EventCard({ event }) {
  const navigate = useNavigate()
  const isFree   = !event.price || event.price === 0
  const isFull   = event.capacity && (event.registeredCount || 0) >= event.capacity
  const cc       = catColor(event.category)

  return (
    <article
      style={{
        background: COLORS.bgCard, borderRadius: 18, overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
      onClick={() => navigate(`/events/${event._id}`)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ position: 'relative', height: 180 }}>
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${cc}22, ${COLORS.accent}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎪</div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,13,20,0.7) 0%, transparent 50%)' }} />
        <span style={{ position: 'absolute', top: 12, left: 12, background: cc, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{event.category}</span>
        {isFull && <span style={{ position: 'absolute', top: 12, right: 12, background: COLORS.red, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>FULL</span>}
      </div>

      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 10, lineHeight: 1.3 }}>{event.title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>📅 {event.date ? new Date(event.date).toLocaleDateString() : '—'}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>📍 {event.location}</div>
          {event.registeredCount > 0 && (
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>
              👥 {event.registeredCount}{event.capacity ? ` / ${event.capacity}` : ''} registered
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: isFree ? COLORS.free : COLORS.paid }}>
            {isFree ? 'Free' : `ETB ${event.price}`}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.accentLight }}>
            View Details →
          </span>
        </div>
      </div>
    </article>
  )
}

// ── Events Page ───────────────────────────────────────────────────────────────
export default function EventsPage() {
  const location  = useLocation()
  const [events, setEvents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  // Pre-populate category filter from ?category= query param (set by home page pills)
  const [catFilter, setCatFilter] = useState(() => {
    const params = new URLSearchParams(location.search)
    return params.get('category') || 'All'
  })
  const [sort, setSort]           = useState('Newest First')

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data.events || []))
      .catch(() => setError('Failed to load events. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['All', ...new Set(events.map(e => e.category).filter(Boolean))], [events])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return events.filter(e => {
      const mQ = !q || [e.title, e.category, e.location, e.organizer].some(v => v?.toLowerCase().includes(q))
      const mC = catFilter === 'All' || e.category === catFilter
      return mQ && mC
    })
  }, [events, search, catFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'A-Z')                return arr.sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'Oldest First')       return arr.sort((a, b) => new Date(a.date) - new Date(b.date))
    if (sort === 'Price: Low to High') return arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    return arr.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [filtered, sort])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>All Events</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 15 }}>
          {loading ? 'Loading events...' : events.length > 0 ? `${events.length} event${events.length !== 1 ? 's' : ''} available` : 'No events yet. Check back soon!'}
        </p>
      </div>

      {/* Search + sort */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '10px 16px' }}>
          <span style={{ color: COLORS.textMuted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, venues, organizers..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: COLORS.text, fontSize: 14 }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', fontSize: 16 }}>✕</button>}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '10px 16px', color: COLORS.text, fontSize: 14, outline: 'none', cursor: 'pointer' }}>
          {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            background: catFilter === c ? COLORS.accent : COLORS.bgCard,
            color: catFilter === c ? '#fff' : COLORS.textMuted,
            border: `1px solid ${catFilter === c ? COLORS.accent : COLORS.border}`,
            borderRadius: 50, padding: '7px 16px', fontSize: 13, fontWeight: catFilter === c ? 700 : 400,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{c}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 18, height: 320, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: COLORS.red }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div>{error}</div>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>
            Showing <strong style={{ color: COLORS.text }}>{sorted.length}</strong> event{sorted.length !== 1 ? 's' : ''}
          </div>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: COLORS.textMuted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div>No events match your search. Try clearing filters.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}>
              {sorted.map(e => <EventCard key={e._id} event={e} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
