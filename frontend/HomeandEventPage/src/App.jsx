import { useEffect, useState, useCallback } from "react"
import { COLORS } from "./components/constants"
import {
  getPublicEvents, getStudentSession, saveStudentSession,
  clearStudentSession, checkUpcomingReminders, onEventsChange,
  getStudentNotifs, markNotifsRead, getMyRegistrations,
  registerForEvent, cancelRegistration,
  pushStudentNotif,
} from "./bridge"

import LandingPage   from "./pages/LandingPage"
import EventsPage    from "./pages/EventsPage"
import DashboardPage from "./pages/DashboardPage"
import AuthModal     from "./pages/AuthModal"
import Navbar        from "./components/Navbar"
import Footer        from "./components/Footer"

// ── Global styles ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${COLORS.accent}; }
  input, select, textarea, button { font-family: inherit; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .fade-in { animation: fadeIn .4s ease both; }
`

export default function App() {
  const [page, setPage]               = useState("home")
  const [student, setStudent]         = useState(() => getStudentSession())
  const [liveEvents, setLiveEvents]   = useState(() => getPublicEvents())
  const [authModal, setAuthModal]     = useState(null) // null | 'login' | 'signup'
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [notifs, setNotifs]           = useState([])
  const [myRegs, setMyRegs]           = useState([])

  // ── Load live events & keep in sync ────────────────────────────────────────
  useEffect(() => {
    const unsub = onEventsChange(setLiveEvents)
    const poll  = setInterval(() => setLiveEvents(getPublicEvents()), 8000)
    return () => { unsub(); clearInterval(poll) }
  }, [])

  // ── On student login: load notifs, registrations, check reminders ──────────
  useEffect(() => {
    if (!student) { setNotifs([]); setMyRegs([]); return }
    setNotifs(getStudentNotifs(student.id))
    setMyRegs(getMyRegistrations(student.id))
    checkUpcomingReminders(student.id)
    // Re-check notifs every 30s
    const t = setInterval(() => {
      setNotifs(getStudentNotifs(student.id))
      setMyRegs(getMyRegistrations(student.id))
      checkUpcomingReminders(student.id)
    }, 30000)
    return () => clearInterval(t)
  }, [student])

  // ── Auth ────────────────────────────────────────────────────────────────────
  function handleSignup(data) {
    const s = { id: Date.now(), ...data, joinedAt: new Date().toISOString() }
    saveStudentSession(s)
    setStudent(s)
    setAuthModal(null)
    pushStudentNotif(s.id, {
      type: 'welcome',
      title: `Welcome, ${s.name}! 🎉`,
      message: 'Your AASTU Events Hub account is ready. Browse events and register for ones you love!',
    })
    setNotifs(getStudentNotifs(s.id))
  }

  function handleLogin(data) {
    // In this localStorage-based system, login just restores/creates the session
    const s = { id: data.id || Date.now(), ...data }
    saveStudentSession(s)
    setStudent(s)
    setAuthModal(null)
    checkUpcomingReminders(s.id)
    setNotifs(getStudentNotifs(s.id))
    setMyRegs(getMyRegistrations(s.id))
  }

  function handleLogout() {
    clearStudentSession()
    setStudent(null)
    setPage("home")
  }

  // ── Registration ────────────────────────────────────────────────────────────
  function handleRegister(event) {
    if (!student) { setAuthModal('signup'); return }
    const result = registerForEvent(event, student)
    if (result.ok) {
      setMyRegs(getMyRegistrations(student.id))
      setNotifs(getStudentNotifs(student.id))
      setLiveEvents(prev =>
        prev.map(e => e.id === event.id ? { ...e, registrations: (e.registrations || 0) + 1 } : e)
      )
    }
    return result
  }

  function handleCancel(eventId) {
    if (!student) return
    cancelRegistration(eventId, student.id)
    setMyRegs(getMyRegistrations(student.id))
    setLiveEvents(prev =>
      prev.map(e => e.id === eventId ? { ...e, registrations: Math.max(0, (e.registrations || 1) - 1) } : e)
    )
  }

  function handleMarkNotifsRead() {
    if (!student) return
    markNotifsRead(student.id)
    setNotifs(getStudentNotifs(student.id))
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goTo = useCallback((p, extra) => {
    setPage(p)
    if (extra?.event) setSelectedEvent(extra.event)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar
          page={page}
          student={student}
          notifs={notifs}
          unreadCount={unreadCount}
          onMarkRead={handleMarkNotifsRead}
          onGoTo={goTo}
          onLogin={() => setAuthModal('login')}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1 }}>
          {page === "home" && (
            <LandingPage
              liveEvents={liveEvents}
              student={student}
              onGoTo={goTo}
              onGetStarted={() => setAuthModal(student ? null : 'signup')}
            />
          )}
          {page === "events" && (
            <EventsPage
              liveEvents={liveEvents}
              student={student}
              myRegs={myRegs}
              selectedEvent={selectedEvent}
              onRegister={handleRegister}
              onCancel={handleCancel}
              onLogin={() => setAuthModal('login')}
            />
          )}
          {page === "dashboard" && (
            student
              ? <DashboardPage
                  student={student}
                  liveEvents={liveEvents}
                  myRegs={myRegs}
                  notifs={notifs}
                  onMarkRead={handleMarkNotifsRead}
                  onGoTo={goTo}
                  onCancel={handleCancel}
                />
              : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
                  <div style={{ fontSize: 48 }}>🔒</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>Sign in to view your dashboard</div>
                  <button onClick={() => setAuthModal('login')} style={{ background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Sign In
                  </button>
                </div>
          )}
        </main>

        <Footer onGoTo={goTo} />

        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onLogin={handleLogin}
            onSignup={handleSignup}
            onSwitch={m => setAuthModal(m)}
          />
        )}
      </div>
    </>
  )
}
