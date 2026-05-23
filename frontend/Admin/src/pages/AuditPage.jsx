import React, { useState, useMemo } from 'react'
import { getAuditLog, SEVERITY, AUDIT } from '../utils/auditLog'
import { useApp } from '../context/AppContext'
import { Shield, Search, X, Download, ChevronDown, ChevronRight } from 'lucide-react'
import s from './AuditPage.module.css'

const SEV_STYLE = {
  [SEVERITY.INFO]:    { cls: s.sevInfo,    label: 'INFO' },
  [SEVERITY.WARNING]: { cls: s.sevWarning, label: 'WARN' },
  [SEVERITY.DANGER]:  { cls: s.sevDanger,  label: 'HIGH' },
}

function formatDateGroup(isoString) {
  const d = new Date(isoString)
  const today     = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function AuditPage() {
  const { currentUser } = useApp()
  const [search, setSearch]        = useState('')
  const [sevFilter, setSev]        = useState('all')
  const [actionFilter, setAct]     = useState('all')
  const [collapsed, setCollapsed]  = useState({})   // { dateLabel: true/false }

  // Role-filtered log
  const log = useMemo(() => {
    const full = getAuditLog()
    if (!currentUser) return []
    if (currentUser.role === 'Super Admin') return full
    if (currentUser.role === 'Admin') {
      return full.filter(e => ![AUDIT.LOGIN, AUDIT.LOGOUT, AUDIT.SIGNUP].includes(e.action))
    }
    return []
  }, [currentUser])

  // Search + severity + action filter
  const filtered = useMemo(() => log.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      e.actor?.toLowerCase().includes(q) ||
      e.detail?.toLowerCase().includes(q) ||
      e.action?.toLowerCase().includes(q)
    const matchSev = sevFilter === 'all' || e.severity === sevFilter
    const matchAct = actionFilter === 'all' || e.action === actionFilter
    return matchSearch && matchSev && matchAct
  }), [log, search, sevFilter, actionFilter])

  // Group by date
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(entry => {
      const label = formatDateGroup(entry.timestamp)
      if (!groups[label]) groups[label] = []
      groups[label].push(entry)
    })
    return groups
  }, [filtered])

  const uniqueActions = [...new Set(log.map(e => e.action))].sort()

  function toggleGroup(label) {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))
  }

  function exportCSV() {
    const headers = ['Timestamp', 'Action', 'Severity', 'Actor', 'Detail']
    const rows = filtered.map(e => [
      e.timestamp, e.action, e.severity,
      `"${e.actor || ''}"`, `"${(e.detail || '').replace(/"/g, "'")}"`
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `aastu_audit_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Block Organizers and Viewers
  if (!currentUser || ['Organizer', 'Viewer'].includes(currentUser.role)) {
    return (
      <div className={s.denied}>
        <Shield size={40} />
        <h2>Access Restricted</h2>
        <p>The Audit Log is only available to Admins and Super Admins.</p>
      </div>
    )
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Audit Log</h1>
          <p className={s.sub}>
            {currentUser.role === 'Super Admin'
              ? 'Complete immutable record of all platform actions including logins. Cannot be deleted or modified.'
              : 'Record of all event and user management actions. Login/logout entries are visible to Super Admin only.'}
          </p>
        </div>
        <button className={s.exportBtn} onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className={s.statsRow}>
        {[
          { label: 'Total Entries', value: log.length,                                              color: 'var(--accent)' },
          { label: 'High Risk',     value: log.filter(e => e.severity === SEVERITY.DANGER).length,  color: 'var(--red)' },
          { label: 'Warnings',      value: log.filter(e => e.severity === SEVERITY.WARNING).length, color: 'var(--yellow)' },
          { label: 'Info',          value: log.filter(e => e.severity === SEVERITY.INFO).length,    color: 'var(--green)' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${s.statBox} glass`}>
            <div className={s.statVal} style={{ color }}>{value}</div>
            <div className={s.statLbl}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <Search size={13} className={s.searchIcon} />
          <input
            className={s.searchInput}
            placeholder="Search by actor, action, or detail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={s.clearX} onClick={() => setSearch('')}><X size={12} /></button>}
        </div>
        <select className={s.filterSelect} value={sevFilter} onChange={e => setSev(e.target.value)}>
          <option value="all">All Severities</option>
          <option value={SEVERITY.DANGER}>High Risk</option>
          <option value={SEVERITY.WARNING}>Warning</option>
          <option value={SEVERITY.INFO}>Info</option>
        </select>
        <select className={s.filterSelect} value={actionFilter} onChange={e => setAct(e.target.value)}>
          <option value="all">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Grouped by date */}
      {filtered.length === 0 ? (
        <div className={`${s.tableCard} glass`}>
          <div className={s.empty}>
            {log.length === 0
              ? 'No audit entries yet. Actions will be recorded here as admins use the platform.'
              : 'No entries match your filters.'}
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([dateLabel, entries]) => (
          <div key={dateLabel} className={`${s.dateGroup} glass`}>
            {/* Date group header — click to collapse */}
            <button className={s.dateHeader} onClick={() => toggleGroup(dateLabel)}>
              <div className={s.dateHeaderLeft}>
                {collapsed[dateLabel]
                  ? <ChevronRight size={14} className={s.chevron} />
                  : <ChevronDown  size={14} className={s.chevron} />
                }
                <span className={s.dateLabel}>{dateLabel}</span>
                <span className={s.dateCount}>{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}</span>
              </div>
              {/* Show high-risk count if any */}
              {entries.some(e => e.severity === SEVERITY.DANGER) && (
                <span className={s.groupDanger}>
                  {entries.filter(e => e.severity === SEVERITY.DANGER).length} high risk
                </span>
              )}
            </button>

            {/* Entries table — hidden when collapsed */}
            {!collapsed[dateLabel] && (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Severity</th>
                      <th>Action</th>
                      <th>Actor</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => {
                      const sev = SEV_STYLE[entry.severity] || SEV_STYLE[SEVERITY.INFO]
                      return (
                        <tr key={entry.id}>
                          <td className={s.tdTime}>
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </td>
                          <td>
                            <span className={`${s.sevBadge} ${sev.cls}`}>{sev.label}</span>
                          </td>
                          <td className={s.tdAction}>{entry.action}</td>
                          <td className={s.tdActor}>{entry.actor}</td>
                          <td className={s.tdDetail}>{entry.detail}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
