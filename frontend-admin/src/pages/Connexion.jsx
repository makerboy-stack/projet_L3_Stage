import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  email: z.string().email('Email invalide'),
  mot_de_passe: z.string().min(1, 'Mot de passe obligatoire'),
})

export default function Connexion() {
  const { connexion } = useAuth()
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email, mot_de_passe }) => {
    setApiError(''); setLoading(true)
    try {
      await connexion(email, mot_de_passe)
      toast.success('Connexion admin réussie !')
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Accès refusé.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Shield size={32} /></div>
          <h1>Espace Administrateur</h1>
          <p>Gestion des Stages & Mémoires</p>
        </div>
        <div style={{ textAlign: 'center' }}><span className="auth-badge">Accès Restreint</span></div>

        {apiError && <div className="alert alert-error"><AlertCircle size={16} /><span>{apiError}</span></div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label>Email administrateur</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input {...register('email')} type="email" placeholder="admin@universite.fr" className={errors.email ? 'error' : ''} />
            </div>
            {errors.email && <p className="error-msg"><AlertCircle size={12} />{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input {...register('mot_de_passe')} type={showPwd ? 'text' : 'password'} placeholder="Mot de passe sécurisé" className={errors.mot_de_passe ? 'error' : ''} />
              <button type="button" className="input-action" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {errors.mot_de_passe && <p className="error-msg"><AlertCircle size={12} />{errors.mot_de_passe.message}</p>}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <div className="spinner" /> : <Shield size={16} />}
            {loading ? 'Connexion...' : 'Accéder au panneau admin'}
          </button>
        </form>
        <div className="auth-footer" style={{ marginTop: 16 }}>
          <Link to="/mot-de-passe-oublie" style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </div>
  )
}
