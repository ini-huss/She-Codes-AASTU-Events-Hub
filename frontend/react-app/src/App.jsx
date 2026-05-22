import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar        from "./components/Navbar"
import Footer        from "./components/Footer"

import Home           from "./pages/Home"
import Login          from "./pages/Login"
import Register       from "./pages/Register"
import EventListing   from "./pages/EventListing"
import EventDetail    from "./pages/EventDetail"
import Dashboard      from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"

const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #0a0d14; color: #f0f2f8; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0d14; }
  ::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #7c5cfc; }
  input, select, textarea, button { font-family: inherit; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
`

function Layout({ children }) {
  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column" }}>
      <Navbar />
      <main style={{ flex:1 }}>{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <>
      <style>{GLOBAL}</style>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"        element={<Layout><Home /></Layout>} />
            <Route path="/login"   element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events"  element={<Layout><EventListing /></Layout>} />
            <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />

            {/* Student protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />

            {/* Admin protected */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}
