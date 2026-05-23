import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, Zap, Users, Activity } from 'lucide-react'
import { attendanceData, categoryData, engagementLog, peakAlerts } from '../data/store'
import { useApp } from '../context/AppContext'
import s from './Analytics.module.css'

function Skel({ h }) {
  return <div className="skeleton" style={{ height: h, width: '100%', marginTop: 8 }} />
}

function BarTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={s.tip}>
      <div className={s.tipLabel}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontSize: 12 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

function EmptyChart({ message }) {
  return (
    <div className={s.emptyChart}>
      <div className={s.emptyChartIcon}>📊</div>
      <div className={s.emptyChartText}>{message}</div>
    </div>
  )
}

export default function Analytics() {
  const { events, t } = useApp()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Build real stats from actual events
  const approvedEvents  = events.filter(e => e.status === 'Approved')
  const totalRegs       = events.reduce((s, e) => s + (e.registrations || 0), 0)
  const hasEvents       = events.length > 0

  // Build real category distribution from actual events
  const realCategoryData = [
    { name: 'Tech & STEM',    value: events.filter(e => e.category === 'Tech').length,   color: '#9b7de0' },
    { name: 'Arts & Culture', value: events.filter(e => e.category === 'Arts').length,   color: '#a855f7' },
    { name: 'Social',         value: events.filter(e => e.category === 'Social').length, color: '#f59e0b' },
  ]
  const totalCatEvents = realCategoryData.reduce((s, c) => s + c.value, 0)
  const categoryWithPct = realCategoryData.map(c => ({
    ...c,
    value: totalCatEvents > 0 ? Math.round((c.value / totalCatEvents) * 100) : 0,
  }))
  const hasCategoryData = totalCatEvents > 0

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{t('analyticsTitle')}</h1>
        <p className={s.sub}>{t('analyticsSub')}</p>
      </div>

      {/* Growth banner */}
      <div className={`${s.banner} glass`}>
        <div className={s.bannerLeft}>
          <TrendingUp size={30} className={s.bannerIcon} />
          <div>
            <div className={s.growthNum}>{hasEvents ? `${approvedEvents.length} approved` : 'No events yet'}</div>
            <div className={s.growthLabel}>
              {hasEvents
                ? `${totalRegs.toLocaleString()} total registrations across ${events.length} events`
                : 'Add events to start seeing analytics data here'}
            </div>
          </div>
        </div>
        <div className={s.bannerStats}>
          <div className={s.bStat}><Users size={13} /><span>{totalRegs.toLocaleString()} registrations</span></div>
          <div className={s.bStat}><Activity size={13} /><span>{approvedEvents.length} approved events</span></div>
          <div className={s.bStat}><Zap size={13} /><span>{events.filter(e => e.status === 'Pending').length} pending review</span></div>
        </div>
      </div>

      {/* Charts row */}
      <div className={s.chartsRow}>
        <div className={`${s.chartCard} glass`}>
          <h2 className={s.chartTitle}>Attendance Velocity</h2>
          <p className={s.chartSub}>Monthly participation by category</p>
          {loading ? <Skel h={230} /> : hasEvents ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={attendanceData} barSize={9} barGap={3}>
                <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(124,92,191,0.06)' }} />
                <Legend formatter={v => <span style={{ color: '#8892a4', fontSize: 11 }}>{v}</span>} />
                <Bar dataKey="Tech"   fill="#7c5cbf" radius={[4,4,0,0]} />
                <Bar dataKey="Arts"   fill="#a855f7" radius={[4,4,0,0]} />
                <Bar dataKey="Social" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="No events yet — attendance data will appear here once events are added." />}
        </div>

        <div className={`${s.chartCard} glass`}>
          <h2 className={s.chartTitle}>Topic Interest</h2>
          <p className={s.chartSub}>Distribution by event category</p>
          {loading ? <Skel h={230} /> : hasCategoryData ? (
            <>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={categoryWithPct}
                    cx="50%" cy="50%"
                    innerRadius={58} outerRadius={88}
                    paddingAngle={4} dataKey="value"
                  >
                    {categoryWithPct.map((entry, i) => (
                      <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 7px ${entry.color}55)` }} />
                    ))}
                  </Pie>
                  <Legend formatter={v => <span style={{ color: '#8892a4', fontSize: 11 }}>{v}</span>} />
                  <Tooltip
                    formatter={v => [`${v}%`]}
                    contentStyle={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={s.donutCenter}>
                <div className={s.donutNum}>{categoryWithPct[0].value}%</div>
                <div className={s.donutLabel}>Tech & STEM</div>
              </div>
            </>
          ) : <EmptyChart message="Add events to see category distribution." />}
        </div>
      </div>

      {/* Bottom row */}
      <div className={s.bottomRow}>
        {/* Engagement log */}
        <div className={`${s.logCard} glass`}>
          <h2 className={s.chartTitle}>Recent Engagement Log</h2>
          {engagementLog.length === 0 ? (
            <div className={s.emptyLog}>No engagement activity yet. Data will appear here once students start registering for events.</div>
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Student</th><th>Action</th><th>Event</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {engagementLog.map(row => (
                    <tr key={row.id}>
                      <td className={s.tdStudent}>{row.student}</td>
                      <td className={s.tdAction}>{row.action}</td>
                      <td className={s.tdEvent}>{row.event}</td>
                      <td className={s.tdTime}>{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Peak alerts */}
        <div className={`${s.alertCard} glass`}>
          <h2 className={s.chartTitle}>Peak Activity Alerts</h2>
          <p className={s.chartSub}>AI-suggested optimal announcement windows</p>
          <div className={s.alerts}>
            {peakAlerts.map(a => (
              <div key={a.id} className={s.alertItem}>
                <div className={s.alertWindow}><Zap size={12} className={s.alertIcon} />{a.window}</div>
                <div className={s.alertReason}>{a.rationale}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
