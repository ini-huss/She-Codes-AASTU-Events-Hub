import React, { useState, useMemo, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import s from './UsersPage.module.css'
import api from '../api'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export default function AttendeesPage() {
  const [events, setEvents]           = useState([])
  const [attendees, setAttendees]     = useState([])
  const [selectedEventId, setSelected] = useState('')
  const [search, setSearch]           = useState('')
  const [loadingEvts, setLoadingEvts] = useState(true)
  const [loadingAtt, setLoadingAtt]   = useState(false)
  const [checkingIn, setCheckingIn]   = useState(null)
  const [error, setError]             = useState('')

  // Load events on mount
  useEffect(() => {
    api.get('/events')
      .then(res => {
        const raw = res.data.events || res.data || []
        setEvents(raw)
        setLoadingEvts(false)
      })
      .catch(() => setLoadingEvts(false))
  }, [])

  // Load attendees when event is selected
  useEffect(() => {
    if (!selectedEventId) { setAttendees([]); return }
    setLoadingAtt(true)
    setError('')
    api.get(`/admin/attendees?eventId=${selectedEventId}`)
      .then(res => {
        setAttendees(res.data.attendees || res.data || [])
        setLoadingAtt(false)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load attendees.')
        setLoadingAtt(false)
      })
  }, [selectedEventId])

  const selectedEvent = events.find(e => String(e._id || e.id) === String(selectedEventId))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return attendees
    return attendees.filter(r => {
      const name  = r.user?.name  || ''
      const email = r.user?.email || ''
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q)
    })
  }, [attendees, search])

  const checkedInCount = attendees.filter(r => r.checkedIn).length

  async function handleCheckin(registrationId) {
    setCheckingIn(registrationId)
    try {
      await api.put(`/admin/attendees/${registrationId}/checkin`)
      setAttendees(prev => prev.map(r =>
        (r._id || r.id) === registrationId ? { ...r, checkedIn: true } : r
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed.')
    } finally {
      setCheckingIn(null)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Attendees</h1>
          <p className={s.sub}>Select an event to view and check in its registered attendees.</p>
        </div>
      </div>

      {/* Event selector */}
      <div className={`${s.tableCard} glass`} style={{ padding: '20px 24px', marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--t3)', marginBottom: 8 }}>
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={e => { setSelected(e.target.value); setSearch('') }}
          style={{
            width: '100%', maxWidth: 480,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 14px',
            color: selectedEventId ? 'var(--t1)' : 'var(--t3)',
            fontSize: 14, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">— Choose an event —</option>
          {loadingEvts
            ? <option disabled>Loading events…</option>
            : events.map(e => (
                <option key={e._id || e.id} value={String(e._id || e.id)}>
                  {e.title || e.name} — {e.date ? new Date(e.date).toLocaleDateString() : '—'}
                </option>
              ))
          }
        </select>

        {selectedEvent && (
          <div style={{ marginTop: 14, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Registered', value: loadingAtt ? '…' : attendees.length, color: 'var(--accent)' },
              { label: 'Checked In',       value: loadingAtt ? '…' : checkedInCount,   color: 'var(--green)'  },
              { label: 'Not Yet',          value: loadingAtt ? '…' : attendees.length - checkedInCount, color: 'var(--t3)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '10px 20px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEventId && (
        <>
          <div className={s.toolbar}>
            <div className={s.searchBox}>
              <Search size={13} className={s.searchIcon} />
              <input
                className={s.searchInput}
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className={s.clearX} onClick={() => setSearch('')}><X size={12} /></button>}
            </div>
          </div>

          <div className={`${s.tableCard} glass`}>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th style={{ textAlign: 'center' }}>Checked In</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAtt ? (
                    <tr><td colSpan={4} className={s.emptyRow}>Loading attendees…</td></tr>
                  ) : error ? (
                    <tr><td colSpan={4} className={s.emptyRow} style={{ color: 'var(--red)' }}>{error}</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={s.emptyRow}>
                        {attendees.length === 0 ? 'No attendees yet for this event.' : 'No attendees match your search.'}
                      </td>
                    </tr>
                  ) : filtered.map((r, i) => {
                    const rid       = r._id || r.id || i
                    const name      = r.user?.name  || '—'
                    const email     = r.user?.email || '—'
                    const isChecked = !!r.checkedIn
                    const isLoading = checkingIn === rid
                    return (
                      <tr key={rid}>
                        <td>
                          <div className={s.userCell}>
                            <div className={s.avatar} style={{
                              fontSize: 11,
                              background: isChecked ? 'rgba(34,197,94,0.2)' : undefined,
                              color:      isChecked ? '#22c55e'              : undefined,
                            }}>
                              {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className={s.userName}>{name}</div>
                          </div>
                        </td>
                        <td className={s.tdEmail}>{email}</td>
                        <td className={s.tdJoined}>{formatDate(r.createdAt || r.registeredAt)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => !isChecked && handleCheckin(rid)}
                            disabled={isChecked || isLoading}
                            style={{
                              background:   isChecked ? 'rgba(34,197,94,0.15)' : 'var(--bg)',
                              color:        isChecked ? '#22c55e'               : 'var(--t3)',
                              border:       `1px solid ${isChecked ? '#22c55e44' : 'var(--border)'}`,
                              borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700,
                              cursor:       isChecked ? 'default' : 'pointer',
                              transition:   'all 0.2s', minWidth: 90,
                            }}
                          >
                            {isLoading ? '…' : isChecked ? '✓ Checked In' : 'Check In'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedEventId && (
        <div className={`${s.tableCard} glass`} style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Select an event above</div>
          <div style={{ fontSize: 13 }}>Choose an event to see its registered attendees and manage check-ins.</div>
        </div>
      )}
    </div>
  )
}
