import React from 'react'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard, CalendarDays, BarChart2,
  Users, Settings, Zap, HelpCircle, Plus, LogOut,
  Crown, ShieldCheck, Pencil, Eye, ClipboardList, Lightbulb
} from 'lucide-react'
import s from './Sidebar.module.css'

const NAV_META = {
  dashboard:   { icon: LayoutDashboard, key: 'dashboard' },
  events:      { icon: CalendarDays,    key: 'events' },
  analytics:   { icon: BarChart2,       key: 'analytics' },
  users:       { icon: Users,           key: 'users' },
  suggestions: { icon: Lightbulb,       key: 'suggestions' },
  audit:       { icon: ClipboardList,   key: 'audit' },
  settings:    { icon: Settings,        key: 'settings' },
}

// Visual badge for each role
const ROLE_BADGE = {
  'Super Admin': { icon: Crown,        color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: 'Super Admin' },
  'Admin':       { icon: ShieldCheck,  color: '#10b981', bg: 'rgba(16,185,129,0.15)',  label: 'Admin' },
  'Organizer':   { icon: Pencil,       color: '#a855f7', bg: 'rgba(168,85,247,0.15)',  label: 'Organizer' },
  'Viewer':      { icon: Eye,          color: '#6b9aaa', bg: 'rgba(107,154,170,0.15)', label: 'Viewer' },
}

export default function Sidebar() {
  const { activePage, setActivePage, pendingEvents, pendingSuggestions, currentUser, logout, t, userCan } = useApp()
  const role = currentUser?.role || 'Viewer'
  const badge = ROLE_BADGE[role] || ROLE_BADGE['Viewer']
  const BadgeIcon = badge.icon

  return (
    <aside className={s.sidebar}>
      {/* Brand */}
      <div className={s.brand}>
        <div className={s.brandIcon}><Zap size={15} /></div>
        <div>
          <div className={s.brandName}>AASTU Events Hub</div>
          <div className={s.brandSub}>Central Management</div>
        </div>
      </div>

      {/* Nav — all 5 items always visible */}
      <nav className={s.nav}>
        {Object.entries(NAV_META).map(([id, { icon: Icon, key }]) => (
          <button
            key={id}
            className={`${s.item} ${activePage === id ? s.active : ''}`}
            onClick={() => setActivePage(id)}
          >
            <Icon size={17} />
            <span>{t(key)}</span>
            {id === 'events' && pendingEvents.length > 0 && (
              <span className={s.badge}>{pendingEvents.length}</span>
            )}
            {id === 'suggestions' && pendingSuggestions?.length > 0 && userCan('canApproveEvents') && (
              <span className={s.badge}>{pendingSuggestions.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className={s.bottom}>
        {userCan('canCreateEvents') && (
          <button className={s.createBtn} onClick={() => setActivePage('events')}>
            <Plus size={15} /> {t('createEvent')}
          </button>
        )}

        <button className={`${s.item} ${s.helpItem}`}>
          <HelpCircle size={17} /><span>{t('helpCenter')}</span>
        </button>

        {/* Profile + role badge */}
        <div className={s.profile}>
          <div className={s.avatar}>{currentUser?.avatar || 'AD'}</div>
          <div className={s.profileInfo}>
            <div className={s.adminName}>{currentUser?.name || 'Admin'}</div>
            {currentUser?.department && (
              <div className={s.adminDept}>{currentUser.department}</div>
            )}
            <div
              className={s.roleBadge}
              style={{ color: badge.color, background: badge.bg }}
            >
              <BadgeIcon size={9} />
              {badge.label}
            </div>
          </div>
        </div>

        <button className={s.logoutBtn} onClick={logout}>
          <LogOut size={14} /> {t('signOut')}
        </button>
      </div>
    </aside>
  )
}
