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

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [search, setSearch]               = useState('')

  useEffect(() => {
    api.get('/admin/registrations')
      .then(res => {
        const raw = res.data.registrations || res.data || []
        setRegistrations(raw)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load registrations.')
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return registrations
    return registrations.filter(r => {
      const name  = r.user?.name  || r.studentName  || ''
      const email = r.user?.email || r.studentEmail || ''
      const evt   = r.event?.title || r.eventName   || ''
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || evt.toLowerCase().includes(q)
    })
  }, [registrations, search])

  const cancelled = registrations.filter(r => r.status === 'cancelled').length
  const active    = registrations.length - cancelled

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Registrations</h1>
          <p className={s.sub}>All student event registrations from the backend.</p>
        </div>
      </div>

      {/* Stats */}
      <div className={s.statsRow}>
        {[
          { label: 'Total',      value: loading ? '…' : registrations.length, color: 'var(--accent)' },
          { label: 'Registered', value: loading ? '…' : active,               color: 'var(--green)'  },
          { label: 'Cancelled',  value: loading ? '…' : cancelled,            color: '#ef4444'       },
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
          {search && <button className={s.clearX} onClick={() => setSearch('')}><X size={12} /></button>}
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
              {loading ? (
                <tr><td colSpan={5} className={s.emptyRow}>Loading registrations…</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className={s.emptyRow} style={{ color: 'var(--red)' }}>{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={s.emptyRow}>
                    {registrations.length === 0
                      ? 'No registrations yet.'
                      : 'No registrations match your search.'}
                  </td>
                </tr>
              ) : filtered.map((r, i) => {
                const name      = r.user?.name  || r.studentName  || '—'
                const email     = r.user?.email || r.studentEmail || '—'
                const eventName = r.event?.title || r.eventName   || '—'
                const isCancelled = r.status === 'cancelled'
                return (
                  <tr key={r._id || r.id || i}>
                    <td>
                      <div className={s.userCell}>
                        <div className={s.avatar} style={{ fontSize: 11 }}>
                          {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className={s.userName}>{name}</div>
                      </div>
                    </td>
                    <td className={s.tdEmail}>{email}</td>
                    <td className={s.tdDept}>{eventName}</td>
                    <td className={s.tdJoined}>{formatDate(r.createdAt || r.registeredAt)}</td>
                    <td>
                      <span style={{
                        background:   isCancelled ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                        color:        isCancelled ? '#ef4444'               : '#22c55e',
                        border:       `1px solid ${isCancelled ? '#ef444444' : '#22c55e44'}`,
                        borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                      }}>
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
