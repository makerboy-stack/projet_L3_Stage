import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle, Phone, Users, ClipboardList, School } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const schema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères'),
  prenom: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  mot_de_passe: z.string().min(6, 'Minimum 6 caractères'),
  confirmer_mdp: z.string(),
  role: z.enum(['encadrant', 'responsable_pedagogique'], { errorMap: () => ({ message: 'Choisissez un rôle.' }) }),
  ecole_id: z.string().min(1, 'Sélectionnez votre établissement'),
  grade: z.string().optional(),
  specialite: z.string().optional(),
  telephone: z.string().optional(),
}).refine(d => d.mot_de_passe === d.confirmer_mdp, { message: 'Les mots de passe ne correspondent pas', path: ['confirmer_mdp'] })

export default function Inscription() {
  const { inscription } = useAuth()
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ecoles, setEcoles] = useState([])
  const [ecolesLoading, setEcolesLoading] = useState(true)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: '' },
  })
  const role = watch('role')

  useEffect(() => {
    api.get('/ecoles')
      .then(r => setEcoles(r.data.data || []))
      .catch(() => setEcoles([]))
      .finally(() => setEcolesLoading(false))
  }, [])

  const onSubmit = async (data) => {
    setApiError(''); setLoading(true)
    try {
      const { confirmer_mdp, ...payload } = data
      payload.ecole_id = parseInt(payload.ecole_id, 10)
      await inscription(payload)
      toast.success(`Inscription réussie !`)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || "Erreur lors de l'inscription.")
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <div className="logo-icon"><Users size={32} /></div>
          <h1>Inscription Personnel</h1>
          <p>Portail Enseignants & Responsables</p>
        </div>
        <div style={{ textAlign: 'center' }}><span className="auth-badge">Espace Personnel Universitaire</span></div>

        {apiError && <div className="alert alert-error"><AlertCircle size={16} /><span>{apiError}</span></div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Rôle */}
          <div className="form-group">
            <label>Je suis... *</label>
            <div className="role-selector">
              {[
                { val: 'encadrant', Icon: BookOpen, title: 'Encadrant', desc: 'Je supervise des étudiants' },
                { val: 'responsable_pedagogique', Icon: ClipboardList, title: 'Resp. Pédagogique', desc: 'Je vérifie les encadrements' },
              ].map(({ val, Icon, title, desc }) => (
                <div
                  key={val}
                  className={`role-card ${role === val ? 'selected' : ''}`}
                  onClick={() => setValue('role', val, { shouldValidate: true })}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setValue('role', val, { shouldValidate: true })}
                >
                  <div className="role-icon"><Icon size={20} /></div>
                  <div className="role-title">{title}</div>
                  <div className="role-desc">{desc}</div>
                </div>
              ))}
            </div>
            <input type="hidden" {...register('role')} />
            {errors.role && <p className="error-msg"><AlertCircle size={12} />{errors.role.message}</p>}
          </div>

          {/* Nom & Prénom */}
          <div className="form-row">
            <div className="form-group">
              <label>Nom *</label>
              <div className="input-wrapper"><User size={16} className="input-icon" /><input {...register('nom')} placeholder="Dupont" className={errors.nom ? 'error' : ''} /></div>
              {errors.nom && <p className="error-msg"><AlertCircle size={12} />{errors.nom.message}</p>}
            </div>
            <div className="form-group">
              <label>Prénom *</label>
              <div className="input-wrapper"><User size={16} className="input-icon" /><input {...register('prenom')} placeholder="Marie" className={errors.prenom ? 'error' : ''} /></div>
              {errors.prenom && <p className="error-msg"><AlertCircle size={12} />{errors.prenom.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email universitaire *</label>
            <div className="input-wrapper"><Mail size={16} className="input-icon" /><input {...register('email')} type="email" placeholder="m.dupont@univ.fr" className={errors.email ? 'error' : ''} /></div>
            {errors.email && <p className="error-msg"><AlertCircle size={12} />{errors.email.message}</p>}
          </div>

          {/* École */}
          <div className="form-group">
            <label>Établissement *</label>
            <div className="input-wrapper">
              <School size={16} className="input-icon" />
              <select {...register('ecole_id')} className={errors.ecole_id ? 'error' : ''} disabled={ecolesLoading}>
                <option value="">{ecolesLoading ? 'Chargement...' : 'Sélectionner votre établissement...'}</option>
                {ecoles.map(e => <option key={e.id} value={e.id}>{e.sigle ? `${e.sigle} — ${e.nom}` : e.nom}</option>)}
              </select>
            </div>
            {errors.ecole_id && <p className="error-msg"><AlertCircle size={12} />{errors.ecole_id.message}</p>}
            {!ecolesLoading && ecoles.length === 0 && <p className="error-msg" style={{ color: '#d97706' }}><AlertCircle size={12} />Aucun établissement disponible. Contactez l'administration.</p>}
          </div>

          {/* Grade & Spécialité */}
          <div className="form-row">
            <div className="form-group">
              <label>Grade / Titre</label>
              <div className="input-wrapper"><BookOpen size={16} className="input-icon" /><input {...register('grade')} placeholder="Maître de conf." /></div>
            </div>
            <div className="form-group">
              <label>Spécialité</label>
              <div className="input-wrapper"><BookOpen size={16} className="input-icon" /><input {...register('specialite')} placeholder="Informatique" /></div>
            </div>
          </div>

          {/* Téléphone */}
          <div className="form-group">
            <label>Téléphone</label>
            <div className="input-wrapper"><Phone size={16} className="input-icon" /><input {...register('telephone')} placeholder="77 000 00 00" /></div>
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label>Mot de passe *</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input {...register('mot_de_passe')} type={showPwd ? 'text' : 'password'} placeholder="Minimum 6 caractères" className={errors.mot_de_passe ? 'error' : ''} />
              <button type="button" className="input-action" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {errors.mot_de_passe && <p className="error-msg"><AlertCircle size={12} />{errors.mot_de_passe.message}</p>}
          </div>

          {/* Confirmer */}
          <div className="form-group">
            <label>Confirmer le mot de passe *</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input {...register('confirmer_mdp')} type={showConfirm ? 'text' : 'password'} placeholder="Répéter le mot de passe" className={errors.confirmer_mdp ? 'error' : ''} />
              <button type="button" className="input-action" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {errors.confirmer_mdp && <p className="error-msg"><AlertCircle size={12} />{errors.confirmer_mdp.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <div className="spinner" /> : null}{loading ? 'Inscription en cours...' : 'Créer mon compte'}
          </button>
        </form>
        <div className="auth-footer">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></div>
      </div>
    </div>
  )
}
