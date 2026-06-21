import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle, BarChart2, Users, School } from 'lucide-react'
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
    <div className="auth-split">
      {/* ── Panneau gauche ── */}
      <div className="auth-split-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Shield size={34} />
          </div>
          <h1>Admin Panel</h1>
          <p>Tableau de bord d'administration de la plateforme GestStage</p>
        </div>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon"><BarChart2 size={18} /></div>
            <div>
              <strong>Statistiques en temps réel</strong>
              <span>Suivez l'activité de la plateforme et les indicateurs clés</span>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><Users size={18} /></div>
            <div>
              <strong>Gestion des utilisateurs</strong>
              <span>Gérez les étudiants, encadrants et responsables pédagogiques</span>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><School size={18} /></div>
            <div>
              <strong>Structure académique</strong>
              <span>Configurez les établissements, départements et filières</span>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 48,
          padding: '12px 16px',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10,
          position: 'relative', zIndex: 1,
        }}>
          <Shield size={14} style={{ color: 'rgba(245,158,11,0.8)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.45)' }}>
            Accès restreint aux administrateurs habilités
          </span>
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div className="auth-split-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <span className="auth-badge">Accès Restreint</span>
            <h2>Administration</h2>
            <p>Connectez-vous avec vos identifiants administrateur</p>
          </div>

          {apiError && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label>Email administrateur</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@universite.fr"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <p className="error-msg"><AlertCircle size={12} />{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  {...register('mot_de_passe')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Mot de passe sécurisé"
                  className={errors.mot_de_passe ? 'error' : ''}
                />
                <button type="button" className="input-action" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.mot_de_passe && <p className="error-msg"><AlertCircle size={12} />{errors.mot_de_passe.message}</p>}
            </div>

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/mot-de-passe-oublie" className="forgot-link">Mot de passe oublié ?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <div className="spinner" style={{ borderTopColor: '#92400e' }} /> : <Shield size={16} />}
              {loading ? 'Vérification...' : 'Accéder au panneau'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: 20 }}>
            <Link to="/mot-de-passe-oublie" style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>
              Problème de connexion ? Contacter l'administrateur système
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
