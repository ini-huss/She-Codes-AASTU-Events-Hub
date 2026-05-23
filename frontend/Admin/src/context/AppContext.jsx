import React, { createContext, useContext, useState, useEffect } from 'react'
import { initialSuggestions, notifications as initNotifs } from '../data/store'
import { T } from '../data/translations'
import { can, ROLE_LEVEL, assignableRoles } from '../data/roles'
import { writeAuditEntry, AUDIT, severityOf } from '../utils/auditLog'
import api from '../api'

const AppContext = createContext(null)

// ── localStorage helpers (kept for UI preferences only) ──────────────────────
function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback }
  catch { return fallback }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function makeNotif(text) {
  return { id: Date.now() + Math.random(), text, time: 'Just now', read: false }
}

// ── Normalise a backend event to the shape the UI expects ─────────────────────
function normaliseEvent(e) {
  return {
    ...e,
    id:           e._id || e.id,
    name:         e.title || e.name,
    venue:        e.location || e.venue,
    registrations: e.registeredCount || e.registrations || 0,
    // Map backend status to UI status
    status: (() => {
      const s = (e.status || '').toLowerCase()
      if (s === 'published') return 'Approved'
      if (s === 'draft')     return 'Pending'
      if (s === 'cancelled') return 'Rejected'
      // Already in UI format
      if (['Approved','Pending','Rejected'].includes(e.status)) return e.status
      return 'Pending'
    })(),
  }
}

// ── Normalise a backend user to the shape the UI expects ─────────────────────
function normaliseUser(u) {
  return {
    ...u,
    id:         u._id || u.id,
    role:       u.role === 'admin' ? 'Admin' : u.role === 'user' ? 'Viewer' : (u.role || 'Viewer'),
    status:     u.isActive === false ? 'Inactive' : 'Active',
    department: u.department || '',
    joined:     u.createdAt
      ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '—',
    avatar:     u.name ? u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U',
  }
}

export function AppProvider({ children }) {
  const [events, setEventsRaw]           = useState([])
  const [users, setUsersRaw]             = useState([])
  const [suggestions, setSuggestionsRaw] = useState(() => load('aastu_suggestions', initialSuggestions))
  const [notifications, setNotifsRaw]    = useState(() => load('aastu_notifs', initNotifs))
  const [inboxes, setInboxesRaw]         = useState(() => load('aastu_inboxes', {}))
  const [activePage, setActivePage]      = useState('dashboard')
  const [currentUser, setCurrentUser]    = useState(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem('user') || 'null')
      const t = sessionStorage.getItem('token')
      if (u && t && (u.role || '').toLowerCase() === 'admin') return normaliseUser(u)
    } catch {}
    return null
  })
  const [authError, setAuthError]        = useState('')
  const [authLoading, setAuthLoading]    = useState(false)
  const [accentColor, setAccentColorState] = useState(() => load('aastu_accent', '#7c5cbf'))
  const [language, setLanguageState]     = useState(() => load('aastu_lang', 'English'))

  // ── Load events from backend on mount ────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return
    api.get('/events').then(res => {
      const raw = res.data.events || res.data || []
      setEventsRaw(raw.map(normaliseEvent))
    }).catch(() => {})
  }, [currentUser])

  // ── Load users from backend on mount ─────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return
    api.get('/admin/users').then(res => {
      const raw = res.data.users || res.data || []
      setUsersRaw(raw.map(normaliseUser))
    }).catch(() => {})
  }, [currentUser])

  // ── Persist helpers (UI prefs only) ──────────────────────────────────────
  function setEvents(fn) { setEventsRaw(prev => typeof fn === 'function' ? fn(prev) : fn) }
  function setUsers(fn)  { setUsersRaw(prev  => typeof fn === 'function' ? fn(prev) : fn) }
  function setSuggestions(fn) { setSuggestionsRaw(prev => { const n = typeof fn === 'function' ? fn(prev) : fn; save('aastu_suggestions', n); return n }) }
  function setNotifs(fn) { setNotifsRaw(prev => { const n = typeof fn === 'function' ? fn(prev) : fn; save('aastu_notifs', n); return n }) }
  function setInboxes(fn){ setInboxesRaw(prev => { const n = typeof fn === 'function' ? fn(prev) : fn; save('aastu_inboxes', n); return n }) }

  // ── Apply accent color ────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', accentColor)
    const hex = accentColor.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    root.style.setProperty('--accent-dim',    `rgba(${r},${g},${b},0.15)`)
    root.style.setProperty('--accent-glow',   `0 0 22px rgba(${r},${g},${b},0.35)`)
    root.style.setProperty('--accent-glow-s', `0 0 10px rgba(${r},${g},${b},0.25)`)
    save('aastu_accent', accentColor)
  }, [accentColor])

  useEffect(() => { save('aastu_lang', language) }, [language])

  const t = (key) => T[language]?.[key] ?? T['English'][key] ?? key

  // ── Audit log helper ──────────────────────────────────────────────────────
  function audit(action, details = {}) {
    writeAuditEntry({
      action,
      severity: severityOf(action),
      actor:    currentUser ? `${currentUser.name} (${currentUser.role})` : 'System',
      actorId:  currentUser?.id,
      ...details,
    })
  }

  function pushNotif(text) { setNotifs(prev => [makeNotif(text), ...prev]) }

  function pushInbox(userId, text, type = 'info') {
    setInboxes(prev => ({
      ...prev,
      [userId]: [
        { id: Date.now() + Math.random(), text, time: new Date().toLocaleString(), read: false, type },
        ...(prev[userId] || []),
      ],
    }))
  }

  function markInboxRead(userId) {
    setInboxes(prev => ({
      ...prev,
      [userId]: (prev[userId] || []).map(m => ({ ...m, read: true })),
    }))
  }

  // ── Auth — real backend calls ─────────────────────────────────────────────
  async function login(email, password) {
    setAuthLoading(true)
    setAuthError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const role = (data.user?.role || '').toLowerCase()
      if (role !== 'admin') {
        setAuthError('Access denied. Admin accounts only.')
        return false
      }
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('user', JSON.stringify(data.user))
      const safeUser = normaliseUser(data.user)
      setCurrentUser(safeUser)
      writeAuditEntry({
        action:   AUDIT.LOGIN,
        severity: severityOf(AUDIT.LOGIN),
        actor:    `${safeUser.name} (${safeUser.role})`,
        actorId:  safeUser.id,
        detail:   'Logged in via backend API',
      })
      return true
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid email or password.')
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  async function signup(name, email, password, department) {
    setAuthLoading(true)
    setAuthError('')
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role: 'admin', department })
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('user', JSON.stringify(data.user))
      const safeUser = normaliseUser(data.user)
      setCurrentUser(safeUser)
      writeAuditEntry({
        action:   AUDIT.SIGNUP,
        severity: severityOf(AUDIT.SIGNUP),
        actor:    `${safeUser.name} (${safeUser.role})`,
        actorId:  safeUser.id,
        detail:   `New admin account registered. Department: ${department}`,
      })
      return true
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed.')
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  function logout() {
    audit(AUDIT.LOGOUT, { detail: 'User logged out' })
    setCurrentUser(null)
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setActivePage('dashboard')
  }

  const userCan = (permission) => can(currentUser, permission)

  // ── Suggestion actions ────────────────────────────────────────────────────
  function submitSuggestion(suggestion) {
    const newSug = {
      ...suggestion, id: Date.now(), status: 'Pending',
      submittedBy: currentUser.name, submittedEmail: currentUser.email,
      submittedAt: new Date().toLocaleString(), adminNote: '',
    }
    setSuggestions(prev => [newSug, ...prev])
    pushNotif(`📋 New event suggestion "${suggestion.name}" from ${currentUser.name}.`)
  }

  function convertSuggestion(id, extraFields) {
    if (!userCan('canCreateEvents')) return
    const sug = suggestions.find(s => s.id === id)
    if (!sug) return
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'Converted' } : s))
    const newEvent = { ...sug, ...extraFields, id: Date.now(), status: 'Pending', organizerEmail: sug.submittedEmail, submittedAt: new Date().toLocaleString() }
    setEvents(prev => [newEvent, ...prev])
    pushNotif(`Event "${sug.name}" converted from suggestion by ${currentUser.name}.`)
  }

  function declineSuggestion(id, reason) {
    if (!userCan('canManageUsers') && !userCan('canApproveEvents')) return
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'Declined', adminNote: reason } : s))
  }

  // ── Event actions — real API calls ────────────────────────────────────────
  async function approveEvent(id) {
    if (!userCan('canApproveEvents')) return
    const evt = events.find(e => e.id === id)
    try {
      await api.put(`/events/${id}`, { status: 'published' })
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Approved' } : e))
      audit(AUDIT.EVENT_APPROVED, { detail: `Approved event: "${evt?.name}"`, eventId: id })
      pushNotif(`"${evt?.name}" approved by ${currentUser.name}.`)
    } catch (err) {
      pushNotif(`❌ Failed to approve "${evt?.name}": ${err.response?.data?.message || 'Server error'}`)
    }
  }

  async function rejectEvent(id, feedback) {
    if (!userCan('canRejectEvents')) return
    const evt = events.find(e => e.id === id)
    try {
      await api.put(`/events/${id}`, { status: 'cancelled' })
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Rejected', feedback } : e))
      audit(AUDIT.EVENT_REJECTED, { detail: `Rejected event: "${evt?.name}". Reason: "${feedback || 'none'}"`, eventId: id })
      pushNotif(`"${evt?.name}" rejected by ${currentUser.name}.`)
    } catch (err) {
      pushNotif(`❌ Failed to reject "${evt?.name}": ${err.response?.data?.message || 'Server error'}`)
    }
  }

  async function deleteEvent(id) {
    if (!userCan('canDeleteEvents')) return
    const evt = events.find(e => e.id === id)
    try {
      await api.delete(`/events/${id}`)
      setEvents(prev => prev.filter(e => e.id !== id))
      audit(AUDIT.EVENT_DELETED, { detail: `Deleted event: "${evt?.name}"`, eventId: id })
    } catch (err) {
      pushNotif(`❌ Failed to delete "${evt?.name}": ${err.response?.data?.message || 'Server error'}`)
    }
  }

  async function updateEvent(id, fields) {
    if (!userCan('canEditEvents')) return
    const evt = events.find(e => e.id === id)
    const payload = {
      title:       fields.name  || fields.title,
      description: fields.description,
      date:        fields.date,
      location:    fields.venue || fields.location,
      capacity:    fields.capacity,
      category:    fields.category?.toLowerCase(),
      price:       fields.price || 0,
      organizer:   fields.organizer,
    }
    try {
      const { data } = await api.put(`/events/${id}`, payload)
      setEvents(prev => prev.map(e => e.id === id ? normaliseEvent(data.event || { ...e, ...fields }) : e))
      audit(AUDIT.EVENT_EDITED, { detail: `Edited event: "${evt?.name}"`, eventId: id })
    } catch (err) {
      pushNotif(`❌ Failed to update "${evt?.name}": ${err.response?.data?.message || 'Server error'}`)
    }
  }

  async function addEvent(event) {
    if (!userCan('canCreateEvents')) return
    const payload = {
      title:       event.name,
      description: event.description || 'No description provided.',
      date:        event.date,
      location:    event.venue,
      capacity:    event.capacity || 100,
      category:    event.category?.toLowerCase() || 'other',
      price:       event.price || 0,
      organizer:   event.organizer,
      status:      'published',
    }
    try {
      const { data } = await api.post('/events', payload)
      const newEvent = normaliseEvent(data.event || { ...payload, _id: Date.now() })
      setEvents(prev => [newEvent, ...prev])
      audit(AUDIT.EVENT_CREATED, { detail: `Created event: "${event.name}" (${event.category}, ${event.date})` })
      pushNotif(`New event "${event.name}" created by ${currentUser.name}.`)
    } catch (err) {
      pushNotif(`❌ Failed to create "${event.name}": ${err.response?.data?.message || 'Server error'}`)
    }
  }

  // ── User actions — real API calls ─────────────────────────────────────────
  function addUser(user) {
    // Admin panel user creation is informational only — no backend endpoint for creating users
    if (!userCan('canManageUsers')) return
    const newU = { ...user, id: Date.now(), avatar: user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
    audit(AUDIT.USER_ADDED, { detail: `Added user: "${user.name}" as ${user.role} (${user.department})` })
    setUsers(prev => [newU, ...prev])
  }

  async function deleteUser(id) {
    if (!userCan('canManageUsers')) return
    const target = users.find(u => u.id === id)
    if (target && ROLE_LEVEL[target.role] >= ROLE_LEVEL[currentUser.role]) return
    audit(AUDIT.USER_DELETED, { detail: `Deleted user: "${target?.name}" (${target?.role})`, targetId: id })
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  async function updateUser(id, fields) {
    if (!userCan('canManageUsers')) return
    const target = users.find(u => u.id === id)
    if (fields.role && target && fields.role !== target.role) {
      const allowed = assignableRoles(currentUser)
      if (!allowed.includes(fields.role)) return
    }
    if (fields.role && target) {
      audit(AUDIT.ROLE_CHANGED, { detail: `Changed "${target.name}" role from "${target.role}" → "${fields.role}"`, targetId: id })
      // Map UI role to backend role
      const backendRole = fields.role === 'Admin' ? 'admin' : 'user'
      try {
        await api.put(`/admin/users/${id}/role`, { role: backendRole })
      } catch {}
    }
    if (fields.status !== undefined) {
      try {
        await api.put(`/admin/users/${id}/toggle-status`)
      } catch {}
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...fields } : u))
    if (fields.role && target) {
      pushNotif(`${target.name}'s role updated to "${fields.role}" by ${currentUser.name}.`)
      pushInbox(id, `🔑 Your role has been updated to "${fields.role}" by ${currentUser.name}.`, 'role_change')
    }
  }

  function markAllRead() { setNotifs(prev => prev.map(n => ({ ...n, read: true }))) }

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalRegistrations = events.reduce((s, e) => s + (e.registrations || 0), 0)
  const activeEvents       = events.filter(e => e.status === 'Approved').length
  const pendingEvents      = events.filter(e => e.status === 'Pending')
  const unreadCount        = notifications.filter(n => !n.read).length
  const myInbox            = currentUser ? (inboxes[currentUser.id] || []) : []
  const myUnreadInbox      = myInbox.filter(m => !m.read).length
  const pendingSuggestions = suggestions.filter(s => s.status === 'Pending')

  return (
    <AppContext.Provider value={{
      events, users, notifications, suggestions, pendingSuggestions, activePage, setActivePage,
      currentUser, authError, authLoading, setAuthError, login, signup, logout,
      userCan,
      approveEvent, rejectEvent, deleteEvent, updateEvent, addEvent,
      addUser, deleteUser, updateUser,
      submitSuggestion, convertSuggestion, declineSuggestion,
      markAllRead,
      myInbox, myUnreadInbox, markInboxRead,
      totalRegistrations, activeEvents, pendingEvents, unreadCount,
      accentColor, setAccentColor: setAccentColorState,
      language, setLanguage: setLanguageState, t,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
