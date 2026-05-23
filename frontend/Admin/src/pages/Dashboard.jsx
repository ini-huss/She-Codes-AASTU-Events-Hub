import React from 'react'
import { useApp } from '../context/AppContext'
import {
  Users, CalendarCheck, TrendingUp, TrendingDown,
  AlertTriangle, Clock, Activity, Wifi, ChevronRight,
  ShieldCheck, UserPlus, Crown
} from 'lucide-react'
import s from './Dashboard.module.css'

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, growth, positive, sub, icon: Icon, avatars }) {
  return (
    <div className={`${s.statCard} glass`}>
      <div className={s.statTop}>
        <span className={s.statLabel}>{label}</span>
        <Icon size={18} className={s.statIcon} />
      </div>
      <div className={s.statValue}>{value}</div>
      {avatars && avatars.length > 0 && (
        <div className={s.avatarStack}>
          {avatars.map((a, i) => (
            <div key={i} className={s.stackAvatar} style={{ zIndex: avatars.length - i }}>{a}</div>
          ))}
          <span className={s.avatarMore}>{avatars.length} organizer{avatars.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      <div className={s.statFooter}>
        {growth !== undefined && (
          <span className={`${s.growth} ${positive ? s.pos : s.neg}`}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {growth}
          </span>
        )}
        <span className={s.statSub}>{sub}</span>
      </div>
    </div>
  )
}

// ── System Health ─────────────────────────────────────────────────────────────
function SystemHealth() {
  const [latency] = React.useState(24)
  const [uptime]  = React.useState(99.9)

  return (
    <div className={`${s.healthCard} glass`}>
      <div className={s.healthHead}>
        <h3 className={s.cardTitle}>System Health</h3>
        <span className={s.allGood}><span className={s.pulseDot} /> All systems normal</span>
      </div>
      <div className={s.metrics}>
        {[
          { icon: Clock,    label: 'Server Latency', value: `${latency}ms`, bad: latency > 200 },
          { icon: Wifi,     label: 'API Status',     value: 'Stable',       bad: false },
          { icon: Activity, label: 'Uptime',         value: `${uptime}%`,   bad: uptime < 99 },
        ].map(({ icon: Icon, label, value, bad }) => (
          <div key={label} className={s.metric}>
            <Icon size={13} className={s.metricIcon} />
            <span className={s.metricLabel}>{label}</span>
            <span className={`${s.metricVal} ${bad ? s.bad : s.good}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Super Admin Dashboard ─────────────────────────────────────────────────────
function SuperAdminDashboard() {
  const { users, setActivePage } = useApp()

  const totalUsers    = users.length
  const activeAdmins  = users.filter(u => u.role === 'Admin' && u.status === 'Active').length
  const viewersWaiting = users.filter(u => u.role === 'Viewer').length
  const thisWeek      = users.filter(u => {
    // users joined this month as a proxy for "this week" since we store month/year
    const now = new Date()
    return u.joined === now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }).length

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Super Admin Overview</h1>
        <p className={s.sub}>Your role is to appoint Admins. All event operations are handled by Admins.</p>
      </div>

      {/* Super Admin specific stats */}
      <div className={s.statsGrid}>
        <StatCard label="Total Users"       value={totalUsers}      sub="registered accounts"  icon={Users} />
        <StatCard label="Active Admins"     value={activeAdmins}    sub="managing the platform" icon={ShieldCheck} />
        <StatCard label="Awaiting Promotion" value={viewersWaiting} sub="Viewers needing a role" icon={UserPlus} />
      </div>

      {/* Viewers waiting for role assignment */}
      <div className={s.midGrid}>
        <div className={`${s.pendingCard} glass`}>
          <div className={s.pendingHead}>
            <h3 className={s.cardTitle}>Users Awaiting Role Assignment</h3>
            <button className={s.viewAll} onClick={() => setActivePage('users')}>
              Manage Users <ChevronRight size={13} />
            </button>
          </div>
          {viewersWaiting === 0 ? (
            <div className={s.emptyPending}>All users have been assigned roles 🎉</div>
          ) : (
            <div className={s.pendingList}>
              {users.filter(u => u.role === 'Viewer').map(u => (
                <div key={u.id} className={s.pendingItem} onClick={() => setActivePage('users')}>
                  <div className={s.pendingLeft}>
                    <div className={s.pendingName}>{u.name}</div>
                    <div className={s.pendingMeta}>
                      <span>{u.department}</span>
                      <span className={s.dot}>·</span>
                      <span>Joined {u.joined}</span>
                    </div>
                  </div>
                  <span className={s.viewerTag}>VIEWER</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <SystemHealth />
      </div>
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const { totalRegistrations, activeEvents, pendingEvents, setActivePage, events, users } = useApp()

  // Real revenue from paid events only
  const revenue = events
    .filter(e => e.status === 'Approved' && e.price > 0)
    .reduce((sum, e) => sum + (e.registrations || 0) * (e.price || 0), 0)

  const approvedThisMonth = events.filter(e => {
    if (e.status !== 'Approved') return false
    const now = new Date()
    const monthStr = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return e.submittedAt?.includes(monthStr) || true // fallback: count all approved
  }).length

  const organizers = [...new Set(
    events.filter(e => e.status === 'Approved').map(e => e.organizer.slice(0, 2).toUpperCase())
  )].slice(0, 4)

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Overview</h1>
        <p className={s.sub}>Welcome back — here's what's happening at AASTU today.</p>
      </div>

      <div className={s.statsGrid}>
        <StatCard
          label="Total Registrations"
          value={totalRegistrations.toLocaleString()}
          sub="across all events"
          icon={Users}
        />
        <StatCard
          label="Revenue from Paid Events"
          value={revenue > 0 ? `ETB ${revenue.toLocaleString()}` : 'No paid events yet'}
          sub="from approved paid events"
          icon={CalendarCheck}
        />
        <StatCard
          label="Active Events"
          value={activeEvents}
          sub="approved and live"
          icon={CalendarCheck}
          avatars={organizers}
        />
      </div>

      <div className={s.midGrid}>
        <div className={`${s.pendingCard} glass`}>
          <div className={s.pendingHead}>
            <h3 className={s.cardTitle}>Pending Requests</h3>
            <button className={s.viewAll} onClick={() => setActivePage('events')}>
              View All <ChevronRight size={13} />
            </button>
          </div>
          {pendingEvents.length === 0 ? (
            <div className={s.emptyPending}>No pending requests 🎉</div>
          ) : (
            <div className={s.pendingList}>
              {pendingEvents.map(e => (
                <div key={e.id} className={s.pendingItem} onClick={() => setActivePage('events')}>
                  <div className={s.pendingLeft}>
                    <div className={s.pendingName}>{e.name}</div>
                    <div className={s.pendingMeta}>
                      <span>{e.organizer}</span>
                      <span className={s.dot}>·</span>
                      <Clock size={10} />
                      <span>{e.submittedAt}</span>
                    </div>
                  </div>
                  {e.urgent && (
                    <span className={s.urgentTag}>
                      <AlertTriangle size={10} /> URGENT
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <SystemHealth />
      </div>
    </div>
  )
}

// ── Main Dashboard — routes by role ───────────────────────────────────────────
export default function Dashboard() {
  const { currentUser } = useApp()

  if (currentUser?.role === 'Super Admin') return <SuperAdminDashboard />
  return <AdminDashboard />
}
