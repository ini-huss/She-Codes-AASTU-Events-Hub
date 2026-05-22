import React, { useState, useMemo, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import s from './UsersPage.module.css' // reuse existing table styles

const REGISTRATIONS_KEY = 'aastu_student_registrations'
const PUBLIC_KEY        = 'aastu_public_events'
const CHECKINS_KEY      = 'aastu_admin_checkins'

function loadRegistrations() {
  try { return JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '[]') } catch { return [] }
}

function loadEvents() {
  try {
    // Try admin events first (includes all statuses), fall back to public
    const adminRaw = localStorage.getItem('aastu_events')
    if (adminRaw) {
      const all = JSON.parse(adminRaw)
      return all.filter(e => e.status === 'Approved')
    }
    return JSON.parse(localStorage.getItem(PUBLIC_KEY) || '[]')
  } catch { return [] }
}

function loadCheckins() {
  try { return JSON.parse(localStorage.getItem(CHECKINS_KEY) || '{}') } catch { return {} }
}

function saveCheckins(checkins) {
  try { localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins)) } catch {}
}

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
  const [events, setEvents]             = useState(() => loadEvents())
  const [registrations, setRegistrations] = useState(() => loadRegistrations())
  const [checkins, setCheckins]         = useState(() => loadCheckins())
  const [selectedEventId, setSelected]  = useState('')
  const [search, setSearch]             = useState('')

  // Reload when another tab writes to localStorage
  useEffect(() => {
    function sync() {
      setEvents(loadEvents())
      setRegistrations(loadRegistrations())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const selectedEvent = events.find(e => String(e.id) === String(selectedEventId))

  // All registrations for the selected event (not cancelled)
  const eventAttendees = useMemo(() => {
    if (!selectedEventId) return []
    return registrations.filter(
      r => String(r.eventId) === String(selectedEventId) && r.status !== 'cancelled'
    )
  }, [registrations, selectedEventId])

  // Apply search filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return eventAttendees
    return eventAttendees.filter(r =>
      r.studentName?.toLowerCase().includes(q) ||
      r.studentEmail?.toLowerCase().includes(q)
    )
  }, [eventAttendees, search])

  function toggleCheckin(registrationId) {
    const key = String(registrationId)
    const updated = { ...checkins, [key]: !checkins[key] }
    setCheckins(updated)
    saveCheckins(updated)
  }

  const checkedInCount = eventAttendees.filter(r => checkins[String(r.id)]).length

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
          {events.map(e => (
            <option key={e.id} value={String(e.id)}>
              {e.name} — {e.date}
            </option>
          ))}
        </select>

        {selectedEvent && (
          <div style={{ marginTop: 14, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Registered', value: eventAttendees.length,  color: 'var(--accent)' },
              { label: 'Checked In',       value: checkedInCount,          color: 'var(--green)'  },
              { label: 'Not Yet',          value: eventAttendees.length - checkedInCount, color: 'var(--t3)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '10px 20px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Only show table once an event is selected */}
      {selectedEventId && (
        <>
          {/* Search */}
          <div className={s.toolbar}>
            <div className={s.searchBox}>
              <Search size={13} className={s.searchIcon} />
              <input
                className={s.searchInput}
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className={s.clearX} onClick={() => setSearch('')}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={s.emptyRow}>
                        {eventAttendees.length === 0
                          ? 'No attendees yet for this event.'
                          : 'No attendees match your search.'}
                      </td>
                    </tr>
                  ) : filtered.map((r, i) => {
                    const rid = String(r.id ?? i)
                    const isChecked = !!checkins[rid]
                    return (
                      <tr key={rid}>
                        <td>
                          <div className={s.userCell}>
                            <div
                              className={s.avatar}
                              style={{
                                fontSize: 11,
                                background: isChecked ? 'rgba(34,197,94,0.2)' : undefined,
                                color:      isChecked ? '#22c55e'              : undefined,
                              }}
                            >
                              {(r.studentName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className={s.userName}>{r.studentName || '—'}</div>
                          </div>
                        </td>
                        <td className={s.tdEmail}>{r.studentEmail || '—'}</td>
                        <td className={s.tdJoined}>{formatDate(r.registeredAt)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => toggleCheckin(rid)}
                            style={{
                              background:   isChecked ? 'rgba(34,197,94,0.15)' : 'var(--bg)',
                              color:        isChecked ? '#22c55e'               : 'var(--t3)',
                              border:       `1px solid ${isChecked ? '#22c55e44' : 'var(--border)'}`,
                              borderRadius: 8,
                              padding:      '5px 14px',
                              fontSize:     12,
                              fontWeight:   700,
                              cursor:       'pointer',
                              transition:   'all 0.2s',
                              minWidth:     90,
                            }}
                          >
                            {isChecked ? '✓ Checked In' : 'Check In'}
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

      {/* Prompt when nothing selected */}
      {!selectedEventId && (
        <div className={`${s.tableCard} glass`} style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--t3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Select an event above</div>
          <div style={{ fontSize: 13 }}>Choose an approved event to see its registered attendees and manage check-ins.</div>
        </div>
      )}
    </div>
  )
}
