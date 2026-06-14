import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
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
      const msg = err.response?.data?.message || err.message || 'Erreur de connexion.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <GraduationCap size={32} />
          </div>
          <h1>Connexion Étudiant</h1>
          <p>Gestion des Stages & Mémoires</p>
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
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                {...register('email')}
                type="email"
                placeholder="votre@email.fr"
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
                placeholder="Votre mot de passe"
                className={errors.mot_de_passe ? 'error' : ''}
              />
              <button type="button" className="input-action" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.mot_de_passe && <p className="error-msg"><AlertCircle size={12} />{errors.mot_de_passe.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="spinner" /> : null}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer">
          Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: 8 }}>
          <Link to="/mot-de-passe-oublie" style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
