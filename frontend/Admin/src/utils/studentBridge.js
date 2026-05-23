// ─── Student Platform Bridge ──────────────────────────────────────────────────
// Shared localStorage keys used by both Admin and Student platforms.
// Admin writes approved events → Student reads them.
// Student writes registrations → Admin reads them to update counts.

export const PUBLIC_KEY        = 'aastu_public_events'
export const REGISTRATIONS_KEY = 'aastu_student_registrations'

// Fields exposed to students
const PUBLIC_FIELDS = [
  'id', 'name', 'organizer', 'category', 'date', 'venue',
  'description', 'image', 'registrations', 'status', 'price', 'capacity',
]

// ── Admin → Student: push approved events ────────────────────────────────────
export function syncPublicEvents(allEvents) {
  try {
    const approved = allEvents
      .filter(e => e.status === 'Approved')
      .map(e => {
        const pub = {}
        PUBLIC_FIELDS.forEach(f => { if (e[f] !== undefined) pub[f] = e[f] })
        pub.lastUpdated = new Date().toISOString()
        return pub
      })
    localStorage.setItem(PUBLIC_KEY, JSON.stringify(approved))
  } catch {}
}

export function getPublicEvents() {
  try {
    const raw = localStorage.getItem(PUBLIC_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// ── Student → Admin: registration counts ─────────────────────────────────────
// Each entry: { eventId, studentName, studentEmail, registeredAt }
export function getStudentRegistrations() {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addStudentRegistration(entry) {
  try {
    const all = getStudentRegistrations()
    // Prevent duplicate registration by same email for same event
    const already = all.find(r => r.eventId === entry.eventId && r.studentEmail === entry.studentEmail)
    if (already) return { success: false, reason: 'already_registered' }
    const newEntry = { ...entry, registeredAt: new Date().toISOString() }
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([...all, newEntry]))
    return { success: true }
  } catch { return { success: false, reason: 'error' } }
}

export function getRegistrationCountForEvent(eventId) {
  try {
    return getStudentRegistrations().filter(r => r.eventId === eventId).length
  } catch { return 0 }
}

export function isStudentRegistered(eventId, studentEmail) {
  try {
    return getStudentRegistrations().some(r => r.eventId === eventId && r.studentEmail === studentEmail)
  } catch { return false }
}

// ── Cross-tab live updates ────────────────────────────────────────────────────
export function onPublicEventsChange(callback) {
  function handler(e) {
    if (e.key === PUBLIC_KEY) {
      try { callback(JSON.parse(e.newValue || '[]')) } catch {}
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

export function onRegistrationsChange(callback) {
  function handler(e) {
    if (e.key === REGISTRATIONS_KEY) {
      try { callback(JSON.parse(e.newValue || '[]')) } catch {}
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
