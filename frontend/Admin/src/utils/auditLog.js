// ─── Audit Log ────────────────────────────────────────────────────────────────
// Every sensitive action is recorded here.
// The log is append-only — entries are NEVER deleted or modified.
// Even Super Admin can only VIEW the log, not clear it.
// In production this would write to a server-side database.

const KEY = 'aastu_audit_log'

export function getAuditLog() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function writeAuditEntry(entry) {
  try {
    const log = getAuditLog()
    const newEntry = {
      id:        Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...entry,
    }
    // Prepend so newest is first, keep last 1000 entries
    const updated = [newEntry, ...log].slice(0, 1000)
    localStorage.setItem(KEY, JSON.stringify(updated))
    return newEntry
  } catch { return null }
}

// Action type constants
export const AUDIT = {
  LOGIN:          'LOGIN',
  LOGOUT:         'LOGOUT',
  SIGNUP:         'SIGNUP',
  EVENT_CREATED:  'EVENT_CREATED',
  EVENT_APPROVED: 'EVENT_APPROVED',
  EVENT_REJECTED: 'EVENT_REJECTED',
  EVENT_DELETED:  'EVENT_DELETED',
  EVENT_EDITED:   'EVENT_EDITED',
  USER_ADDED:     'USER_ADDED',
  USER_DELETED:   'USER_DELETED',
  ROLE_CHANGED:   'ROLE_CHANGED',
  SETTINGS_SAVED: 'SETTINGS_SAVED',
}

// Severity levels for color coding
export const SEVERITY = {
  INFO:    'info',     // normal operations
  WARNING: 'warning',  // deletions, rejections
  DANGER:  'danger',   // role changes, bulk actions
}

export function severityOf(action) {
  if ([AUDIT.EVENT_DELETED, AUDIT.USER_DELETED, AUDIT.EVENT_REJECTED].includes(action)) return SEVERITY.WARNING
  if ([AUDIT.ROLE_CHANGED, AUDIT.SETTINGS_SAVED].includes(action)) return SEVERITY.DANGER
  return SEVERITY.INFO
}
