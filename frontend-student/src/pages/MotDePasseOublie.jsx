import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

export default function MotDePasseOublie() {
  const [etape, setEtape] = useState(1)   // 1 = saisir email, 2 = saisir code + nouveau mdp
  const [email, setEmail]     = useState('')
  const [code,  setCode]      = useState('')
  const [codeDev, setCodeDev] = useState('')  // code retourné en mode dev
  const [mdp,   setMdp]       = useState('')
  const [mdp2,  setMdp2]      = useState('')
  const [showMdp,  setShowMdp]  = useState(false)
  const [showMdp2, setShowMdp2] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  const etape1 = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/mot-de-passe-oublie', { email })
      // En dev, le code est retourné dans la réponse
      if (res.data.code_dev) setCodeDev(res.data.code_dev)
      toast.success('Code généré ! Saisissez-le ci-dessous.')
      setEtape(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur.')
    } finally { setLoading(false) }
  }

  const etape2 = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    if (mdp !== mdp2) { setError('Les mots de passe ne correspondent pas.'); setLoading(false); return }
    if (mdp.length < 6) { setError('Minimum 6 caractères.'); setLoading(false); return }
    try {
      await api.post('/auth/reinitialiser-mot-de-passe', { email, code, nouveau_mot_de_passe: mdp })
      setSuccess(true)
      toast.success('Mot de passe réinitialisé !')
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect ou expiré.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><KeyRound size={32} /></div>
          <h1>Mot de passe oublié</h1>
          <p>Portail Étudiant — Stages & Mémoires</p>
        </div>
        <div style={{ textAlign:'center' }}><span className="auth-badge">Espace Étudiant</span></div>

        {success ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin:'0 auto 16px', display:'block' }} />
            <p style={{ fontWeight:700, color:'var(--gray-800)', marginBottom:8 }}>Mot de passe réinitialisé !</p>
            <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:20 }}>
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Link to="/connexion" className="btn btn-primary" style={{ textDecoration:'none', display:'inline-flex' }}>
              Se connecter
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-error"><AlertCircle size={16} /><span>{error}</span></div>}

            {etape === 1 ? (
              <form onSubmit={etape1} noValidate>
                <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:20 }}>
                  Entrez votre adresse email pour recevoir un code de réinitialisation.
                </p>
                <div className="form-group">
                  <label>Adresse email *</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.fr" required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <div className="spinner" /> : null}
                  {loading ? 'Envoi...' : 'Envoyer le code'}
                </button>
              </form>
            ) : (
              <form onSubmit={etape2} noValidate>
                {codeDev && (
                  <div style={{ background:'#fef9c3', border:'1px solid #fde047', borderRadius:8, padding:'10px 14px', fontSize:'0.82rem', color:'#854d0e', marginBottom:16 }}>
                    <strong>🔑 Code (mode développement) :</strong> {codeDev}
                    <br/><span style={{ fontSize:'0.75rem' }}>En production, ce code sera envoyé par email.</span>
                  </div>
                )}
                <div className="form-group">
                  <label>Code de vérification *</label>
                  <div className="input-wrapper">
                    <KeyRound size={16} className="input-icon" />
                    <input value={code} onChange={e=>setCode(e.target.value)} placeholder="123456" maxLength={6} required style={{ letterSpacing:'0.2em', fontWeight:700 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Nouveau mot de passe *</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input type={showMdp?'text':'password'} value={mdp} onChange={e=>setMdp(e.target.value)} placeholder="Minimum 6 caractères" required />
                    <button type="button" className="input-action" onClick={()=>setShowMdp(!showMdp)}>{showMdp?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirmer le mot de passe *</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input type={showMdp2?'text':'password'} value={mdp2} onChange={e=>setMdp2(e.target.value)} placeholder="Répéter le mot de passe" required />
                    <button type="button" className="input-action" onClick={()=>setShowMdp2(!showMdp2)}>{showMdp2?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <div className="spinner" /> : null}
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
                <button type="button" onClick={()=>{setEtape(1);setError('');setCode('');setMdp('');setMdp2('')}}
                  style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'var(--gray-500)', cursor:'pointer', fontSize:'0.875rem', marginTop:10, padding:0 }}>
                  <ArrowLeft size={14} />Changer d'email
                </button>
              </form>
            )}

            <div className="auth-footer">
              <Link to="/connexion">← Retour à la connexion</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
