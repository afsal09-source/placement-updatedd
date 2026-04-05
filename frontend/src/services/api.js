import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:     (data) => api.post('/auth/login', data),
  register:  (data) => api.post('/auth/register', data),
  sendOtp:   (email) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
}

export const coordinatorAPI = {
  getStudents:    ()   => api.get('/coordinator/students'),
  getStudent:     (id) => api.get(`/coordinator/students/${id}`),
  getCompanies:   ()   => api.get('/coordinator/companies'),
  getCompany:     (id) => api.get(`/coordinator/companies/${id}`),
  getDrives:      ()   => api.get('/coordinator/drives'),
}

export const driveAPI = {
  getAll:      ()         => api.get('/drives'),
  getById:     (id)       => api.get(`/drives/${id}`),
  getByStatus: (status)   => api.get(`/drives/status/${status}`),
  create:      (data)     => api.post('/drives', data),
  update:      (id, data) => api.put(`/drives/${id}`, data),
  delete:      (id)       => api.delete(`/drives/${id}`),
}

export const applicationAPI = {
  apply:          (data)   => api.post('/applications/apply', data),
  getMy:          ()       => api.get('/applications/my'),
  getAll:         ()       => api.get('/applications'),
  getForDrive:    (id)     => api.get(`/applications/drive/${id}`),
  updateStatus:   (id, d)  => api.put(`/applications/${id}/status`, d),
  addEvaluation:  (id, d)  => api.post(`/applications/${id}/evaluate`, d),
}

export const studentAPI = {
  getMe:        ()         => api.get('/students/me'),
  getAll:       ()         => api.get('/students'),
  getById:      (id)       => api.get(`/students/${id}`),
  updateMe:     (data)     => api.put('/students/me', data),
  uploadResume: (file)     => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/students/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  predict:      ()         => api.get('/students/predict'),
  predictFor:   (id)       => api.get(`/students/${id}/predict`),
  skillGap:     (id)       => api.get(`/students/${id}/skill-gap`),
}

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
}

export const feedbackAPI = {
  submit:   (data) => api.post('/feedback', data),
  getAll:   ()     => api.get('/feedback'),
  approved: ()     => api.get('/feedback/approved'),
  approve:  (id)   => api.put(`/feedback/${id}/approve`),
}

export const notificationAPI = {
  getAll:       () => api.get('/notifications'),
  getUnread:    () => api.get('/notifications/unread-count'),
  markRead:     (id) => api.put(`/notifications/${id}/read`),
  markAllRead:  () => api.put('/notifications/read-all'),
}

export const fileAPI = {
  // Get resume info (has resume? filename?)
  getResumeInfo: (studentId) => api.get(`/files/resume/${studentId}/info`),
  // View URL (inline PDF in browser tab) — used as href
  getViewUrl:    (studentId) => `/api/files/resume/${studentId}`,
  // Download URL — used as href with download attribute
  getDownloadUrl:(studentId) => `/api/files/resume/${studentId}?download=true`,
  // Fetch blob for programmatic open/download (carries the Bearer token)
  fetchResume:   (studentId, download = false) =>
    api.get(`/files/resume/${studentId}${download ? '?download=true' : ''}`, {
      responseType: 'blob',
    }),
}

export default api
