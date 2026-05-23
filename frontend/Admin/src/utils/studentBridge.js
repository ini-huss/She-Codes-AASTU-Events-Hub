// ─── Student Platform Bridge ──────────────────────────────────────────────────
// When your friends finish the student-facing platform, they read from this key.
// Every time an event is approved or updated, this file syncs the public data.
//
// HOW TO CONNECT:
// In the student platform, read localStorage key 'aastu_public_events'
// It contains an array of approved events safe to show to students.
// Poll it every 30 seconds or use a storage event listener for live updates.
//
// Example in student platform:
//   const events = JSON.parse(localStorage.getItem('aastu_public_events') || '[]')
//
// When you move to a real backend, replace this with an API call to:
//   GET /api/public/events  →  returns approved events

const PUBLIC_KEY = 'aastu_public_events'

// Fields safe to expose to students (no internal admin data)
const PUBLIC_FIELDS = [
  'id', 'name', 'organizer', 'category', 'date', 'venue',
  'description', 'image', 'registrations', 'status',
]

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

// Listen for changes from the student platform side (cross-tab communication)
export function onPublicEventsChange(callback) {
  function handler(e) {
    if (e.key === PUBLIC_KEY) {
      try { callback(JSON.parse(e.newValue || '[]')) } catch {}
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
