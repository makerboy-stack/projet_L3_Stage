import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LogOut, User, BookOpen, FileText, Clock, CheckCircle,
  XCircle, Building2, GraduationCap, Save, RefreshCw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/* ── helpers ── */
const aptitudeBadge = (a) => {
  if (a === 'apte')     return <span className="badge-status badge-green">✓ Apte à soutenir</span>
  if (a === 'non_apte') return <span className="badge-status badge-red">✗ Non apte</span>
  return <span className="badge-status badge-gray">En attente</span>
}
const statutMemoire = (s) => {
  const m = { non_soumis: ['Non déposé','badge-gray'], soumis: ['Soumis','badge-blue'], valide: ['Validé','badge-green'], rejete: ['Rejeté','badge-red'] }
  const [l, c] = m[s] ?? ['—','badge-gray']
  return <span className={`badge-status ${c}`}>{l}</span>
}
const Row = ({ label, children }) => (
  <div className="info-row"><strong>{label}</strong><span>{children ?? '—'}</span></div>
)

/* ── Timeline ── */
const STEPS = ['Inscrit','Profil complet','Stage déclaré','Encadrant assigné','Mémoire déposé','Apte','Soutenu']
function Timeline({ profil }) {
  const idx = (() => {
    if (!profil) return 0
    if (!profil.profil_complet) return 0
    if (!profil.stage?.a_stage) return 1
    if (!profil.assignation)    return 2
    if (!profil.memoire || profil.memoire.statut === 'non_soumis') return 3
    if (profil.memoire.aptitude !== 'apte') return 4
    return 5
  })()
  return (
    <div className="timeline">
      {STEPS.map((s, i) => (
        <div key={s} style={{ display:'flex', alignItems:'center' }}>
          <div className="tl-step">
            <div className={`tl-dot ${i < idx ? 'done' : i === idx ? 'active' : 'pending'}`}>
              {i < idx ? '✓' : i + 1}
            </div>
            <span className="tl-label">{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`tl-line ${i < idx ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

/* ── Onglet Profil ── */
function OngletProfil({ profil, onSaved }) {
  const [ecoles, setEcoles]       = useState([])
  const [depts, setDepts]         = useState([])
  const [filieres, setFilieres]   = useState([])
  const [form, setForm]           = useState({
    departement_id: profil?.departement_id ?? '',
    filiere_id:     profil?.filiere_id     ?? '',
    niveau:         profil?.niveau         ?? '',
    annee_universitaire: profil?.annee_universitaire ?? '',
    telephone:      profil?.telephone      ?? '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/ecoles').then(r => setEcoles(r.data.data || []))
    if (profil?.ecole_id) {
      api.get(`/structure/departements?ecole_id=${profil.ecole_id}`)
        .then(r => setDepts(r.data.data || []))
    }
    if (form.departement_id) {
      api.get(`/structure/filieres?departement_id=${form.departement_id}`)
        .then(r => setFilieres(r.data.data || []))
    }
  }, [])

  const onDeptChange = async (e) => {
    const id = e.target.value
    setForm(f => ({ ...f, departement_id: id, filiere_id: '', niveau: '' }))
    if (id) {
      const r = await api.get(`/structure/filieres?departement_id=${id}`)
      setFilieres(r.data.data || [])
    } else setFilieres([])
  }

  const niveaux = filieres.find(f => f.id === parseInt(form.filiere_id))?.niveaux ?? ['L1','L2','L3','M1','M2']

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.patch('/profil/moi', {
        ...form,
        departement_id: parseInt(form.departement_id) || null,
        filiere_id: parseInt(form.filiere_id) || null,
      })
      toast.success('Profil mis à jour !')
      onSaved()
    } catch { toast.error('Erreur lors de la sauvegarde.') }
    finally { setSaving(false) }
  }

  return (
    <div className="section-box">
      <h3>Mes informations</h3>
      <div className="info-row" style={{ marginBottom: 16 }}>
        <strong>École</strong>
        <span>{profil?.ecoleInfo ? `${profil.ecoleInfo.sigle ?? ''} — ${profil.ecoleInfo.nom}` : '—'}</span>
      </div>
      <Row label="N° Étudiant">{profil?.numero_etudiant}</Row>
      <Row label="Email">{profil?.email}</Row>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-200)' }}>
        <h3 style={{ marginBottom: 16 }}>Compléter mon profil académique</h3>
        <form onSubmit={submit} className="form-inline">
          <div className="form-row">
            <div>
              <label>Département</label>
              <select value={form.departement_id} onChange={onDeptChange}>
                <option value="">Choisir un département...</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
              {depts.length === 0 && profil?.ecole_id && (
                <p style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginTop:4 }}>Aucun département trouvé pour cette école.</p>
              )}
            </div>
            <div>
              <label>Filière</label>
              <select value={form.filiere_id} onChange={e => setForm(f => ({ ...f, filiere_id: e.target.value, niveau: '' }))} disabled={!form.departement_id}>
                <option value="">Choisir une filière...</option>
                {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Niveau</label>
              <select value={form.niveau} onChange={e => setForm(f => ({ ...f, niveau: e.target.value }))} disabled={!form.filiere_id}>
                <option value="">Choisir un niveau...</option>
                {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label>Année universitaire</label>
              <input value={form.annee_universitaire} onChange={e => setForm(f => ({ ...f, annee_universitaire: e.target.value }))} placeholder="2024-2025" />
            </div>
          </div>
          <div>
            <label>Téléphone</label>
            <input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="77 000 00 00" />
          </div>
          <div>
            <button type="submit" className="btn-save" disabled={saving}>
              <Save size={15} />{saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Onglet Stage ── */
function OngletStage({ profil, onSaved }) {
  const stage = profil?.stage
  const [form, setForm] = useState({
    a_stage:              stage?.a_stage ?? '',
    entreprise:           stage?.entreprise ?? '',
    secteur:              stage?.secteur ?? '',
    sujet:                stage?.sujet ?? '',
    lieu:                 stage?.lieu ?? '',
    date_debut:           stage?.date_debut ?? '',
    date_fin:             stage?.date_fin ?? '',
    encadrant_entreprise: stage?.encadrant_entreprise ?? '',
  })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/stage/declarer', { ...form, a_stage: form.a_stage === 'true' || form.a_stage === true })
      toast.success('Stage enregistré !')
      onSaved()
    } catch { toast.error('Erreur.') }
    finally { setSaving(false) }
  }

  return (
    <div className="section-box">
      <h3>Ma situation de stage</h3>
      <form onSubmit={submit} className="form-inline">
        <div>
          <label>J'ai un stage *</label>
          <select value={form.a_stage.toString()} onChange={e => setForm(f => ({ ...f, a_stage: e.target.value }))}>
            <option value="">Sélectionner...</option>
            <option value="true">Oui, j'ai un stage</option>
            <option value="false">Non, je n'ai pas de stage</option>
          </select>
        </div>

        {(form.a_stage === 'true' || form.a_stage === true) && (
          <>
            <div className="form-row">
              <div><label>Entreprise</label><input value={form.entreprise} onChange={e => setForm(f => ({ ...f, entreprise: e.target.value }))} placeholder="Nom de l'entreprise" /></div>
              <div><label>Secteur</label><input value={form.secteur} onChange={e => setForm(f => ({ ...f, secteur: e.target.value }))} placeholder="Ex: Informatique" /></div>
            </div>
            <div><label>Sujet / Thème</label><input value={form.sujet} onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))} placeholder="Sujet de stage" /></div>
            <div className="form-row">
              <div><label>Lieu</label><input value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))} placeholder="Ville, Pays" /></div>
              <div><label>Encadrant entreprise</label><input value={form.encadrant_entreprise} onChange={e => setForm(f => ({ ...f, encadrant_entreprise: e.target.value }))} placeholder="Nom du responsable" /></div>
            </div>
            <div className="form-row">
              <div><label>Date début</label><input type="date" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} /></div>
              <div><label>Date fin</label><input type="date" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} /></div>
            </div>
          </>
        )}

        <div><button type="submit" className="btn-save" disabled={saving}><Save size={15} />{saving ? 'Enregistrement...' : 'Enregistrer'}</button></div>
      </form>
    </div>
  )
}

/* ── Onglet Mémoire ── */
function OngletMemoire({ profil, onSaved }) {
  const memoire = profil?.memoire
  const [titre, setTitre]   = useState(memoire?.titre ?? '')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.patch('/stage/mon-memoire', { titre })
      toast.success('Mémoire soumis !')
      onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
    finally { setSaving(false) }
  }

  const encadrant = profil?.assignation?.encadrant

  return (
    <div>
      {/* Encadrant */}
      <div className="section-box">
        <h3>Mon encadrant</h3>
        {encadrant ? (
          <div>
            <Row label="Nom">{encadrant.prenom} {encadrant.nom}</Row>
            <Row label="Email">{encadrant.email}</Row>
            <Row label="Grade">{encadrant.grade}</Row>
            <Row label="Spécialité">{encadrant.specialite}</Row>
            <Row label="Téléphone">{encadrant.telephone}</Row>
          </div>
        ) : (
          <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>
            Aucun encadrant assigné pour le moment.
          </p>
        )}
      </div>

      {/* Aptitude */}
      <div className="section-box">
        <h3>Aptitude à soutenir</h3>
        <div className="info-row">
          <strong>Décision</strong>
          <span>{aptitudeBadge(memoire?.aptitude ?? 'en_attente')}</span>
        </div>
        {memoire?.date_decision && <Row label="Date">{new Date(memoire.date_decision).toLocaleDateString('fr-FR')}</Row>}
        {memoire?.motif_refus   && <Row label="Motif">{memoire.motif_refus}</Row>}
        {memoire?.commentaire_encadrant && <Row label="Commentaire">{memoire.commentaire_encadrant}</Row>}
      </div>

      {/* Dépôt mémoire */}
      <div className="section-box">
        <h3>Mon mémoire</h3>
        <div className="info-row" style={{ marginBottom: 16 }}>
          <strong>Statut</strong><span>{statutMemoire(memoire?.statut ?? 'non_soumis')}</span>
        </div>
        {memoire?.date_depot && <Row label="Déposé le">{new Date(memoire.date_depot).toLocaleDateString('fr-FR')}</Row>}

        {(memoire?.aptitude === 'apte' || !memoire || memoire.statut === 'non_soumis') && (
          <form onSubmit={submit} className="form-inline" style={{ marginTop: 16 }}>
            <div>
              <label>Titre du mémoire *</label>
              <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de votre mémoire..." required />
            </div>
            <div><button type="submit" className="btn-save" disabled={saving}><Save size={15} />{saving ? 'Envoi...' : 'Soumettre le mémoire'}</button></div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Dashboard principal ── */
export default function Dashboard() {
  const { user, deconnexion, rafraichirProfil } = useAuth()
  const navigate = useNavigate()
  const [profil, setProfil]   = useState(null)
  const [loadingP, setLoadingP] = useState(true)
  const [onglet, setOnglet]   = useState('accueil')

  const chargerProfil = async () => {
    setLoadingP(true)
    try {
      const res = await api.get('/auth/profil')
      setProfil(res.data.data)
    } catch { /* silencieux */ }
    finally { setLoadingP(false) }
  }

  useEffect(() => { chargerProfil() }, [])

  const handleLogout = () => {
    deconnexion()
    toast.success('Vous avez été déconnecté.')
    navigate('/connexion')
  }

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase()

  const stats = [
    {
      icon: <User size={22} />,
      title: 'Mon profil',
      desc: profil?.filiereInfo ? `${profil.filiereInfo.nom} · ${profil.niveau}` : 'À compléter',
      color: '#2563eb',
      tab: 'profil',
    },
    {
      icon: <Building2 size={22} />,
      title: 'Mon stage',
      desc: profil?.stage?.a_stage
        ? (profil.stage.entreprise || 'Stage déclaré')
        : (profil?.stage ? 'Pas de stage' : 'Non déclaré'),
      color: '#7c3aed',
      tab: 'stage',
    },
    {
      icon: <FileText size={22} />,
      title: 'Mon mémoire',
      desc: profil?.memoire?.titre ?? 'Aucun dépôt',
      color: '#059669',
      tab: 'memoire',
    },
    {
      icon: profil?.memoire?.aptitude === 'apte' ? <CheckCircle size={22} /> :
            profil?.memoire?.aptitude === 'non_apte' ? <XCircle size={22} /> : <Clock size={22} />,
      title: 'Aptitude',
      desc: profil?.memoire?.aptitude === 'apte' ? 'Apte à soutenir' :
            profil?.memoire?.aptitude === 'non_apte' ? 'Non apte' : 'En attente',
      color: profil?.memoire?.aptitude === 'apte' ? '#16a34a' :
             profil?.memoire?.aptitude === 'non_apte' ? '#dc2626' : '#d97706',
      tab: 'memoire',
    },
  ]

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <span className="topbar-brand">🎓 Portail Étudiant</span>
        <div className="topbar-user">
          <div className="avatar">{initiales}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
              {profil?.ecoleInfo?.sigle ?? profil?.ecoleInfo?.nom ?? 'Étudiant'}
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}><LogOut size={14} />Déconnexion</button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Alerte profil incomplet */}
        {!loadingP && profil && !profil.profil_complet && (
          <div className="profile-alert">
            ⚠️ Votre profil est incomplet.{' '}
            <a onClick={() => setOnglet('profil')}>Compléter maintenant →</a>
          </div>
        )}

        {/* Carte de bienvenue */}
        <div className="welcome-card">
          <h2>Bonjour, {user?.prenom} 👋</h2>
          <p>
            {profil?.filiereInfo
              ? `${profil.filiereInfo.nom} · ${profil.niveau ?? ''} · ${profil.annee_universitaire ?? ''}`
              : 'Bienvenue sur votre espace de gestion de stage et de mémoire.'}
          </p>
          <span className="badge-role">Étudiant</span>
        </div>

        {/* Tabs de navigation */}
        <div className="tab-bar">
          {[
            { key: 'accueil', label: '🏠 Accueil' },
            { key: 'profil',  label: '👤 Profil' },
            { key: 'stage',   label: '🏢 Stage' },
            { key: 'memoire', label: '📄 Mémoire' },
          ].map(t => (
            <button key={t.key} className={`tab-btn ${onglet === t.key ? 'active' : ''}`} onClick={() => setOnglet(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu par onglet */}
        {onglet === 'accueil' && (
          <div>
            {/* Cards stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
              {stats.map(s => (
                <div
                  key={s.title}
                  onClick={() => setOnglet(s.tab)}
                  style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-700)', marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="section-box">
              <h3>Progression</h3>
              {loadingP
                ? <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner" style={{ borderColor: '#93c5fd30', borderTopColor: '#2563eb', margin: '0 auto' }} /></div>
                : <Timeline profil={profil} />
              }
            </div>

            {/* Encadrant rapide */}
            {profil?.assignation?.encadrant && (
              <div className="section-box" style={{ marginTop: 16 }}>
                <h3>Mon encadrant</h3>
                <Row label="Nom">{profil.assignation.encadrant.prenom} {profil.assignation.encadrant.nom}</Row>
                <Row label="Email">{profil.assignation.encadrant.email}</Row>
                <Row label="Grade">{profil.assignation.encadrant.grade}</Row>
              </div>
            )}
          </div>
        )}

        {onglet === 'profil'  && !loadingP && <OngletProfil  profil={profil} onSaved={chargerProfil} />}
        {onglet === 'stage'   && !loadingP && <OngletStage   profil={profil} onSaved={chargerProfil} />}
        {onglet === 'memoire' && !loadingP && <OngletMemoire profil={profil} onSaved={chargerProfil} />}

        {loadingP && onglet !== 'accueil' && (
          <div style={{ textAlign:'center', padding: 48 }}>
            <div className="spinner" style={{ borderColor: '#93c5fd30', borderTopColor: '#2563eb', width: 36, height: 36, margin: '0 auto' }} />
          </div>
        )}
      </main>
    </div>
  )
}
