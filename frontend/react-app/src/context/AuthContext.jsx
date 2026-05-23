import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/auth.service"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  // Restore session on mount
  useEffect(() => {
    async function restore() {
      if (!authService.getToken()) { setLoading(false); return }
      try {
        const data = await authService.getMe()
        setUser(data.user)
      } catch {
        authService.logout()
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  async function login(email, password) {
    setError("")
    const data = await authService.login(email, password)
    setUser(data.user)
    return data
  }

  async function register(name, email, password, department, studentId) {
    setError("")
    const data = await authService.register(name, email, password, department, studentId)
    setUser(data.user)
    return data
  }

  function logout() {
    authService.logout()
    setUser(null)
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
