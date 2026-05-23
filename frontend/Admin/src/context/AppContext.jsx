import React, { createContext, useContext, useState, useEffect } from 'react'
import { initialEvents, initialUsers, initialSuggestions, notifications as initNotifs } from '../data/store'
import { T } from '../data/translations'
import { can, ROLE_LEVEL, assignableRoles } from '../data/roles'
import { hashPassword, verifyPassword } from '../utils/crypto'
import { writeAuditEntry, AUDIT, severityOf } from '../utils/auditLog'
import { syncPublicEvents, onRegistrationsChange, getRegistrationCountForEvent } from '../utils/studentBridge'

const AppContext = createContext(null)

// ── localStorage helpers ──────────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ── Seed Super Admin ──────────────────────────────────────────────────────────
// Password is stored as SHA-256 hash — never plain text

async function buildSeedAdmin() {
  // Compute real hash on first run
  const hash = await hashPassword('admin123')
  return {
    id: 1,
    email: 'admin@aastu.edu.et',
    passwordHash: hash,
    name: 'AASTU Super Admin',
    role: 'Super Admin',
    department: 'IT & Systems Department',
    avatar: 'SA',
  }
}

function loadAccounts() {
  return load('aastu_accounts', null)
}

function makeNotif(text) {
  return { id: Date.now() + Math.random(), text, time: 'Just now', read: false }
}

export function AppProvider({ children }) {
  const [accounts, setAccountsRaw]         = useState(() => loadAccounts() || [])
  const [events, setEventsRaw]             = useState(() => load('aastu_events', initialEvents))
  const [users, setUsersRaw]               = useState(() => load('aastu_users', initialUsers))
  const [suggestions, setSuggestionsRaw]   = useState(() => load('aastu_suggestions', initialSuggestions))
  const [notifications, setNotifsRaw]      = useState(() => load('aastu_notifs', initNotifs))
  const [inboxes, setInboxesRaw]           = useState(() => load('aastu_inboxes', {}))
  const [activePage, setActivePage]        = useState('dashboard')
  const [currentUser, setCurrentUser]      = useState(() => {
    const saved = load('aastu_session', null)
    if (!saved) return null
    // Always re-sync from accounts so promoted roles take effect immediately
    const accs = load('aastu_accounts', [])
    const fresh = accs.find(a => a.id === saved.id)
    if (!fresh) return null
    const { passwordHash: _, ...safeUser } = fresh
    // Update the saved session with the latest role
    save('aastu_session', safeUser)
    return safeUser
  })
  const [authError, setAuthError]          = useState('')
  const [authLoading, setAuthLoading]      = useState(false)
  const [accentColor, setAccentColorState] = useState(() => load('aastu_accent', '#7c5cbf'))
  const [language, setLanguageState]       = useState(() => load('aastu_lang', 'English'))
  const [ready, setReady]                  = useState(false)

  // ── On first load: seed the Super Admin if no accounts exist ─────────────
  useEffect(() => {
    async function init() {
      const stored = loadAccounts()
      if (!stored || stored.length === 0) {
        const seed = await buildSeedAdmin()
        setAccountsRaw([seed])
        save('aastu_accounts', [seed])
      }
      setReady(true)
    }
    init()
  }, [])

  // ── Persist helpers ───────────────────────────────────────────────────────
  function setAccounts(val) { setAccountsRaw(val); save('aastu_accounts', val) }
  function setEvents(fn)    { setEventsRaw(prev  => { const n = typeof fn === 'function' ? fn(prev)  : fn; save('aastu_events',      n); return n }) }
  function setUsers(fn)     { setUsersRaw(prev   => { const n = typeof fn === 'function' ? fn(prev)  : fn; save('aastu_users',       n); return n }) }
  function setSuggestions(fn){ setSuggestionsRaw(prev => { const n = typeof fn === 'function' ? fn(prev) : fn; save('aastu_suggestions', n); return n }) }
  function setNotifs(fn)    { setNotifsRaw(prev  => { const n = typeof fn === 'function' ? fn(prev)  : fn; save('aastu_notifs',      n); return n }) }
  function setInboxes(fn)   { setInboxesRaw(prev => { const n = typeof fn === 'function' ? fn(prev)  : fn; save('aastu_inboxes',     n); return n }) }

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

  // ── Sync student registration counts back into events ─────────────────────
  useEffect(() => {
    function syncCounts() {
      setEvents(prev => {
        const updated = prev.map(e => {
          const liveCount = getRegistrationCountForEvent(e.id)
          // Only update if the student count is higher (students may have registered)
          if (liveCount > (e.registrations || 0)) {
            return { ...e, registrations: liveCount }
          }
          return e
        })
        // Only save if something actually changed
        const changed = updated.some((e, i) => e.registrations !== prev[i].registrations)
        if (changed) {
          save('aastu_events', updated)
          syncPublicEvents(updated)
        }
        return changed ? updated : prev
      })
    }
    // Sync on mount
    syncCounts()
    // Listen for live changes from the student tab
    const unsub = onRegistrationsChange(() => syncCounts())
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  function pushNotif(text) {
    setNotifs(prev => [makeNotif(text), ...prev])
  }

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

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function login(email, password) {
    setAuthLoading(true)
    setAuthError('')
    try {
      // Reload accounts fresh from storage each time
      const freshAccounts = load('aastu_accounts', [])
      const found = freshAccounts.find(a => a.email.toLowerCase() === email.toLowerCase())
      if (!found) {
        setAuthError('Invalid email or password.')
        return false
      }
      const match = await verifyPassword(password, found.passwordHash)
      if (!match) {
        setAuthError('Invalid email or password.')
        return false
      }
      // Always use the latest role from accounts (in case it was promoted while logged out)
      const { passwordHash: _, ...safeUser } = found
      setCurrentUser(safeUser)
      save('aastu_session', safeUser)
      setAccountsRaw(freshAccounts)
      // Audit: record every login
      writeAuditEntry({
        action:   AUDIT.LOGIN,
        severity: severityOf(AUDIT.LOGIN),
        actor:    `${found.name} (${found.role})`,
        actorId:  found.id,
        detail:   `Logged in from ${navigator.userAgent.split(')')[0].split('(')[1] || 'unknown device'}`,
      })
      return true
    } finally {
      setAuthLoading(false)
    }
  }

  async function signup(name, email, password, department) {
    setAuthLoading(true)
    setAuthError('')
    try {
      const freshAccounts = load('aastu_accounts', [])
      const exists = freshAccounts.find(a => a.email.toLowerCase() === email.toLowerCase())
      if (exists) {
        setAuthError('An account with this email already exists.')
        return false
      }
      const passwordHash = await hashPassword(password)
      const newUser = {
        id: Date.now(),
        email,
        passwordHash,   // stored as hash, never plain text
        name,
        role: 'Viewer',
        department: department || 'Unassigned',
        avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      }
      const newAccounts = [...freshAccounts, newUser]
      setAccounts(newAccounts)

      const userRecord = {
        id: newUser.id, name, email,
        role: 'Viewer',
        department: newUser.department,
        status: 'Active',
        joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avatar: newUser.avatar,
      }
      setUsers(prev => [...prev, userRecord])

      pushNotif(`New user "${name}" registered from ${newUser.department}. Go to Users to assign their role.`)
      pushInbox(newUser.id,
        `Welcome to AASTU Events Hub, ${name}! Your account is active with Viewer access. A Super Admin will review and assign your role soon.`,
        'welcome'
      )

      const { passwordHash: _, ...safeUser } = newUser
      setCurrentUser(safeUser)
      save('aastu_session', safeUser)
      writeAuditEntry({
        action:   AUDIT.SIGNUP,
        severity: severityOf(AUDIT.SIGNUP),
        actor:    `${name} (Viewer)`,
        actorId:  newUser.id,
        detail:   `New account registered. Department: ${newUser.department}`,
      })
      return true
    } finally {
      setAuthLoading(false)
    }
  }

  function logout() {
    audit(AUDIT.LOGOUT, { detail: 'User logged out' })
    setCurrentUser(null)
    save('aastu_session', null)
    setActivePage('dashboard')
  }

  const userCan = (permission) => can(currentUser, permission)

  // ── Suggestion actions (for Viewers/faculty) ─────────────────────────────
  function submitSuggestion(suggestion) {
    const newSug = {
      ...suggestion,
      id:            Date.now(),
      status:        'Pending',   // Pending | Converted | Declined
      submittedBy:   currentUser.name,
      submittedEmail: currentUser.email,
      submittedAt:   new Date().toLocaleString(),
      adminNote:     '',
    }
    setSuggestions(prev => [newSug, ...prev])
    pushNotif(`📋 New event suggestion "${suggestion.name}" from ${currentUser.name} (${currentUser.department}).`)
    pushInbox(currentUser.id,
      `✅ Your suggestion "${suggestion.name}" has been submitted. An Admin will review it and may convert it into a real event.`,
      'info'
    )
  }

  function convertSuggestion(id, extraFields) {
    // Admin converts a suggestion into a real pending event
    if (!userCan('canCreateEvents')) return
    const sug = suggestions.find(s => s.id === id)
    if (!sug) return
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'Converted' } : s))
    const newEvent = {
      ...sug, ...extraFields,
      id:             Date.now(),
      status:         'Pending',
      organizerEmail: sug.submittedEmail,
      submittedAt:    new Date().toLocaleString(),
    }
    setEvents(prev => {
      const next = [newEvent, ...prev]
      syncPublicEvents(next)
      return next
    })
    pushNotif(`Event "${sug.name}" converted from suggestion by ${currentUser.name}.`)
    // Notify the suggester
    const acc = load('aastu_accounts', []).find(a => a.email === sug.submittedEmail)
    if (acc) {
      pushInbox(acc.id,
        `🎉 Your suggestion "${sug.name}" has been accepted and converted into a real event by ${currentUser.name}. It is now pending final approval.`,
        'approved'
      )
    }
  }

  function declineSuggestion(id, reason) {
    if (!userCan('canManageUsers') && !userCan('canApproveEvents')) return
    const sug = suggestions.find(s => s.id === id)
    if (!sug) return
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'Declined', adminNote: reason } : s))
    const acc = load('aastu_accounts', []).find(a => a.email === sug.submittedEmail)
    if (acc) {
      pushInbox(acc.id,
        `❌ Your suggestion "${sug.name}" was declined by ${currentUser.name}. Reason: "${reason || 'No reason provided'}".`,
        'rejected'
      )
    }
  }

  // ── Event actions ─────────────────────────────────────────────────────────
  function approveEvent(id) {
    if (!userCan('canApproveEvents')) return
    const evt = events.find(e => e.id === id)
    setEvents(prev => {
      const next = prev.map(e => e.id === id ? { ...e, status: 'Approved', feedback: '' } : e)
      syncPublicEvents(next)   // ← push to student platform bridge
      return next
    })
    if (evt) {
      audit(AUDIT.EVENT_APPROVED, { detail: `Approved event: "${evt.name}" (organizer: ${evt.organizer})`, eventId: id })
      pushNotif(`"${evt.name}" approved by ${currentUser.name}.`)
      const freshAccounts = load('aastu_accounts', [])
      const organizer = freshAccounts.find(a => a.email === evt.organizerEmail)
      if (organizer) {
        pushInbox(organizer.id,
          `✅ Your event "${evt.name}" has been APPROVED by ${currentUser.name}. It is now live and visible to students.`,
          'approved'
        )
      }
    }
  }

  function rejectEvent(id, feedback) {
    if (!userCan('canRejectEvents')) return
    const evt = events.find(e => e.id === id)
    setEvents(prev => {
      const next = prev.map(e => e.id === id ? { ...e, status: 'Rejected', feedback } : e)
      syncPublicEvents(next)
      return next
    })
    if (evt) {
      audit(AUDIT.EVENT_REJECTED, { detail: `Rejected event: "${evt.name}". Reason: "${feedback || 'none'}"`, eventId: id })
      pushNotif(`"${evt.name}" rejected by ${currentUser.name}.`)
      const freshAccounts = load('aastu_accounts', [])
      const organizer = freshAccounts.find(a => a.email === evt.organizerEmail)
      if (organizer) {
        pushInbox(organizer.id,
          `❌ Your event "${evt.name}" was REJECTED by ${currentUser.name}. Reason: "${feedback || 'No reason provided'}". You may edit and resubmit.`,
          'rejected'
        )
      }
    }
  }

  function deleteEvent(id) {
    if (!userCan('canDeleteEvents')) return
    const evt = events.find(e => e.id === id)
    audit(AUDIT.EVENT_DELETED, { detail: `Deleted event: "${evt?.name}"`, eventId: id })
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id)
      syncPublicEvents(next)
      return next
    })
  }

  function updateEvent(id, fields) {
    if (!userCan('canEditEvents')) return
    const evt = events.find(e => e.id === id)
    audit(AUDIT.EVENT_EDITED, { detail: `Edited event: "${evt?.name}"`, eventId: id })
    setEvents(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...fields } : e)
      syncPublicEvents(next)
      return next
    })
  }

  function addEvent(event) {
    if (!userCan('canCreateEvents')) return
    const newEvent = {
      ...event,
      id: Date.now(),
      organizerEmail: currentUser.email,
      submittedAt: new Date().toLocaleString(),
    }
    audit(AUDIT.EVENT_CREATED, { detail: `Created event: "${event.name}" (${event.category}, ${event.date})` })
    setEvents(prev => {
      const next = [newEvent, ...prev]
      syncPublicEvents(next)
      return next
    })
    pushNotif(
      `New event "${event.name}" submitted by ${currentUser.name} — pending review.`
      + (event.urgent ? ' ⚠️ Marked URGENT.' : '')
    )
  }

  // ── User actions ──────────────────────────────────────────────────────────
  function addUser(user) {
    if (!userCan('canManageUsers')) return
    const newU = { ...user, id: Date.now() }
    audit(AUDIT.USER_ADDED, { detail: `Added user: "${user.name}" as ${user.role} (${user.department})` })
    setUsers(prev => [newU, ...prev])
    // Also add a stub account so the user appears in accounts list
    // (no passwordHash — they must sign up themselves to set a password)
    const freshAccounts = load('aastu_accounts', [])
    const alreadyExists = freshAccounts.find(a => a.email?.toLowerCase() === user.email?.toLowerCase())
    if (!alreadyExists) {
      const stubAccount = {
        id: newU.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department || 'Unassigned',
        avatar: newU.avatar || user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        passwordHash: null, // no password — user must sign up to set one
      }
      setAccounts([...freshAccounts, stubAccount])
    }
  }

  function deleteUser(id) {
    if (!userCan('canManageUsers')) return
    const target = users.find(u => u.id === id)
    if (target && ROLE_LEVEL[target.role] >= ROLE_LEVEL[currentUser.role]) return
    audit(AUDIT.USER_DELETED, { detail: `Deleted user: "${target?.name}" (${target?.role})`, targetId: id })
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  function updateUser(id, fields) {
    if (!userCan('canManageUsers')) return

    // Only enforce role restriction if the role is actually changing
    const target = users.find(u => u.id === id)
    if (fields.role && target && fields.role !== target.role) {
      const allowed = assignableRoles(currentUser)
      if (!allowed.includes(fields.role)) return
    }
    if (fields.role && target) {
      audit(AUDIT.ROLE_CHANGED, {
        detail: `Changed "${target.name}" role from "${target.role}" → "${fields.role}"`,
        targetId: id,
      })
    }

    // 1. Update users list in state + localStorage
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...fields } : u))

    // 2. Update accounts array — read fresh from localStorage to avoid stale state
    const freshAccounts = load('aastu_accounts', [])
    const newAccounts = freshAccounts.map(a => a.id === id ? { ...a, ...fields } : a)
    setAccounts(newAccounts)

    // 3. If the promoted user is currently logged in — update their session immediately
    if (currentUser && currentUser.id === id) {
      const updated = { ...currentUser, ...fields }
      setCurrentUser(updated)
      save('aastu_session', updated)
    } else {
      // Update their saved session so next login picks up the new role
      const savedSession = load('aastu_session', null)
      if (savedSession && savedSession.id === id) {
        save('aastu_session', { ...savedSession, ...fields })
      }
    }

    if (fields.role && target) {
      pushNotif(`${target.name}'s role updated to "${fields.role}" by ${currentUser.name}.`)
      pushInbox(id,
        `🔑 Your role has been updated to "${fields.role}" by ${currentUser.name}. Your new permissions are active immediately.`,
        'role_change'
      )
    }
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalRegistrations = events.reduce((s, e) => s + (e.registrations || 0), 0)
  const activeEvents       = events.filter(e => e.status === 'Approved').length
  const pendingEvents      = events.filter(e => e.status === 'Pending')
  const unreadCount        = notifications.filter(n => !n.read).length
  const myInbox            = currentUser ? (inboxes[currentUser.id] || []) : []
  const myUnreadInbox      = myInbox.filter(m => !m.read).length

  if (!ready) return null  // wait for seed admin to be hashed before rendering

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
