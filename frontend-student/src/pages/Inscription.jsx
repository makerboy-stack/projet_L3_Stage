import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  User, Mail, Lock, Eye, EyeOff,
  Hash, GraduationCap, AlertCircle, Phone, School
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const schema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères'),
  prenom: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  mot_de_passe: z.string().min(6, 'Minimum 6 caractères'),
  confirmer_mdp: z.string(),
  numero_etudiant: z.string().min(1, 'Numéro étudiant obligatoire'),
  ecole_id: z.string().min(1, 'Veuillez sélectionner votre établissement'),
  telephone: z.string().optional(),
}).refine((d) => d.mot_de_passe === d.confirmer_mdp, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmer_mdp'],
});

const Inscription = () => {
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ecoles, setEcoles] = useState([]);
  const [ecolesLoading, setEcolesLoading] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  // Charger la liste des écoles depuis l'API
  useEffect(() => {
    api.get('/ecoles')
      .then((res) => setEcoles(res.data.data || []))
      .catch(() => setEcoles([]))
      .finally(() => setEcolesLoading(false));
  }, []);

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const { confirmer_mdp, ...payload } = data;
      // Convertir ecole_id en nombre
      payload.ecole_id = parseInt(payload.ecole_id, 10);
      await inscription(payload);
      toast.success('Inscription réussie ! Bienvenue.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Erreur lors de l'inscription.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-logo">
          <div className="logo-icon">
            <GraduationCap size={32} />
          </div>
          <h1>Créer mon compte</h1>
          <p>Portail Étudiant — Stages & Mémoires</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span className="auth-badge">Espace Étudiant</span>
        </div>

        {apiError && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Nom & Prénom */}
          <div className="form-row">
            <div className="form-group">
              <label>Nom *</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  {...register('nom')}
                  placeholder="Dupont"
                  className={errors.nom ? 'error' : ''}
                />
              </div>
              {errors.nom && <p className="error-msg"><AlertCircle size={12} />{errors.nom.message}</p>}
            </div>

            <div className="form-group">
              <label>Prénom *</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  {...register('prenom')}
                  placeholder="Jean"
                  className={errors.prenom ? 'error' : ''}
                />
              </div>
              {errors.prenom && <p className="error-msg"><AlertCircle size={12} />{errors.prenom.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email universitaire *</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                {...register('email')}
                type="email"
                placeholder="jean.dupont@univ.fr"
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <p className="error-msg"><AlertCircle size={12} />{errors.email.message}</p>}
          </div>

          {/* Numéro étudiant & Téléphone */}
          <div className="form-row">
            <div className="form-group">
              <label>N° Étudiant *</label>
              <div className="input-wrapper">
                <Hash size={16} className="input-icon" />
                <input
                  {...register('numero_etudiant')}
                  placeholder="20240001"
                  className={errors.numero_etudiant ? 'error' : ''}
                />
              </div>
              {errors.numero_etudiant && (
                <p className="error-msg"><AlertCircle size={12} />{errors.numero_etudiant.message}</p>
              )}
            </div>

            <div className="form-group">
              <label>Téléphone</label>
              <div className="input-wrapper">
                <Phone size={16} className="input-icon" />
                <input {...register('telephone')} placeholder="77 000 00 00" />
              </div>
            </div>
          </div>

          {/* École (select dynamique) */}
          <div className="form-group">
            <label>Établissement *</label>
            <div className="input-wrapper">
              <School size={16} className="input-icon" />
              <select
                {...register('ecole_id')}
                className={errors.ecole_id ? 'error' : ''}
                disabled={ecolesLoading}
              >
                <option value="">
                  {ecolesLoading ? 'Chargement...' : 'Sélectionner votre établissement...'}
                </option>
                {ecoles.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.sigle ? `${e.sigle} — ${e.nom}` : e.nom}
                  </option>
                ))}
              </select>
            </div>
            {errors.ecole_id && (
              <p className="error-msg"><AlertCircle size={12} />{errors.ecole_id.message}</p>
            )}
            {!ecolesLoading && ecoles.length === 0 && (
              <p className="error-msg" style={{ color: 'var(--warning, #d97706)' }}>
                <AlertCircle size={12} />
                Aucun établissement disponible. Contactez l'administration.
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label>Mot de passe *</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                {...register('mot_de_passe')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Minimum 6 caractères"
                className={errors.mot_de_passe ? 'error' : ''}
              />
              <button type="button" className="input-action" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.mot_de_passe && (
              <p className="error-msg"><AlertCircle size={12} />{errors.mot_de_passe.message}</p>
            )}
          </div>

          {/* Confirmer mot de passe */}
          <div className="form-group">
            <label>Confirmer le mot de passe *</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                {...register('confirmer_mdp')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Répéter le mot de passe"
                className={errors.confirmer_mdp ? 'error' : ''}
              />
              <button type="button" className="input-action" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmer_mdp && (
              <p className="error-msg"><AlertCircle size={12} />{errors.confirmer_mdp.message}</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="spinner" /> : null}
            {loading ? 'Inscription en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-footer">
          Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
