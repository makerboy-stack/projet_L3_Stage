import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  Mail, Lock, Eye, EyeOff, GraduationCap,
  AlertCircle, BookOpen, FileText, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Email invalide'),
  mot_de_passe: z.string().min(1, 'Mot de passe obligatoire'),
});

const Connexion = () => {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, mot_de_passe }) => {
    setApiError('');
    setLoading(true);
    try {
      await connexion(email, mot_de_passe);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* ── Panneau gauche ── */}
      <div className="auth-split-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <GraduationCap size={36} />
          </div>
          <h1>GestStage</h1>
          <p>Votre espace personnel pour gérer votre stage et votre mémoire, de bout en bout.</p>
        </div>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon"><BookOpen size={18} /></div>
            <div>
              <strong>Déclarez votre stage</strong>
              <span>Saisissez les informations de votre stage en entreprise</span>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><FileText size={18} /></div>
            <div>
              <strong>Soumettez votre mémoire</strong>
              <span>Déposez votre document pour évaluation par votre encadrant</span>
            </div>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon"><CheckCircle size={18} /></div>
            <div>
              <strong>Suivez votre progression</strong>
              <span>Visualisez chaque étape de votre parcours académique</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div className="auth-split-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <span className="auth-badge">Espace Étudiant</span>
            <h2>Bon retour !</h2>
            <p>Connectez-vous pour accéder à votre tableau de bord</p>
          </div>

          {apiError && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label>Adresse email</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="votre@email.fr"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && (
                <p className="error-msg"><AlertCircle size={12} />{errors.email.message}</p>
              )}
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  {...register('mot_de_passe')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
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

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/mot-de-passe-oublie" className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <div className="spinner" /> : null}
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-footer">
            Pas encore de compte ?{' '}
            <Link to="/inscription">Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
