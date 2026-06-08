import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const saved = localStorage.getItem('admin_user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) }
      catch { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user') }
    }
    setLoading(false)
  }, [])

  const connexion = async (email, mot_de_passe) => {
    const res = await api.post('/auth/connexion', { email, mot_de_passe })
    const { token, user: u } = res.data
    if (u.role !== 'admin') throw new Error('Ce portail est réservé aux administrateurs.')
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const deconnexion = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, connexion, deconnexion }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
