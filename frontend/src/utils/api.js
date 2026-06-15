import axios from 'axios'

console.log('API URL =', import.meta.env.VITE_API_URL)
// Should be:
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
})


// Attach token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('invoiceai_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('invoiceai_token')
      localStorage.removeItem('invoiceai_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
