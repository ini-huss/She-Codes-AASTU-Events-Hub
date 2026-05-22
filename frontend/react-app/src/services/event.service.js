import { api } from "./api"

// Normalize event data from backend → frontend-friendly shape
export function normalizeEvent(e) {
  if (!e) return e
  return {
    ...e,
    image: e.imageUrl || e.image || "",          // backend uses imageUrl
    name:  e.title    || e.name  || "",           // admin bridge uses name
    venue: e.location || e.venue || "",           // admin bridge uses venue
  }
}

export const eventService = {
  async getAll(params = {}) {
    const q = new URLSearchParams(params).toString()
    const data = await api.get(`/events${q ? "?" + q : ""}`)
    return { ...data, events: (data.events || []).map(normalizeEvent) }
  },
  async getById(id) {
    const data = await api.get(`/events/${id}`)
    return { ...data, event: normalizeEvent(data.event) }
  },
  create(data)     { return api.post("/events", data) },
  update(id, data) { return api.put(`/events/${id}`, data) },
  delete(id)       { return api.delete(`/events/${id}`) },
  getStats()       { return api.get("/events/stats") },

  // Registrations
  register(eventId)           { return api.post(`/registrations/${eventId}/register`, {}) },
  cancelReg(registrationId)   { return api.delete(`/registrations/${registrationId}/cancel`) },
  async myRegistrations(params = {}) {
    const q = new URLSearchParams(params).toString()
    const data = await api.get(`/registrations/my-registrations${q ? "?" + q : ""}`)
    // data may be array directly
    const arr = Array.isArray(data) ? data : (data.registrations || [])
    return arr.map(r => ({ ...r, event: normalizeEvent(r.event) }))
  },
  eventRegistrations(eventId) { return api.get(`/registrations/events/${eventId}/registrations`) },
  checkIn(registrationId)     { return api.post(`/registrations/${registrationId}/check-in`, {}) },
}
