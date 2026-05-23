// ─── Student ↔ Admin Bridge ───────────────────────────────────────────────────
// Reads approved events written by the Admin panel.
// Writes student registrations that the Admin panel reads back.

import { PUBLIC_KEY, REGISTRATIONS_KEY, STUDENT_SESSION, STUDENT_NOTIFS } from './components/constants'

// ── Events ────────────────────────────────────────────────────────────────────
export function getPublicEvents() {
  try { return JSON.parse(localStorage.getItem(PUBLIC_KEY) || '[]') } catch { return [] }
}

// ── Registrations ─────────────────────────────────────────────────────────────
export function getRegistrations() {
  try { return JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '[]') } catch { return [] }
}

export function registerForEvent(event, student) {
  const all = getRegistrations()
  const already = all.find(r => r.eventId === event.id && r.studentEmail === student.email)
  if (already) return { ok: false, reason: 'already_registered' }
  const entry = {
    id:           Date.now(),
    eventId:      event.id,
    eventName:    event.name,
    eventDate:    event.date,
    eventVenue:   event.venue,
    eventImage:   event.image || null,
    eventPrice:   event.price || 0,
    studentName:  student.name,
    studentEmail: student.email,
    studentId:    student.id,
    registeredAt: new Date().toISOString(),
  }
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([...all, entry]))
  // Push a notification to the student
  pushStudentNotif(student.id, {
    type:    'registered',
    title:   `Registered for "${event.name}"`,
    message: `You're registered for ${event.name} on ${event.date} at ${event.venue}.`,
    eventId: event.id,
  })
  return { ok: true, entry }
}

export function cancelRegistration(eventId, studentId) {
  const all = getRegistrations()
  const updated = all.filter(r => !(r.eventId === eventId && r.studentId === studentId))
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated))
}

export function getMyRegistrations(studentId) {
  return getRegistrations().filter(r => r.studentId === studentId)
}

export function isRegistered(eventId, studentId) {
  return getRegistrations().some(r => r.eventId === eventId && r.studentId === studentId)
}

export function getRegistrationCount(eventId) {
  return getRegistrations().filter(r => r.eventId === eventId).length
}

// ── Student session ───────────────────────────────────────────────────────────
export function getStudentSession() {
  try { return JSON.parse(localStorage.getItem(STUDENT_SESSION) || 'null') } catch { return null }
}

export function saveStudentSession(student) {
  localStorage.setItem(STUDENT_SESSION, JSON.stringify(student))
}

export function clearStudentSession() {
  localStorage.removeItem(STUDENT_SESSION)
}

// ── Student notifications ─────────────────────────────────────────────────────
export function getStudentNotifs(studentId) {
  try {
    const all = JSON.parse(localStorage.getItem(STUDENT_NOTIFS) || '{}')
    return all[studentId] || []
  } catch { return [] }
}

export function pushStudentNotif(studentId, notif) {
  try {
    const all = JSON.parse(localStorage.getItem(STUDENT_NOTIFS) || '{}')
    const entry = { id: Date.now() + Math.random(), ...notif, time: new Date().toISOString(), read: false }
    all[studentId] = [entry, ...(all[studentId] || [])].slice(0, 50)
    localStorage.setItem(STUDENT_NOTIFS, JSON.stringify(all))
  } catch {}
}

export function markNotifsRead(studentId) {
  try {
    const all = JSON.parse(localStorage.getItem(STUDENT_NOTIFS) || '{}')
    all[studentId] = (all[studentId] || []).map(n => ({ ...n, read: true }))
    localStorage.setItem(STUDENT_NOTIFS, JSON.stringify(all))
  } catch {}
}

// ── Upcoming event reminders ──────────────────────────────────────────────────
// Call this on app load — checks if any registered events are within 2 days
export function checkUpcomingReminders(studentId) {
  const regs = getMyRegistrations(studentId)
  const now  = new Date()
  regs.forEach(r => {
    if (!r.eventDate) return
    const eventDate = new Date(r.eventDate)
    const diffDays  = (eventDate - now) / (1000 * 60 * 60 * 24)
    if (diffDays >= 0 && diffDays <= 2) {
      const existing = getStudentNotifs(studentId)
      const alreadyNotified = existing.some(n => n.type === 'reminder' && n.eventId === r.eventId)
      if (!alreadyNotified) {
        const label = diffDays < 1 ? 'TODAY' : 'TOMORROW'
        pushStudentNotif(studentId, {
          type:    'reminder',
          title:   `${label}: ${r.eventName}`,
          message: `Your event "${r.eventName}" is ${label.toLowerCase()} at ${r.eventVenue}. Don't miss it!`,
          eventId: r.eventId,
        })
      }
    }
  })
}

// ── Cross-tab live sync ───────────────────────────────────────────────────────
export function onEventsChange(cb) {
  const h = e => { if (e.key === PUBLIC_KEY) { try { cb(JSON.parse(e.newValue || '[]')) } catch {} } }
  window.addEventListener('storage', h)
  return () => window.removeEventListener('storage', h)
}
