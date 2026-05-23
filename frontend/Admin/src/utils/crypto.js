// ─── Password hashing using Web Crypto API (built into every browser) ─────────
// SHA-256 is not bcrypt but it's far better than plain text.
// In production with a real backend, use bcrypt on the server side.

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  // Add a fixed salt to make rainbow table attacks harder
  const salted = 'aastu_events_2024_' + password
  const data = encoder.encode(salted)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, hash) {
  const hashed = await hashPassword(password)
  return hashed === hash
}
