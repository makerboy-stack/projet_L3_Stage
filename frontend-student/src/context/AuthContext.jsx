import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [profil, setProfil]   = useState(null) // profil complet avec associations
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch {
        localStorage.removeItem('token'); localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const connexion = async (email, mot_de_passe) => {
    const res = await api.post('/auth/connexion', { email, mot_de_passe })
    const { token, user: u } = res.data
    if (u.role !== 'etudiant') throw new Error('Ce portail est réservé aux étudiants.')
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const inscription = async (data) => {
    const res = await api.post('/auth/inscription/etudiant', data)
    const { token, user: u } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }

  // Recharge le profil complet depuis l'API (avec stage, mémoire, encadrant…)
  const rafraichirProfil = async () => {
    try {
      const res = await api.get('/auth/profil')
      const p = res.data.data
      setProfil(p)
      // Met aussi à jour les infos de base
      const base = { ...user, ...p }
      localStorage.setItem('user', JSON.stringify(base))
      setUser(base)
      return p
    } catch { /* silencieux */ }
  }

  const mettreAJourProfil = async (data) => {
    const res = await api.patch('/profil/moi', data)
    const u = res.data.data
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    await rafraichirProfil()
    return u
  }

  const deconnexion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setProfil(null)
  }

  return (
    <AuthContext.Provider value={{
      user, profil, loading,
      connexion, inscription, deconnexion,
      rafraichirProfil, mettreAJourProfil,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
