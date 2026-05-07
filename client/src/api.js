import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Inject token into requests
api.interceptors.request.use((config) => {
  try {
    const auth = localStorage.getItem('sp_auth')
    if (auth) {
      const parsed = JSON.parse(auth)
      if (parsed && parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    }
  } catch (err) {
    console.error('API Auth Interceptor Error:', err)
  }
  return config
})

// Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const auth = JSON.parse(localStorage.getItem('sp_auth') || '{}')
        if (auth.refreshToken) {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken: auth.refreshToken,
          })
          const { token, refreshToken } = res.data
          localStorage.setItem('sp_auth', JSON.stringify({ ...auth, token, refreshToken }))
          api.defaults.headers.common.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('sp_auth')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  me: () => api.get('/auth/me'),
}

export const users = {
  search: (q) => api.get(`/users/search?q=${q}`),
  addFriend: (friendId) => api.post('/users/add-friend', { friendId }),
}

export const groups = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  addMember: (id, userId) => api.post(`/groups/${id}/members`, { userId }),
}

export const expenses = {
  create: (data) => api.post('/expenses', data),
  getByGroup: (groupId) => api.get(`/expenses/group/${groupId}`),
  getUserRecent: () => api.get('/expenses'),
}

export const reports = {
  getSummary: () => api.get('/reports/summary'),
  getMonthly: () => api.get('/reports/monthly'),
  getCategory: () => api.get('/reports/category'),
}

export const settlements = {
  pay: (data) => api.post('/settlements/pay', data),
}

export const notifications = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}

export default api
