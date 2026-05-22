import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { COLORS } from './components/constants'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage      from './pages/LandingPage'
import StudentHomePage  from './pages/StudentHomePage'
import AuthPage         from './pages/AuthPage'
import EventsPage       from './pages/EventsPage'
import EventDetailPage  from './pages/EventDetailPage'
import DashboardPage    from './pages/DashboardPage'
import MyEventsPage     from './pages/MyEventsPage'

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

// ── Session helpers ───────────────────────────────────────────────────────────
export function getSession() {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || 'null')
    const token = sessionStorage.getItem('token')
    return token && user ? { user, token } : null
  } catch { return null }
}

export function saveSession(token, user) {
  sessionStorage.setItem('token', token)
  sessionStorage.setItem('user', JSON.stringify(user))
}

export function clearSession() {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
}

// ── Protected route — redirects to / if not logged in ────────────────────────
function RequireAuth({ children }) {
  const session = getSession()
  if (!session) return <Navigate to="/" replace />
  return children
}

// ── Layout wrapper with Navbar + Footer ──────────────────────────────────────
function Layout({ children, hideFooter }) {
  const navigate = useNavigate()
  const session  = getSession()
  const student  = session?.user || null

  function handleLogout() {
    clearSession()
    navigate('/')
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        student={student}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Routes>
        {/* Public */}
        <Route path="/" element={
          <Layout>
            <LandingPage />
          </Layout>
        } />
        <Route path="/auth" element={<AuthPage />} />

        {/* Student protected */}
        <Route path="/home" element={
          <RequireAuth>
            <Layout>
              <StudentHomePage />
            </Layout>
          </RequireAuth>
        } />
        <Route path="/events" element={
          <RequireAuth>
            <Layout>
              <EventsPage />
            </Layout>
          </RequireAuth>
        } />
        <Route path="/events/:id" element={
          <RequireAuth>
            <Layout hideFooter>
              <EventDetailPage />
            </Layout>
          </RequireAuth>
        } />
        <Route path="/my-events" element={
          <RequireAuth>
            <Layout>
              <MyEventsPage />
            </Layout>
          </RequireAuth>
        } />
        <Route path="/dashboard" element={
          <RequireAuth>
            <Layout>
              <DashboardPage />
            </Layout>
          </RequireAuth>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
