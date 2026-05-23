import { api } from "./api"

export const authService = {
  async register(name, email, password, department, studentId) {
    const data = await api.post("/auth/register", { name, email, password, department, studentId })
    if (data.token) localStorage.setItem("aastu_token", data.token)
    return data
  },

  async login(email, password) {
    const data = await api.post("/auth/login", { email, password })
    if (data.token) localStorage.setItem("aastu_token", data.token)
    return data
  },

  async getMe() {
    return api.get("/auth/me")
  },

  logout() {
    localStorage.removeItem("aastu_token")
  },

  getToken() {
    return localStorage.getItem("aastu_token")
  },
}
