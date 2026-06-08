import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)
const ROLES = ['encadrant', 'responsable_pedagogique']

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('staff_token')
    const saved = localStorage.getItem('staff_user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) }
      catch { localStorage.removeItem('staff_token'); localStorage.removeItem('staff_user') }
    }
    setLoading(false)
  }, [])

  const connexion = async (email, mot_de_passe) => {
    const res = await api.post('/auth/connexion', { email, mot_de_passe })
    const { token, user: u } = res.data
    if (!ROLES.includes(u.role)) throw new Error('Ce portail est réservé au personnel universitaire.')
    localStorage.setItem('staff_token', token)
    localStorage.setItem('staff_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const inscription = async (data) => {
    const res = await api.post('/auth/inscription/personnel', data)
    const { token, user: u } = res.data
    localStorage.setItem('staff_token', token)
    localStorage.setItem('staff_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const mettreAJourProfil = async (data) => {
    const res = await api.patch('/profil/moi', data)
    const u = res.data.data
    const merged = { ...user, ...u }
    localStorage.setItem('staff_user', JSON.stringify(merged))
    setUser(merged)
    return merged
  }

  const deconnexion = () => {
    localStorage.removeItem('staff_token')
    localStorage.removeItem('staff_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, connexion, inscription, deconnexion, mettreAJourProfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
