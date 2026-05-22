import { useState, useEffect, useCallback } from "react"
import { eventService } from "../services/event.service"

export function useEvents(params = {}) {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [pagination, setPagination] = useState(null)

  const key = JSON.stringify(params)

  const fetch = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const data = await eventService.getAll(params)
      setEvents(data.events || [])
      setPagination(data.pagination || null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => { fetch() }, [fetch])

  return { events, loading, error, pagination, refetch: fetch }
}
