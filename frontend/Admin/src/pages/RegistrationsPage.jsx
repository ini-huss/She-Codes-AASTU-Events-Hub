import React, { useState, useMemo, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import s from './UsersPage.module.css' // reuse existing table styles

const REGISTRATIONS_KEY = 'aastu_student_registrations'

function loadRegistrations() {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function onRegistrationsChange(cb) {
  function handler(e) {
    if (e.key === REGISTRATIONS_KEY) cb()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
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

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState(() => loadRegistrations())
  const [search, setSearch] = useState('')

  // Reload when another tab writes to localStorage
  useEffect(() => {
    const unsub = onRegistrationsChange(() => setRegistrations(loadRegistrations()))
    return unsub
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter(r =>
      r.studentName?.toLowerCase().includes(q) ||
      r.studentEmail?.toLowerCase().includes(q) ||
      r.eventName?.toLowerCase().includes(q)
    )
  }, [registrations, search])

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Registrations</h1>
          <p className={s.sub}>All student event registrations from the student portal.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className={s.statsRow}>
        {[
          { label: 'Total',      value: registrations.length,                                                    color: 'var(--accent)' },
          { label: 'Registered', value: registrations.filter(r => r.status !== 'cancelled').length,              color: 'var(--green)'  },
          { label: 'Cancelled',  value: registrations.filter(r => r.status === 'cancelled').length,              color: '#ef4444'       },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${s.statBox} glass`}>
            <div className={s.statVal} style={{ color }}>{value}</div>
            <div className={s.statLbl}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={13} className={s.searchIcon} />
          <input
            className={s.searchInput}
            placeholder="Search by student name, email, or event name..."
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
                <th>Student Name</th>
                <th>Student Email</th>
                <th>Event Name</th>
                <th>Registration Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={s.emptyRow}>
                    {registrations.length === 0
                      ? 'No registrations yet. Students register from the student portal.'
                      : 'No registrations match your search.'}
                  </td>
                </tr>
              ) : filtered.map((r, i) => {
                const isCancelled = r.status === 'cancelled'
                return (
                  <tr key={r.id ?? i}>
                    <td>
                      <div className={s.userCell}>
                        <div className={s.avatar} style={{ fontSize: 11 }}>
                          {(r.studentName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className={s.userName}>{r.studentName || '—'}</div>
                      </div>
                    </td>
                    <td className={s.tdEmail}>{r.studentEmail || '—'}</td>
                    <td className={s.tdDept}>{r.eventName || '—'}</td>
                    <td className={s.tdJoined}>{formatDate(r.registeredAt)}</td>
                    <td>
                      <span
                        className={s.statusBadge}
                        style={{
                          background: isCancelled ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                          color:      isCancelled ? '#ef4444'               : '#22c55e',
                          border:     `1px solid ${isCancelled ? '#ef444444' : '#22c55e44'}`,
                          borderRadius: 20,
                          padding: '3px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {isCancelled ? 'Cancelled' : 'Registered'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
