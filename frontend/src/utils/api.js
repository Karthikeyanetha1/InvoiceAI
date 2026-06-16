import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Debug log
console.log('API URL =', import.meta.env.VITE_API_URL)

api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('invoiceai_token')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
    return cfg
})

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