import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // Ne pas forcer Content-Type ici — axios le définit automatiquement
  // (application/json pour les objets, multipart/form-data pour FormData)
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/connexion'
    }
    return Promise.reject(error)
  }
)

export default api
