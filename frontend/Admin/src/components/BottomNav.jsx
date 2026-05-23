import React from 'react'
import { LayoutDashboard, CalendarDays, BarChart2, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import s from './BottomNav.module.css'

const ITEMS = [
  { id: 'dashboard', label: 'Home',      icon: LayoutDashboard },
  { id: 'events',    label: 'Events',    icon: CalendarDays },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'users',     label: 'Users',     icon: Users },
]

export default function BottomNav() {
  const { activePage, setActivePage } = useApp()

  return (
    <nav className={`${s.nav} glass`}>
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`${s.item} ${activePage === id ? s.active : ''}`}
          onClick={() => setActivePage(id)}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
