import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import EventsPage from './pages/EventsPage'
import Analytics from './pages/Analytics'
import UsersPage from './pages/UsersPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import styles from './App.module.css'

import AuditPage from './pages/AuditPage'
import SuggestionsPage from './pages/SuggestionsPage'
import RegistrationsPage from './pages/RegistrationsPage'
import AttendeesPage from './pages/AttendeesPage'

const PAGES = {
  dashboard:     Dashboard,
  events:        EventsPage,
  analytics:     Analytics,
  users:         UsersPage,
  suggestions:   SuggestionsPage,
  audit:         AuditPage,
  registrations: RegistrationsPage,
  attendees:     AttendeesPage,
  settings:      SettingsPage,
}

function Layout() {
  const { activePage, currentUser } = useApp()

  // Not logged in → show the Admin's own login page
  if (!currentUser) return <AuthPage />

  const Page = PAGES[activePage] || Dashboard

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          <Page />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  )
}
