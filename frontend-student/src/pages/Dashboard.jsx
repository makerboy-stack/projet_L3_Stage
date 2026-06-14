import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LogOut, User, FileText, Clock, CheckCircle,
  XCircle, Building2, Save, Trash2, ExternalLink,
  Send, MessageSquare, RefreshCw, Pencil,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/* ── helpers ── */
const aptBadge = (a) => {
  if (a === 'apte')     return <span className="badge-status badge-green">✓ Apte à soutenir</span>
  if (a === 'non_apte') return <span className="badge-status badge-red">✗ Non apte</span>
  return <span className="badge-status badge-gray">⏳ En attente de décision</span>
}
const memBadge = (s) => {
  const M = { non_soumis:['Non déposé','badge-gray'], soumis:['Soumis','badge-blue'], valide:['Validé','badge-green'], rejete:['Rejeté','badge-red'] }
  const [l,c] = M[s] ?? ['—','badge-gray']
  return <span className={`badge-status ${c}`}>{l}</span>
}
const Row = ({ label, children }) => (
  <div className="info-row"><strong>{label}</strong><span>{children ?? '—'}</span></div>
)
const Spinner = ({ color = '#2563eb' }) => (
  <div style={{ textAlign:'center', padding:40 }}>
    <div className="spinner" style={{ borderColor: color+'30', borderTopColor: color, width:34, height:34, margin:'0 auto' }} />
  </div>
)

/* ── Timeline ── */
const STEPS = ['Inscrit','Profil complet','Stage déclaré','Encadrant assigné','Mémoire déposé','Apte','Soutenu']
function Timeline({ profil }) {
  const idx = (() => {
    if (!profil?.profil_complet) return 0
    if (!profil.stage?.a_stage)  return 1
    if (!profil.assignation)      return 2
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
          {i < STEPS.length-1 && <div className={`tl-line ${i < idx ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   ONGLET PROFIL
══════════════════════════════════════════ */
function OngletProfil({ profil, onSaved }) {
  const [depts,    setDepts]   = useState([])
  const [filieres, setFilieres]= useState([])
  const [form, setForm] = useState({
    departement_id:      profil?.departement_id      ?? '',
    filiere_id:          profil?.filiere_id          ?? '',
    niveau:              profil?.niveau              ?? '',
    annee_universitaire: profil?.annee_universitaire ?? '',
    telephone:           profil?.telephone           ?? '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profil?.ecole_id)
      api.get(`/structure/departements?ecole_id=${profil.ecole_id}`).then(r => setDepts(r.data.data || []))
    if (profil?.departement_id)
      api.get(`/structure/filieres?departement_id=${profil.departement_id}`).then(r => setFilieres(r.data.data || []))
  }, [])

  const onDeptChange = async (e) => {
    const id = e.target.value
    setForm(f => ({ ...f, departement_id: id, filiere_id: '', niveau: '' }))
    if (id) {
      const r = await api.get(`/structure/filieres?departement_id=${id}`)
      setFilieres(r.data.data || [])
    } else setFilieres([])
  }

  // niveaux peut être une string JSON ou un tableau selon MySQL/Sequelize
  const parseNiveaux = (val) => {
    if (!val) return ['L1','L2','L3','M1','M2']
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) } catch { return ['L1','L2','L3','M1','M2'] }
  }
  const niveaux = parseNiveaux(filieres.find(f => f.id === parseInt(form.filiere_id))?.niveaux)

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.patch('/profil/moi', {
        ...form,
        departement_id: parseInt(form.departement_id) || null,
        filiere_id:     parseInt(form.filiere_id)     || null,
      })
      toast.success('Profil mis à jour !')
      onSaved()
    } catch { toast.error('Erreur lors de la sauvegarde.') }
    finally { setSaving(false) }
  }

  return (
    <div className="section-box">
      <h3>Mes informations</h3>
      {/* École complète */}
      <Row label="École">{profil?.ecoleInfo?.nom ?? '—'}</Row>
      <Row label="N° Étudiant">{profil?.numero_etudiant}</Row>
      <Row label="Email">{profil?.email}</Row>

      <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid var(--gray-200)' }}>
        <h3 style={{ marginBottom:16 }}>Compléter mon profil académique</h3>
        <form onSubmit={submit} className="form-inline">
          <div className="form-row">
            <div>
              <label>Département</label>
              <select value={form.departement_id} onChange={onDeptChange}>
                <option value="">Choisir un département...</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
              {depts.length === 0 && profil?.ecole_id && (
                <p style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginTop:4 }}>
                  Aucun département dans cette école — contactez l'administration.
                </p>
              )}
            </div>
            <div>
              <label>Filière</label>
              <select value={form.filiere_id} onChange={e => setForm(f=>({...f,filiere_id:e.target.value,niveau:''}))} disabled={!form.departement_id}>
                <option value="">Choisir une filière...</option>
                {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Niveau</label>
              <select value={form.niveau} onChange={e => setForm(f=>({...f,niveau:e.target.value}))} disabled={!form.filiere_id}>
                <option value="">Choisir un niveau...</option>
                {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label>Année universitaire</label>
              <input value={form.annee_universitaire} onChange={e => setForm(f=>({...f,annee_universitaire:e.target.value}))} placeholder="2024-2025" />
            </div>
          </div>
          <div>
            <label>Téléphone</label>
            <input value={form.telephone} onChange={e => setForm(f=>({...f,telephone:e.target.value}))} placeholder="77 000 00 00" />
          </div>
          <button type="submit" className="btn-save" disabled={saving}>
            <Save size={15} />{saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   ONGLET STAGE
══════════════════════════════════════════ */
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
  const s = f => setForm(p => ({ ...p, ...f }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/stage/declarer', { ...form, a_stage: form.a_stage === 'true' || form.a_stage === true })
      toast.success('Stage enregistré !'); onSaved()
    } catch { toast.error('Erreur.') }
    finally { setSaving(false) }
  }

  return (
    <div className="section-box">
      <h3>Ma situation de stage</h3>
      <form onSubmit={submit} className="form-inline">
        <div>
          <label>Avez-vous un stage ? *</label>
          <select value={form.a_stage.toString()} onChange={e => s({ a_stage: e.target.value })}>
            <option value="">Sélectionner...</option>
            <option value="true">Oui, j'ai un stage</option>
            <option value="false">Non, je n'ai pas de stage</option>
          </select>
        </div>
        {(form.a_stage === 'true' || form.a_stage === true) && <>
          <div className="form-row">
            <div><label>Entreprise</label><input value={form.entreprise} onChange={e=>s({entreprise:e.target.value})} placeholder="Nom de l'entreprise" /></div>
            <div><label>Secteur</label><input value={form.secteur} onChange={e=>s({secteur:e.target.value})} placeholder="Ex: Informatique" /></div>
          </div>
          <div><label>Sujet / Thème de stage</label><input value={form.sujet} onChange={e=>s({sujet:e.target.value})} placeholder="Intitulé du stage" /></div>
          <div className="form-row">
            <div><label>Lieu</label><input value={form.lieu} onChange={e=>s({lieu:e.target.value})} placeholder="Ville, Pays" /></div>
            <div><label>Encadrant entreprise</label><input value={form.encadrant_entreprise} onChange={e=>s({encadrant_entreprise:e.target.value})} placeholder="Nom du responsable" /></div>
          </div>
          <div className="form-row">
            <div><label>Date début</label><input type="date" value={form.date_debut} onChange={e=>s({date_debut:e.target.value})} /></div>
            <div><label>Date fin</label><input type="date" value={form.date_fin} onChange={e=>s({date_fin:e.target.value})} /></div>
          </div>
        </>}
        <button type="submit" className="btn-save" disabled={saving}>
          <Save size={15} />{saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════
   ONGLET MÉMOIRE
══════════════════════════════════════════ */
function OngletMemoire({ profil, onSaved }) {
  const memoire        = profil?.memoire
  const encadrant      = profil?.assignation?.encadrant
  const decisionRendue = memoire?.aptitude !== 'en_attente' && memoire?.aptitude != null
  const peutModifier   = !decisionRendue

  const [modeDepot, setModeDepot] = useState(memoire?.type_depot ?? 'fichier')
  const [titre,     setTitre]     = useState(memoire?.titre ?? '')
  const [lien,      setLien]      = useState(memoire?.type_depot === 'lien' ? (memoire?.fichier_url ?? '') : '')
  const [fichier,   setFichier]   = useState(null)   // File object
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [editing,   setEditing]   = useState(false)
  const fileInputRef = useRef(null)

  const resetForm = () => {
    setEditing(false)
    setFichier(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!titre.trim()) return toast.error('Le titre est obligatoire.')
    if (modeDepot === 'lien'    && !lien.trim())   return toast.error('Le lien est obligatoire.')
    if (modeDepot === 'fichier' && !fichier && !(memoire?.fichier_url)) return toast.error('Sélectionnez un fichier PDF ou Word.')

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('titre', titre)
      if (modeDepot === 'lien') {
        formData.append('lien', lien)
      } else if (fichier) {
        formData.append('fichier', fichier)
      }

      await api.patch('/stage/mon-memoire', formData)

      toast.success('Mémoire soumis avec succès !')
      resetForm()
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer le mémoire déposé ?')) return
    setDeleting(true)
    try {
      await api.delete('/stage/mon-memoire')
      toast.success('Mémoire supprimé.')
      onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
    finally { setDeleting(false) }
  }

  const onFichierChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const typesOk = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!typesOk.includes(f.type)) {
      toast.error('Seuls les fichiers PDF et Word (.doc, .docx) sont acceptés.')
      e.target.value = ''
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('Fichier trop volumineux. Maximum 20 Mo.')
      e.target.value = ''
      return
    }
    setFichier(f)
  }

  // URL complète pour téléchargement
  const getDownloadUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:5000${url}`
  }

  const showForm = !memoire || memoire.statut === 'non_soumis' || editing

  return (
    <div>
      {/* Encadrant */}
      <div className="section-box">
        <h3>Mon encadrant</h3>
        {encadrant ? (
          <>
            <Row label="Nom">{encadrant.prenom} {encadrant.nom}</Row>
            <Row label="Email">{encadrant.email}</Row>
            <Row label="Grade">{encadrant.grade}</Row>
            <Row label="Spécialité">{encadrant.specialite}</Row>
            <Row label="Téléphone">{encadrant.telephone}</Row>
          </>
        ) : (
          <p style={{ color:'var(--gray-400)', fontSize:'0.875rem' }}>Aucun encadrant assigné.</p>
        )}
      </div>

      {/* Aptitude */}
      <div className="section-box">
        <h3>Aptitude à soutenir</h3>
        <Row label="Décision">{aptBadge(memoire?.aptitude ?? 'en_attente')}</Row>
        {memoire?.date_decision && <Row label="Date">{new Date(memoire.date_decision).toLocaleDateString('fr-FR')}</Row>}
        {memoire?.motif_refus   && <Row label="Motif">{memoire.motif_refus}</Row>}
        {memoire?.commentaire_encadrant && (
          <div style={{ marginTop:12, background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:8, padding:'12px 16px' }}>
            <p style={{ fontSize:'0.8rem', color:'#0369a1', fontWeight:600, marginBottom:4 }}>💬 Commentaire de l'encadrant</p>
            <p style={{ fontSize:'0.875rem', color:'#0c4a6e' }}>{memoire.commentaire_encadrant}</p>
          </div>
        )}
      </div>

      {/* Mémoire */}
      <div className="section-box">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h3 style={{ marginBottom:0 }}>Mon mémoire</h3>
          {memoire && memoire.statut !== 'non_soumis' && peutModifier && !editing && (
            <div style={{ display:'flex', gap:8 }}>
              <button
                className="btn-save"
                style={{ padding:'6px 12px', fontSize:'0.8rem', borderRadius:7, background:'#6b7280' }}
                onClick={() => {
                  setEditing(true)
                  setModeDepot(memoire.type_depot ?? 'fichier')
                  setTitre(memoire.titre ?? '')
                  setLien(memoire.type_depot === 'lien' ? (memoire.fichier_url ?? '') : '')
                  setFichier(null)
                }}
              >
                <Pencil size={13} />Modifier
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'var(--danger)', color:'white', border:'none', borderRadius:7, fontSize:'0.8rem', cursor:'pointer' }}
              >
                <Trash2 size={13} />{deleting ? '...' : 'Supprimer'}
              </button>
            </div>
          )}
          {decisionRendue && (
            <span className="badge-status badge-orange" style={{ fontSize:'0.72rem' }}>
              🔒 Dépôt verrouillé — décision rendue
            </span>
          )}
        </div>

        {/* Affichage du mémoire existant */}
        {memoire && memoire.statut !== 'non_soumis' && !editing && (
          <div style={{ marginBottom:16 }}>
            <Row label="Statut">{memBadge(memoire.statut)}</Row>
            <Row label="Titre">{memoire.titre}</Row>
            <Row label="Déposé le">{memoire.date_depot ? new Date(memoire.date_depot).toLocaleDateString('fr-FR') : '—'}</Row>
            <Row label="Type">{memoire.type_depot === 'fichier' ? '📄 Fichier uploadé' : '🔗 Lien externe'}</Row>
            {memoire.fichier_url && (
              <div className="info-row">
                <strong>Document</strong>
                <a
                  href={getDownloadUrl(memoire.fichier_url)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color:'var(--primary)', display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.875rem', fontWeight:500 }}
                >
                  <ExternalLink size={14} />
                  {memoire.type_depot === 'fichier' ? 'Télécharger le fichier' : 'Ouvrir le lien'}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Formulaire de dépôt */}
        {showForm && !decisionRendue && (
          <form onSubmit={submit} className="form-inline">
            {editing && (
              <div style={{ background:'#fef9c3', border:'1px solid #fde047', borderRadius:8, padding:'10px 14px', fontSize:'0.82rem', color:'#854d0e' }}>
                ⚠️ Vous modifiez votre mémoire. La décision de l'encadrant sera réinitialisée.
              </div>
            )}

            {/* Titre */}
            <div>
              <label>Titre du mémoire *</label>
              <input
                value={titre}
                onChange={e => setTitre(e.target.value)}
                placeholder="Titre complet de votre mémoire..."
                required
              />
            </div>

            {/* Mode de dépôt */}
            <div>
              <label>Mode de dépôt *</label>
              <div style={{ display:'flex', gap:16, marginTop:6, flexWrap:'wrap' }}>
                {[
                  { val:'fichier', label:'📄 Uploader un fichier (PDF ou Word)' },
                  { val:'lien',    label:'🔗 Lien externe (Google Drive, OneDrive…)' },
                ].map(opt => (
                  <label key={opt.val} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:'normal', color:'var(--gray-700)', fontSize:'0.875rem' }}>
                    <input
                      type="radio"
                      name="modeDepot"
                      value={opt.val}
                      checked={modeDepot === opt.val}
                      onChange={() => { setModeDepot(opt.val); setFichier(null); setLien(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      style={{ width:'auto', padding:0 }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Upload fichier */}
            {modeDepot === 'fichier' && (
              <div>
                <label>Fichier PDF ou Word *</label>
                <div style={{ marginTop:6 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={onFichierChange}
                    style={{ display:'block', fontSize:'0.875rem', color:'var(--gray-700)' }}
                  />
                  {fichier && (
                    <div style={{ marginTop:8, padding:'8px 12px', background:'#f0fdf4', border:'1px solid #86efac', borderRadius:8, fontSize:'0.82rem', color:'#15803d', display:'flex', alignItems:'center', gap:8 }}>
                      ✅ {fichier.name} ({(fichier.size / 1024 / 1024).toFixed(2)} Mo)
                    </div>
                  )}
                  {!fichier && editing && memoire?.type_depot === 'fichier' && (
                    <p style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginTop:4 }}>
                      Laissez vide pour conserver le fichier actuel.
                    </p>
                  )}
                  <p style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginTop:4 }}>
                    Formats acceptés : PDF, DOC, DOCX — Maximum 20 Mo
                  </p>
                </div>
              </div>
            )}

            {/* Lien externe */}
            {modeDepot === 'lien' && (
              <div>
                <label>Lien vers le mémoire *</label>
                <input
                  value={lien}
                  onChange={e => setLien(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  required
                />
                <p style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginTop:4 }}>
                  Partagez le lien de votre document depuis Google Drive, OneDrive, Dropbox, etc.
                  Assurez-vous que le lien est accessible par votre encadrant.
                </p>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', background:'white', border:'1.5px solid var(--gray-200)', borderRadius:8, fontSize:'0.875rem', cursor:'pointer', color:'var(--gray-600)' }}
                >
                  Annuler
                </button>
              )}
              <button type="submit" className="btn-save" disabled={saving}>
                <FileText size={15} />
                {saving ? 'Envoi...' : (editing ? 'Mettre à jour' : 'Soumettre le mémoire')}
              </button>
            </div>
          </form>
        )}

        {!showForm && !memoire && (
          <p style={{ color:'var(--gray-400)', fontSize:'0.875rem' }}>Aucun mémoire déposé.</p>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   ONGLET MESSAGES
══════════════════════════════════════════ */
function OngletMessages({ profil }) {
  const encadrant = profil?.assignation?.encadrant
  const [messages, setMessages] = useState([])
  const [texte,    setTexte]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef(null)

  const charger = async () => {
    if (!encadrant) return
    setLoading(true)
    try {
      const r = await api.get(`/messages/${encadrant.id}`)
      setMessages(r.data.data || [])
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  useEffect(() => { charger() }, [encadrant?.id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const envoyer = async (e) => {
    e.preventDefault()
    if (!texte.trim() || !encadrant) return
    setSending(true)
    try {
      await api.post(`/messages/${encadrant.id}`, { contenu: texte.trim() })
      setTexte('')
      charger()
    } catch { toast.error('Erreur.') }
    finally { setSending(false) }
  }

  if (!encadrant) return (
    <div className="section-box" style={{ textAlign:'center', color:'var(--gray-400)', padding:48 }}>
      <MessageSquare size={40} style={{ marginBottom:12, opacity:0.3 }} />
      <p>Vous n'avez pas encore d'encadrant assigné.</p>
      <p style={{ fontSize:'0.8rem', marginTop:6 }}>Les échanges seront disponibles une fois un encadrant assigné.</p>
    </div>
  )

  return (
    <div className="section-box" style={{ padding:0 }}>
      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontWeight:700, color:'var(--gray-800)' }}>
            💬 {encadrant.prenom} {encadrant.nom}
            {encadrant.grade && <span style={{ fontWeight:400, color:'var(--gray-400)', fontSize:'0.82rem', marginLeft:8 }}>({encadrant.grade})</span>}
          </div>
          <div style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>Votre encadrant</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={charger}><RefreshCw size={14} /></button>
      </div>

      {/* Messages */}
      <div style={{ height:360, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
        {loading ? <Spinner /> : messages.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--gray-400)', margin:'auto' }}>
            <p style={{ fontSize:'0.875rem' }}>Aucun message. Commencez la conversation !</p>
          </div>
        ) : messages.map(m => {
          const estMoi = m.expediteur_id !== encadrant.id
          return (
            <div key={m.id} style={{ display:'flex', justifyContent: estMoi ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth:'70%', padding:'10px 14px', borderRadius: estMoi ? '14px 14px 0 14px' : '14px 14px 14px 0',
                background: estMoi ? 'var(--primary)' : 'var(--gray-100)',
                color: estMoi ? 'white' : 'var(--gray-800)',
                fontSize:'0.875rem', lineHeight:1.5,
              }}>
                <p>{m.contenu}</p>
                <p style={{ fontSize:'0.7rem', opacity:0.65, marginTop:4, textAlign: estMoi ? 'right' : 'left' }}>
                  {new Date(m.created_at).toLocaleString('fr-FR', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={envoyer} style={{ padding:'12px 20px', borderTop:'1px solid var(--gray-200)', display:'flex', gap:10 }}>
        <input
          value={texte}
          onChange={e=>setTexte(e.target.value)}
          placeholder="Écrire un message à votre encadrant..."
          style={{ flex:1, padding:'9px 14px', border:'1.5px solid var(--gray-200)', borderRadius:8, outline:'none', fontSize:'0.875rem' }}
          onFocus={e=>e.target.style.borderColor='var(--primary)'}
          onBlur={e=>e.target.style.borderColor='var(--gray-200)'}
        />
        <button type="submit" disabled={sending || !texte.trim()} className="btn-save" style={{ padding:'9px 16px', borderRadius:8, flexShrink:0 }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════
   DASHBOARD PRINCIPAL
══════════════════════════════════════════ */
export default function Dashboard() {
  const { user, deconnexion } = useAuth()
  const navigate = useNavigate()
  const [profil,   setProfil]   = useState(null)
  const [loadingP, setLoadingP] = useState(true)
  const [onglet,   setOnglet]   = useState('accueil')

  const chargerProfil = async () => {
    setLoadingP(true)
    try { const r = await api.get('/auth/profil'); setProfil(r.data.data) }
    catch { /* silencieux */ }
    finally { setLoadingP(false) }
  }

  useEffect(() => { chargerProfil() }, [])

  const handleLogout = () => { deconnexion(); toast.success('Déconnecté.'); navigate('/connexion') }
  const initiales = `${user?.prenom?.[0]??''}${user?.nom?.[0]??''}`.toUpperCase()

  const cards = [
    { icon:<User size={22}/>, title:'Mon profil', desc: profil?.filiereInfo ? `${profil.filiereInfo.nom} · ${profil.niveau}` : 'À compléter', color:'#2563eb', tab:'profil' },
    { icon:<Building2 size={22}/>, title:'Mon stage', desc: profil?.stage?.a_stage ? (profil.stage.entreprise||'Stage déclaré') : (profil?.stage?'Pas de stage':'Non déclaré'), color:'#7c3aed', tab:'stage' },
    { icon:<FileText size={22}/>, title:'Mon mémoire', desc: profil?.memoire?.titre??'Aucun dépôt', color:'#059669', tab:'memoire' },
    {
      icon: profil?.memoire?.aptitude==='apte'?<CheckCircle size={22}/>:profil?.memoire?.aptitude==='non_apte'?<XCircle size={22}/>:<Clock size={22}/>,
      title:'Aptitude',
      desc: profil?.memoire?.aptitude==='apte'?'Apte à soutenir':profil?.memoire?.aptitude==='non_apte'?'Non apte':'En attente',
      color: profil?.memoire?.aptitude==='apte'?'#16a34a':profil?.memoire?.aptitude==='non_apte'?'#dc2626':'#d97706',
      tab:'memoire',
    },
  ]

  const TABS = [
    { key:'accueil', label:'🏠 Accueil' },
    { key:'profil',  label:'👤 Profil' },
    { key:'stage',   label:'🏢 Stage' },
    { key:'memoire', label:'📄 Mémoire' },
    { key:'messages',label:'💬 Messages' },
  ]

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <span className="topbar-brand">🎓 Portail Étudiant</span>
        <div className="topbar-user">
          <div className="avatar">{initiales}</div>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>{profil?.ecoleInfo?.nom ?? 'Étudiant'}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}><LogOut size={14} />Déconnexion</button>
        </div>
      </header>

      <main className="dashboard-content">
        {!loadingP && profil && !profil.profil_complet && (
          <div className="profile-alert">
            ⚠️ Votre profil est incomplet.{' '}
            <a onClick={()=>setOnglet('profil')} style={{ cursor:'pointer' }}>Compléter maintenant →</a>
          </div>
        )}

        <div className="welcome-card">
          <h2>Bonjour, {user?.prenom} 👋</h2>
          <p>
            {profil?.filiereInfo
              ? `${profil.filiereInfo.nom} · ${profil.niveau??''} · ${profil.annee_universitaire??''}`
              : 'Bienvenue sur votre espace de gestion de stage et de mémoire.'}
          </p>
          <span className="badge-role">Étudiant</span>
        </div>

        <div className="tab-bar">
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn ${onglet===t.key?'active':''}`} onClick={()=>setOnglet(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {onglet === 'accueil' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
              {cards.map(s => (
                <div key={s.title} onClick={()=>setOnglet(s.tab)}
                  style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:12, padding:20, display:'flex', alignItems:'flex-start', gap:14, cursor:'pointer', transition:'box-shadow 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                  <div style={{ width:44, height:44, borderRadius:10, background:s.color+'15', color:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-700)', marginBottom:2 }}>{s.title}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--gray-400)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-box">
              <h3>Progression</h3>
              {loadingP ? <Spinner /> : <Timeline profil={profil} />}
            </div>
            {profil?.assignation?.encadrant && (
              <div className="section-box" style={{ marginTop:16 }}>
                <h3>Mon encadrant</h3>
                <Row label="Nom">{profil.assignation.encadrant.prenom} {profil.assignation.encadrant.nom}</Row>
                <Row label="Email">{profil.assignation.encadrant.email}</Row>
                <Row label="Grade">{profil.assignation.encadrant.grade}</Row>
              </div>
            )}
          </div>
        )}

        {loadingP && onglet !== 'accueil' ? <Spinner /> : (
          <>
            {onglet==='profil'   && <OngletProfil   profil={profil} onSaved={chargerProfil} />}
            {onglet==='stage'    && <OngletStage    profil={profil} onSaved={chargerProfil} />}
            {onglet==='memoire'  && <OngletMemoire  profil={profil} onSaved={chargerProfil} />}
            {onglet==='messages' && <OngletMessages profil={profil} />}
          </>
        )}
      </main>
    </div>
  )
}
