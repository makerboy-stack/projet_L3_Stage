import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LogOut, Users, BookOpen, CheckCircle, XCircle,
  ClipboardList, Save, Search, UserPlus, UserMinus,
  RefreshCw, GraduationCap, AlertTriangle,
  MessageSquare, Send, ExternalLink, ArrowLeft, Paperclip,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/* ─────────────────────────────── helpers ── */
const ROLE_LABELS = {
  encadrant: 'Encadrant',
  responsable_pedagogique: 'Responsable Pédagogique',
}

// Construit l'URL complète pour les fichiers uploadés sur le backend
const getFileUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `http://localhost:5000${url}`
}

const aptitudeBadge = (a) => {
  if (a === 'apte')     return <span className="badge-status badge-green">✓ Apte</span>
  if (a === 'non_apte') return <span className="badge-status badge-red">✗ Non apte</span>
  return <span className="badge-status badge-gray">En attente</span>
}

const statutMemBadge = (s) => {
  const MAP = {
    non_soumis: ['Non déposé', 'badge-gray'],
    soumis:     ['Soumis',     'badge-blue'],
    valide:     ['Validé',     'badge-green'],
    rejete:     ['Rejeté',     'badge-red'],
  }
  const [l, c] = MAP[s] ?? ['—', 'badge-gray']
  return <span className={`badge-status ${c}`}>{l}</span>
}

function Row({ label, children }) {
  return (
    <div className="info-row">
      <strong>{label}</strong>
      <span>{children ?? '—'}</span>
    </div>
  )
}

/* ══════════════════════════════════════════
   CONVERSATION ENCADRANT ↔ ÉTUDIANT
══════════════════════════════════════════ */
function ConversationEncadrant({ etudiant, onBack }) {
  const [messages, setMessages] = useState([])
  const [texte,    setTexte]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef(null)

  const charger = async () => {
    setLoading(true)
    try {
      const r = await api.get(`/messages/${etudiant.id}`)
      setMessages(r.data.data || [])
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  useEffect(() => { charger() }, [etudiant.id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const envoyer = async (e) => {
    e.preventDefault()
    if (!texte.trim()) return
    setSending(true)
    try {
      await api.post(`/messages/${etudiant.id}`, { contenu: texte.trim() })
      setTexte('')
      charger()
    } catch { toast.error('Erreur.') }
    finally { setSending(false) }
  }

  return (
    <div className="section-box" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '6px 10px' }}>
          <ArrowLeft size={16} />Retour
        </button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
          {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{etudiant.prenom} {etudiant.nom}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
            {etudiant.filiereInfo?.nom ?? '—'} · {etudiant.niveau ?? '—'}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={charger}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ height: 360, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <div className="spinner" style={{ borderColor: '#7c3aed30', borderTopColor: '#7c3aed', width: 28, height: 28, margin: '0 auto' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', margin: 'auto' }}>
            <p style={{ fontSize: '0.875rem' }}>Aucun message. Commencez la conversation !</p>
          </div>
        ) : messages.map(m => {
          const estMoi = m.expediteur_id !== etudiant.id
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: estMoi ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%', padding: '10px 14px',
                borderRadius: estMoi ? '14px 14px 0 14px' : '14px 14px 14px 0',
                background: estMoi ? 'var(--primary)' : 'var(--gray-100)',
                color: estMoi ? 'white' : 'var(--gray-800)',
                fontSize: '0.875rem', lineHeight: 1.5,
              }}>
                <p>{m.contenu}</p>
                <p style={{ fontSize: '0.7rem', opacity: 0.65, marginTop: 4, textAlign: estMoi ? 'right' : 'left' }}>
                  {new Date(m.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={envoyer} style={{ padding: '12px 20px', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: 10 }}>
        <input
          value={texte}
          onChange={e => setTexte(e.target.value)}
          placeholder={`Message à ${etudiant.prenom}...`}
          style={{ flex: 1, padding: '9px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, outline: 'none', fontSize: '0.875rem' }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
        />
        <button type="submit" disabled={sending || !texte.trim()} className="btn-save" style={{ padding: '9px 16px', borderRadius: 8, flexShrink: 0 }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════
   ENCADRANT — Onglet Profil (complet)
══════════════════════════════════════════ */
function EncProfil({ user, onSaved }) {
  const { mettreAJourProfil } = useAuth()
  const [ecoles, setEcoles]   = useState([])
  const [depts,  setDepts]    = useState([])
  const [form, setForm]       = useState({
    departement_id: user?.departement_id ?? '',
    grade:          user?.grade          ?? '',
    specialite:     user?.specialite     ?? '',
    telephone:      user?.telephone      ?? '',
  })
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    api.get('/ecoles').then(r => setEcoles(r.data.data || []))
    if (user?.ecole_id) {
      api.get(`/structure/departements?ecole_id=${user.ecole_id}`)
        .then(r => setDepts(r.data.data || []))
    }
  }, [user?.ecole_id])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await mettreAJourProfil({ ...form, departement_id: parseInt(form.departement_id) || null })
      toast.success('Profil mis à jour !')
      setEditing(false)
      if (onSaved) onSaved()
    } catch { toast.error('Erreur lors de la sauvegarde.') }
    finally { setSaving(false) }
  }

  const ecoleName = ecoles.find(e => e.id === user?.ecole_id)?.nom ?? '—'
  const deptName  = depts.find(d => d.id === user?.departement_id)?.nom ?? '—'
  const profilComplet = !!(user?.grade && user?.departement_id)

  return (
    <div>
      {/* Alerte profil incomplet */}
      {!profilComplet && (
        <div style={{ background:'#fef9c3', border:'1px solid #fde047', borderRadius:12, padding:'14px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:12, fontSize:'0.875rem', color:'#854d0e' }}>
          ⚠️ Votre profil est incomplet.{' '}
          <span style={{ color:'var(--primary)', fontWeight:600, cursor:'pointer' }} onClick={()=>setEditing(true)}>
            Compléter maintenant →
          </span>
        </div>
      )}

      {/* Carte profil */}
      <div className="section-box">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h3 style={{ marginBottom:0 }}>Mes informations</h3>
          {!editing && (
            <button className="btn-save" style={{ padding:'6px 14px', fontSize:'0.82rem', borderRadius:7, background:'#6b7280' }} onClick={()=>setEditing(true)}>
              <Save size={13} />Modifier
            </button>
          )}
        </div>

        {/* Avatar + nom */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 0', borderBottom:'1px solid var(--gray-200)', marginBottom:16 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--primary-light)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.4rem', flexShrink:0 }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', color:'var(--gray-900)' }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize:'0.82rem', color:'var(--gray-400)', marginTop:3 }}>
              {user?.role === 'encadrant' ? 'Encadrant' : 'Responsable Pédagogique'}
              {user?.grade && ` · ${user.grade}`}
            </div>
          </div>
        </div>

        {/* Infos fixes */}
        <Row label="Email">{user?.email}</Row>
        <Row label="École">{ecoleName}</Row>
        <Row label="Département">{deptName}</Row>
        <Row label="Grade">{user?.grade}</Row>
        <Row label="Spécialité">{user?.specialite}</Row>
        <Row label="Téléphone">{user?.telephone}</Row>

        {/* Indicateur profil */}
        <div style={{ marginTop:14, padding:'10px 14px', background: profilComplet ? 'var(--success-light)' : '#fef9c3', border:`1px solid ${profilComplet ? '#86efac' : '#fde047'}`, borderRadius:8, fontSize:'0.82rem', color: profilComplet ? '#15803d' : '#92400e' }}>
          {profilComplet ? '✓ Profil complet' : '⚠️ Profil incomplet — renseignez département et grade'}
        </div>
      </div>

      {/* Formulaire d'édition */}
      {editing && (
        <div className="section-box" style={{ marginTop:16 }}>
          <h3 style={{ marginBottom:16 }}>Modifier mon profil</h3>
          <form onSubmit={submit} className="form-inline">
            <div>
              <label>Département de rattachement</label>
              <select value={form.departement_id} onChange={e => setForm(f => ({ ...f, departement_id: e.target.value }))}>
                <option value="">Choisir un département...</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
              {depts.length === 0 && user?.ecole_id && (
                <p style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginTop:4 }}>
                  Aucun département enregistré — contactez l'administrateur.
                </p>
              )}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label>Grade / Titre *</label>
                <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="Ex: Maître de conférences" />
              </div>
              <div>
                <label>Spécialité</label>
                <input value={form.specialite} onChange={e => setForm(f => ({ ...f, specialite: e.target.value }))} placeholder="Ex: Génie Logiciel" />
              </div>
            </div>

            <div>
              <label>Téléphone</label>
              <input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="77 000 00 00" />
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button type="button" onClick={()=>setEditing(false)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', background:'white', border:'1.5px solid var(--gray-200)', borderRadius:8, fontSize:'0.875rem', cursor:'pointer', color:'var(--gray-600)', fontFamily:'inherit' }}>
                Annuler
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                <Save size={15} />{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   ENCADRANT — Onglet Mes étudiants
══════════════════════════════════════════ */
function EncMesEtudiants() {
  const [etudiants, setEtudiants] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [aptForm,   setAptForm]   = useState({ aptitude: 'apte', motif_refus: '', commentaire: '' })
  const [saving,    setSaving]    = useState(false)
  const [msgEtu,    setMsgEtu]    = useState(null) // étudiant avec qui on échange

  const load = useCallback(() => {
    setLoading(true)
    api.get('/encadrant/mes-etudiants')
      .then(r => setEtudiants(r.data.data || []))
      .catch(() => toast.error('Erreur de chargement.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleAptitude = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.patch(`/encadrant/memoires/${modal.etudiant.id}/aptitude`, aptForm)
      toast.success(`Étudiant déclaré ${aptForm.aptitude === 'apte' ? 'apte' : 'non apte'}.`)
      setModal(null); load()
    } catch { toast.error('Erreur.') }
    finally { setSaving(false) }
  }

  const handleDesassigner = async (etudiant_id) => {
    if (!confirm('Vous désassigner de cet étudiant ? Il n\'aura plus d\'encadrant.')) return
    try {
      await api.delete(`/encadrant/s-desassigner/${etudiant_id}`)
      toast.success('Vous vous êtes retiré.')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
  }

  if (loading) return <div style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ borderColor:'#7c3aed30', borderTopColor:'#7c3aed', width:32, height:32, margin:'0 auto' }} /></div>

  if (msgEtu) return <ConversationEncadrant etudiant={msgEtu} onBack={() => setMsgEtu(null)} />

  return (
    <div>
      {/* Modal aptitude */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Décision pour {modal.etudiant.prenom} {modal.etudiant.nom}</h3>
            <p>
              {modal.etudiant.memoire?.fichier_url && (
                <a href={getFileUrl(modal.etudiant.memoire.fichier_url)} target="_blank" rel="noreferrer"
                  style={{ color:'#2563eb', display:'inline-flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <ExternalLink size={14} />Consulter le mémoire
                </a>
              )}
            </p>
            <form onSubmit={handleAptitude} className="form-inline">
              <div>
                <label>Décision *</label>
                <select value={aptForm.aptitude} onChange={e => setAptForm(f => ({ ...f, aptitude: e.target.value }))}>
                  <option value="apte">✓ Apte à soutenir</option>
                  <option value="non_apte">✗ Non apte</option>
                </select>
              </div>
              {aptForm.aptitude === 'non_apte' && (
                <div>
                  <label>Motif du refus</label>
                  <input value={aptForm.motif_refus} onChange={e => setAptForm(f => ({ ...f, motif_refus: e.target.value }))} placeholder="Raison du refus..." />
                </div>
              )}
              <div>
                <label>Commentaire pour l'étudiant</label>
                <textarea rows={3} value={aptForm.commentaire}
                  onChange={e => setAptForm(f => ({ ...f, commentaire: e.target.value }))}
                  placeholder="Remarques, conseils..."
                  style={{ padding:'9px 12px', border:'1.5px solid var(--gray-200)', borderRadius:8, width:'100%', fontFamily:'inherit', resize:'vertical' }}
                />
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn-save" style={{ borderRadius:6, padding:'6px 14px' }} disabled={saving}>
                  {saving ? 'Envoi...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>{etudiants.length} étudiant(s) sous votre supervision</p>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} />Actualiser</button>
      </div>

      {etudiants.length === 0 ? (
        <div className="section-box" style={{ textAlign:'center', color:'var(--gray-400)', padding:48 }}>
          <Users size={40} style={{ marginBottom:12, opacity:0.4 }} />
          <p>Vous n'avez pas encore d'étudiant assigné.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gap:12 }}>
          {etudiants.map(e => (
            <div key={e.id} className="student-card" style={{ flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:200 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:'#f5f3ff', color:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.9rem', flexShrink:0 }}>
                  {e.prenom?.[0]}{e.nom?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight:600, color:'var(--gray-800)' }}>{e.prenom} {e.nom}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>
                    {e.ecoleInfo?.nom ?? '—'} · {e.filiereInfo?.nom ?? '—'} · {e.niveau ?? '—'}
                  </div>
                  {e.memoire?.titre && (
                    <div style={{ fontSize:'0.8rem', color:'var(--gray-600)', marginTop:4, fontStyle:'italic' }}>📄 {e.memoire.titre}</div>
                  )}
                  {e.memoire?.fichier_url && (
                    <a href={getFileUrl(e.memoire.fichier_url)} target="_blank" rel="noreferrer"
                      style={{ fontSize:'0.75rem', color:'#2563eb', display:'inline-flex', alignItems:'center', gap:4, marginTop:2 }}>
                      <ExternalLink size={12} />Consulter le document
                    </a>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end' }}>
                {e.stage?.a_stage ? <span className="badge-status badge-blue">Stage : {e.stage.entreprise||'Oui'}</span> : <span className="badge-status badge-gray">Pas de stage</span>}
                {e.memoire ? statutMemBadge(e.memoire.statut) : <span className="badge-status badge-gray">Pas de mémoire</span>}
                {e.memoire && aptitudeBadge(e.memoire.aptitude)}
              </div>

              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <button className="btn btn-ghost btn-sm" title="Envoyer un message" onClick={() => setMsgEtu(e)} style={{ color:'#2563eb', borderColor:'#2563eb' }}>
                  <MessageSquare size={14} />
                </button>
                <button className="btn-save" style={{ padding:'7px 12px', fontSize:'0.8rem', borderRadius:7, background:'#7c3aed' }}
                  onClick={() => { setAptForm({ aptitude: (e.memoire?.aptitude && e.memoire.aptitude !== 'en_attente') ? e.memoire.aptitude : 'apte', motif_refus: e.memoire?.motif_refus??'', commentaire:'' }); setModal({ etudiant: e }) }}>
                  <CheckCircle size={14} />Aptitude
                </button>
                <button className="btn btn-ghost btn-sm" title="Se désassigner" onClick={() => handleDesassigner(e.id)} style={{ color:'var(--danger)', borderColor:'var(--danger)' }}>
                  <UserMinus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   ENCADRANT — Onglet Tous les étudiants
   (s'auto-assigner)
══════════════════════════════════════════ */
function EncTousEtudiants() {
  const [etudiants, setEtudiants] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [assigning, setAssigning] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    api.get(`/encadrant/tous-etudiants${q}`)
      .then(r => setEtudiants(r.data.data || []))
      .catch(() => toast.error('Erreur.'))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const handleAssigner = async (etudiant_id) => {
    setAssigning(etudiant_id)
    try {
      await api.post(`/encadrant/s-assigner/${etudiant_id}`)
      toast.success("Vous êtes maintenant l'encadrant de cet étudiant.")
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur.')
    } finally { setAssigning(null) }
  }

  return (
    <div>
      <div className="search-wrap">
        <Search size={16} />
        <input
          type="text"
          placeholder="Rechercher par nom ou n° étudiant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <p style={{ color: 'var(--gray-400)', fontSize: '0.8rem', marginBottom: 16 }}>
        Cliquez sur "S'assigner" pour devenir l'encadrant d'un étudiant.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ borderColor: '#7c3aed30', borderTopColor: '#7c3aed', width: 32, height: 32, margin: '0 auto' }} />
        </div>
      ) : etudiants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
          <GraduationCap size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>Aucun étudiant trouvé.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {etudiants.map(e => {
            const dejAssigne = !!e.assignation
            return (
              <div key={e.id} className="student-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                    {e.prenom?.[0]}{e.nom?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{e.prenom} {e.nom}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                      {e.numero_etudiant && `N° ${e.numero_etudiant} · `}
                      {e.filiereInfo?.nom ?? '—'} · {e.niveau ?? '—'}
                    </div>
                    {e.memoire?.titre && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', marginTop: 2, fontStyle: 'italic' }}>
                        📄 {e.memoire.titre}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {dejAssigne ? (
                    <span className="badge-status badge-blue">
                      Encadrant : {e.assignation.encadrant?.prenom} {e.assignation.encadrant?.nom}
                    </span>
                  ) : (
                    <button
                      className="btn-save"
                      style={{ padding: '7px 14px', fontSize: '0.8rem', borderRadius: 7 }}
                      onClick={() => handleAssigner(e.id)}
                      disabled={assigning === e.id}
                    >
                      <UserPlus size={14} />
                      {assigning === e.id ? 'En cours...' : "S'assigner"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   ENCADRANT — Onglet Mémoires étudiants
══════════════════════════════════════════ */
function EncMemoires() {
  const [etudiants, setEtudiants] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState(null) // étudiant sélectionné
  const [aptForm,   setAptForm]   = useState({ aptitude:'apte', motif_refus:'', commentaire:'' })
  const [saving,    setSaving]    = useState(false)
  const [showForm,  setShowForm]  = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/encadrant/mes-etudiants')
      .then(r => setEtudiants(r.data.data || []))
      .catch(() => toast.error('Erreur de chargement.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleAptitude = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.patch(`/encadrant/memoires/${selected.id}/aptitude`, aptForm)
      toast.success(`Étudiant déclaré ${aptForm.aptitude === 'apte' ? 'apte ✓' : 'non apte ✗'}.`)
      setShowForm(false)
      load()
      // Met à jour l'étudiant sélectionné
      const r = await api.get('/encadrant/mes-etudiants')
      const updated = (r.data.data || []).find(e => e.id === selected.id)
      if (updated) setSelected(updated)
    } catch { toast.error('Erreur.') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ borderColor:'#7c3aed30', borderTopColor:'#7c3aed', width:32, height:32, margin:'0 auto' }} /></div>

  // Vue détail d'un étudiant
  if (selected) {
    const mem = selected.memoire
    const fileUrl = mem?.fichier_url
      ? (mem.fichier_url.startsWith('http') ? mem.fichier_url : `http://localhost:5000${mem.fichier_url}`)
      : null

    return (
      <div>
        {/* Retour */}
        <button onClick={() => { setSelected(null); setShowForm(false) }}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'1.5px solid var(--gray-200)', borderRadius:8, padding:'7px 14px', cursor:'pointer', color:'var(--gray-600)', fontSize:'0.875rem', marginBottom:20 }}>
          <ArrowLeft size={15} />Retour à la liste
        </button>

        {/* Infos étudiant */}
        <div className="section-box">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'#f5f3ff', color:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1rem', flexShrink:0 }}>
              {selected.prenom?.[0]}{selected.nom?.[0]}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--gray-900)' }}>{selected.prenom} {selected.nom}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>
                {selected.ecoleInfo?.nom ?? '—'} · {selected.filiereInfo?.nom ?? '—'} · {selected.niveau ?? '—'}
              </div>
            </div>
          </div>
          <div className="info-row"><strong>Email</strong><span>{selected.email}</span></div>
          <div className="info-row"><strong>N° Étudiant</strong><span>{selected.numero_etudiant ?? '—'}</span></div>
          <div className="info-row"><strong>Téléphone</strong><span>{selected.telephone ?? '—'}</span></div>
          {selected.stage?.a_stage && (
            <>
              <div className="info-row"><strong>Entreprise</strong><span>{selected.stage.entreprise ?? '—'}</span></div>
              <div className="info-row"><strong>Sujet de stage</strong><span>{selected.stage.sujet ?? '—'}</span></div>
            </>
          )}
        </div>

        {/* Mémoire */}
        <div className="section-box" style={{ marginTop:16 }}>
          <h3>Mémoire soumis</h3>
          {!mem || mem.statut === 'non_soumis' ? (
            <p style={{ color:'var(--gray-400)', fontSize:'0.875rem' }}>L'étudiant n'a pas encore soumis de mémoire.</p>
          ) : (
            <>
              <div className="info-row"><strong>Titre</strong><span style={{ fontStyle:'italic' }}>"{mem.titre}"</span></div>
              <div className="info-row"><strong>Statut</strong>
                <span>{{'non_soumis':'Non déposé','soumis':'Soumis','valide':'Validé','rejete':'Rejeté'}[mem.statut] ?? mem.statut}</span>
              </div>
              <div className="info-row"><strong>Déposé le</strong>
                <span>{mem.date_depot ? new Date(mem.date_depot).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }) : '—'}</span>
              </div>
              <div className="info-row"><strong>Type de dépôt</strong>
                <span>{mem.type_depot === 'fichier' ? '📄 Fichier uploadé' : '🔗 Lien externe'}</span>
              </div>

              {/* Lien de consultation */}
              {fileUrl && (
                <div style={{ marginTop:16, padding:'14px 18px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div>
                    <p style={{ fontWeight:600, color:'#1e40af', fontSize:'0.875rem' }}>📄 Document disponible</p>
                    <p style={{ fontSize:'0.78rem', color:'#3b82f6', marginTop:2 }}>
                      {mem.type_depot === 'fichier' ? 'Fichier PDF/Word uploadé' : 'Lien partagé par l\'étudiant'}
                    </p>
                  </div>
                  <a href={fileUrl} target="_blank" rel="noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 16px', background:'#1d4ed8', color:'white', borderRadius:8, fontSize:'0.875rem', fontWeight:600, textDecoration:'none', flexShrink:0 }}>
                    <ExternalLink size={15} />
                    {mem.type_depot === 'fichier' ? 'Télécharger' : 'Ouvrir le lien'}
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Décision aptitude */}
        <div className="section-box" style={{ marginTop:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ marginBottom:0 }}>Décision d'aptitude à soutenir</h3>
            {mem && mem.statut !== 'non_soumis' && !showForm && (
              <button className="btn-save" style={{ padding:'7px 14px', fontSize:'0.82rem', borderRadius:7 }} onClick={() => { setAptForm({ aptitude: (mem.aptitude && mem.aptitude !== 'en_attente') ? mem.aptitude : 'apte', motif_refus: mem.motif_refus ?? '', commentaire: mem.commentaire_encadrant ?? '' }); setShowForm(true) }}>
                <CheckCircle size={14} />{mem.aptitude !== 'en_attente' ? 'Modifier la décision' : 'Rendre ma décision'}
              </button>
            )}
          </div>

          {/* Décision actuelle */}
          <div className="info-row">
            <strong>Décision</strong>
            <span>{mem?.aptitude === 'apte'
              ? <span className="badge-status badge-green">✓ Apte à soutenir</span>
              : mem?.aptitude === 'non_apte'
              ? <span className="badge-status badge-red">✗ Non apte</span>
              : <span className="badge-status badge-gray">⏳ En attente</span>}
            </span>
          </div>
          {mem?.date_decision && <div className="info-row"><strong>Date</strong><span>{new Date(mem.date_decision).toLocaleDateString('fr-FR')}</span></div>}
          {mem?.motif_refus && <div className="info-row"><strong>Motif</strong><span>{mem.motif_refus}</span></div>}
          {mem?.commentaire_encadrant && (
            <div style={{ marginTop:12, background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:8, padding:'12px 16px' }}>
              <p style={{ fontSize:'0.8rem', color:'#0369a1', fontWeight:600, marginBottom:4 }}>💬 Votre commentaire</p>
              <p style={{ fontSize:'0.875rem', color:'#0c4a6e' }}>{mem.commentaire_encadrant}</p>
            </div>
          )}

          {/* Formulaire de décision */}
          {showForm && mem && mem.statut !== 'non_soumis' && (
            <form onSubmit={handleAptitude} className="form-inline" style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--gray-200)' }}>
              <div>
                <label>Décision *</label>
                <select value={aptForm.aptitude} onChange={e => setAptForm(f => ({ ...f, aptitude: e.target.value }))}>
                  <option value="apte">✓ Apte à soutenir</option>
                  <option value="non_apte">✗ Non apte</option>
                </select>
              </div>
              {aptForm.aptitude === 'non_apte' && (
                <div>
                  <label>Motif du refus</label>
                  <input value={aptForm.motif_refus} onChange={e => setAptForm(f => ({ ...f, motif_refus: e.target.value }))} placeholder="Raison du refus..." />
                </div>
              )}
              <div>
                <label>Commentaire pour l'étudiant</label>
                <textarea rows={3} value={aptForm.commentaire} onChange={e => setAptForm(f => ({ ...f, commentaire: e.target.value }))}
                  placeholder="Remarques, conseils..."
                  style={{ padding:'9px 12px', border:'1.5px solid var(--gray-200)', borderRadius:8, width:'100%', fontFamily:'inherit', resize:'vertical', outline:'none' }} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn-save" style={{ borderRadius:6, padding:'7px 16px' }} disabled={saving}>
                  {saving ? 'Envoi...' : 'Confirmer la décision'}
                </button>
              </div>
            </form>
          )}
          {(!mem || mem.statut === 'non_soumis') && (
            <p style={{ color:'var(--gray-400)', fontSize:'0.82rem', marginTop:8 }}>
              La décision sera disponible une fois que l'étudiant aura soumis son mémoire.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Liste des étudiants avec leur état mémoire
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <p style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>{etudiants.length} étudiant(s) sous votre supervision</p>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} />Actualiser</button>
      </div>

      {etudiants.length === 0 ? (
        <div className="section-box" style={{ textAlign:'center', color:'var(--gray-400)', padding:48 }}>
          <Users size={40} style={{ marginBottom:12, opacity:0.4 }} />
          <p>Vous n'avez pas encore d'étudiant assigné.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gap:10 }}>
          {etudiants.map(e => {
            const mem = e.memoire
            const aptitude = mem?.aptitude ?? 'en_attente'
            return (
              <div key={e.id}
                onClick={() => { setSelected(e); setShowForm(false) }}
                style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:10, padding:'16px 20px', cursor:'pointer', transition:'box-shadow 0.2s, border-color 0.2s' }}
                onMouseEnter={el => { el.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; el.currentTarget.style.borderColor='var(--primary)' }}
                onMouseLeave={el => { el.currentTarget.style.boxShadow='none'; el.currentTarget.style.borderColor='var(--gray-200)' }}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'#f5f3ff', color:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>
                      {e.prenom?.[0]}{e.nom?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>{e.prenom} {e.nom}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>
                        {e.filiereInfo?.nom ?? '—'} · {e.niveau ?? '—'}
                      </div>
                      {mem?.titre && (
                        <div style={{ fontSize:'0.78rem', color:'var(--gray-600)', marginTop:2, fontStyle:'italic' }}>
                          📄 "{mem.titre}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end', flexShrink:0 }}>
                    {!mem || mem.statut === 'non_soumis'
                      ? <span className="badge-status badge-gray">Pas de mémoire</span>
                      : mem.statut === 'soumis'
                      ? <span className="badge-status badge-blue">📄 Mémoire soumis</span>
                      : <span className="badge-status badge-green">✓ Déposé</span>
                    }
                    {aptitude === 'apte'     && <span className="badge-status badge-green">✓ Apte</span>}
                    {aptitude === 'non_apte' && <span className="badge-status badge-red">✗ Non apte</span>}
                    {aptitude === 'en_attente' && mem?.statut !== 'non_soumis' && (
                      <span className="badge-status badge-orange" style={{ background:'#fff7ed', color:'#c2410c' }}>⚡ Décision attendue</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   ENCADRANT — Onglet Chat (style WhatsApp)
══════════════════════════════════════════ */
function EncChat({ encadrantId }) {
  const [etudiants,   setEtudiants]   = useState([])
  const [selected,    setSelected]    = useState(null) // étudiant sélectionné
  const [messages,    setMessages]    = useState([])
  const [texte,       setTexte]       = useState('')
  const [fichier,     setFichier]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending,     setSending]     = useState(false)
  const [nonLus,      setNonLus]      = useState({})
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const intervalRef = useRef(null)

  // Charger la liste des étudiants assignés
  useEffect(() => {
    api.get('/encadrant/mes-etudiants')
      .then(r => setEtudiants(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Charger les messages quand un étudiant est sélectionné
  const chargerMessages = useCallback(async (etuId) => {
    if (!etuId) return
    setLoadingMsgs(true)
    try {
      const r = await api.get(`/messages/${etuId}`)
      setMessages(r.data.data || [])
    } catch { /* silencieux */ }
    finally { setLoadingMsgs(false) }
  }, [])

  useEffect(() => {
    if (selected) {
      chargerMessages(selected.id)
      // Rafraîchissement automatique toutes les 5 secondes
      intervalRef.current = setInterval(() => chargerMessages(selected.id), 5000)
    }
    return () => clearInterval(intervalRef.current)
  }, [selected, chargerMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const envoyer = async (e) => {
    e.preventDefault()
    if ((!texte.trim() && !fichier) || !selected) return
    setSending(true)
    try {
      const fd = new FormData()
      if (texte.trim()) fd.append('contenu', texte.trim())
      if (fichier) fd.append('fichier', fichier)
      await api.post(`/messages/${selected.id}`, fd)
      setTexte('')
      setFichier(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      chargerMessages(selected.id)
    } catch { toast.error('Erreur.') }
    finally { setSending(false) }
  }

  const formatHeure = (d) => {
    const date = new Date(d)
    const maintenant = new Date()
    const hierDate = new Date(); hierDate.setDate(hierDate.getDate() - 1)
    if (date.toDateString() === maintenant.toDateString())
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (date.toDateString() === hierDate.toDateString()) return 'Hier'
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const formatDateSeparateur = (d) => {
    const date = new Date(d)
    const maintenant = new Date()
    const hierDate = new Date(); hierDate.setDate(hierDate.getDate() - 1)
    if (date.toDateString() === maintenant.toDateString()) return "Aujourd'hui"
    if (date.toDateString() === hierDate.toDateString()) return 'Hier'
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  // Grouper les messages par date
  const groupesMessages = () => {
    const groupes = []
    let dateActuelle = null
    messages.forEach(m => {
      const dateMsg = new Date(m.created_at).toDateString()
      if (dateMsg !== dateActuelle) {
        dateActuelle = dateMsg
        groupes.push({ type: 'separateur', date: m.created_at, key: 'sep_' + m.id })
      }
      groupes.push({ type: 'message', data: m, key: m.id })
    })
    return groupes
  }

  const getFileUrl = (url) => {
    if (!url) return null
    return url.startsWith('http') ? url : `http://localhost:5000${url}`
  }

  return (
    <div style={{
      display: 'flex',
      height: 600,
      background: 'var(--bg-card, white)',
      border: '1px solid var(--gray-200)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>

      {/* ── Colonne gauche : liste des étudiants ── */}
      <div style={{
        width: 280,
        borderRight: '1px solid var(--gray-200)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card, white)',
        flexShrink: 0,
      }}>
        {/* Header liste */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--gray-100)',
          background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
        }}>
          <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>Messages</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
            {etudiants.length} étudiant(s)
          </div>
        </div>

        {/* Liste étudiants */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div className="spinner" style={{ borderColor:'#7c3aed30', borderTopColor:'#7c3aed', width:24, height:24, margin:'0 auto' }}/>
            </div>
          ) : etudiants.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.82rem' }}>
              Aucun étudiant assigné
            </div>
          ) : etudiants.map(e => (
            <div
              key={e.id}
              onClick={() => setSelected(e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                cursor: 'pointer',
                background: selected?.id === e.id ? '#f5f3ff' : 'transparent',
                borderLeft: selected?.id === e.id ? '3px solid #7c3aed' : '3px solid transparent',
                transition: 'all 0.15s',
                borderBottom: '1px solid var(--gray-50)',
              }}
              onMouseEnter={el => { if (selected?.id !== e.id) el.currentTarget.style.background = 'var(--gray-50)' }}
              onMouseLeave={el => { if (selected?.id !== e.id) el.currentTarget.style.background = 'transparent' }}
            >
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                boxShadow: '0 2px 6px rgba(124,58,237,0.3)',
              }}>
                {e.prenom?.[0]}{e.nom?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {e.prenom} {e.nom}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {e.filiereInfo?.nom ?? '—'} · {e.niveau ?? '—'}
                </div>
              </div>
              {/* Pastille non-lus (future) */}
            </div>
          ))}
        </div>
      </div>

      {/* ── Colonne droite : conversation ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {!selected ? (
          /* État vide */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', gap: 12 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={32} color="#7c3aed" opacity={0.5} />
            </div>
            <div style={{ fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.95rem' }}>
              Sélectionnez un étudiant
            </div>
            <div style={{ fontSize: '0.82rem', textAlign: 'center', maxWidth: 220 }}>
              Choisissez un étudiant dans la liste pour démarrer une conversation.
            </div>
          </div>
        ) : (
          <>
            {/* Header conversation */}
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--gray-100)',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {selected.prenom?.[0]}{selected.nom?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{selected.prenom} {selected.nom}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>
                  {selected.filiereInfo?.nom ?? '—'} · {selected.niveau ?? '—'}
                  {selected.ecoleInfo && ` · ${selected.ecoleInfo.sigle ?? selected.ecoleInfo.nom}`}
                </div>
              </div>
              <button
                onClick={() => chargerMessages(selected.id)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Zone messages — fond style WhatsApp */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 20px',
              background: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(124,58,237,0.015) 30px, rgba(124,58,237,0.015) 31px)',
              backgroundSize: '100% 31px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {loadingMsgs ? (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  <div className="spinner" style={{ borderColor:'#7c3aed30', borderTopColor:'#7c3aed', width:28, height:28, margin:'0 auto' }}/>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--gray-400)' }}>
                  <MessageSquare size={36} style={{ marginBottom: 8, opacity: 0.3 }}/>
                  <p style={{ fontSize: '0.875rem' }}>Aucun message. Démarrez la conversation !</p>
                </div>
              ) : groupesMessages().map(item => {
                if (item.type === 'separateur') {
                  return (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 6px' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }}/>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 600, background: 'white', padding: '2px 10px', borderRadius: 20, border: '1px solid var(--gray-200)' }}>
                        {formatDateSeparateur(item.date)}
                      </span>
                      <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }}/>
                    </div>
                  )
                }
                const m = item.data
                const estMoi = m.expediteur_id !== selected.id
                return (
                  <div key={item.key} style={{ display: 'flex', justifyContent: estMoi ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                    {/* Avatar destinataire */}
                    {!estMoi && (
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-end', marginRight: 6 }}>
                        {selected.prenom?.[0]}{selected.nom?.[0]}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '68%',
                      padding: '9px 13px',
                      borderRadius: estMoi ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: estMoi
                        ? 'linear-gradient(135deg, #6d28d9, #7c3aed)'
                        : 'white',
                      color: estMoi ? 'white' : 'var(--gray-800)',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      boxShadow: estMoi ? '0 2px 8px rgba(109,40,217,0.35)' : '0 1px 4px rgba(0,0,0,0.08)',
                      border: estMoi ? 'none' : '1px solid var(--gray-100)',
                    }}>
                      {/* Fichier joint */}
                      {m.fichier_url && (
                        <div style={{ marginBottom: m.contenu ? 8 : 0 }}>
                          <a
                            href={getFileUrl(m.fichier_url)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '8px 12px',
                              background: estMoi ? 'rgba(255,255,255,0.15)' : '#f5f3ff',
                              borderRadius: 10,
                              textDecoration: 'none',
                              color: estMoi ? 'white' : '#6d28d9',
                              fontSize: '0.78rem', fontWeight: 600,
                              border: estMoi ? '1px solid rgba(255,255,255,0.2)' : '1px solid #ddd6fe',
                            }}
                          >
                            <ExternalLink size={14} />
                            {m.fichier_nom ?? 'Voir le fichier'}
                          </a>
                        </div>
                      )}
                      {/* Texte */}
                      {m.contenu && <p style={{ margin: 0 }}>{m.contenu}</p>}
                      {/* Heure */}
                      <p style={{ fontSize: '0.65rem', opacity: 0.65, margin: '4px 0 0', textAlign: 'right' }}>
                        {formatHeure(m.created_at)}
                        {estMoi && <span style={{ marginLeft: 4 }}>✓✓</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Aperçu fichier sélectionné */}
            {fichier && (
              <div style={{ padding: '8px 20px', background: '#f5f3ff', borderTop: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, fontSize: '0.8rem', color: '#6d28d9', fontWeight: 500 }}>
                  📎 {fichier.name} ({(fichier.size/1024/1024).toFixed(2)} Mo)
                </div>
                <button onClick={() => { setFichier(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
              </div>
            )}

            {/* Zone de saisie */}
            <form onSubmit={envoyer} style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 8, alignItems: 'flex-end', background: 'var(--bg-card, white)' }}>
              {/* Bouton fichier */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: '#f5f3ff', border: '1.5px solid #ddd6fe', cursor: 'pointer', flexShrink: 0, color: '#7c3aed', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
              >
                <Paperclip size={18} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  style={{ display: 'none' }}
                  onChange={e => setFichier(e.target.files[0] || null)}
                />
              </label>

              {/* Input texte */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={texte}
                  onChange={e => setTexte(e.target.value)}
                  placeholder="Écrire un message..."
                  style={{
                    width: '100%', padding: '10px 16px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 24, outline: 'none',
                    fontSize: '0.875rem', fontFamily: 'inherit',
                    background: 'var(--gray-50)',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(e) }
                  }}
                />
              </div>

              {/* Bouton envoyer */}
              <button
                type="submit"
                disabled={sending || (!texte.trim() && !fichier)}
                style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: (!texte.trim() && !fichier) ? 'var(--gray-200)' : 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                  border: 'none', cursor: (!texte.trim() && !fichier) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0,
                  boxShadow: (!texte.trim() && !fichier) ? 'none' : '0 2px 8px rgba(109,40,217,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {sending
                  ? <div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}/>
                  : <Send size={18} />
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   DASHBOARD ENCADRANT
══════════════════════════════════════════ */
function DashboardEncadrant({ user }) {
  const [stats,  setStats]  = useState(null)
  const [onglet, setOnglet] = useState('accueil')

  useEffect(() => {
    api.get('/encadrant/stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* Tabs */}
      <div className="tab-bar">
        {[
          { key: 'accueil',        label: 'Accueil' },
          { key: 'profil',         label: 'Mon profil' },
          { key: 'mes-etudiants',  label: 'Mes étudiants' },
          { key: 'memoires',       label: 'Mémoires' },
          { key: 'chat',           label: 'Chat' },
          { key: 'tous-etudiants', label: 'Trouver des étudiants' },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${onglet === t.key ? 'active' : ''}`}
            onClick={() => setOnglet(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Accueil */}
      {onglet === 'accueil' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { icon: <Users size={20} />, label: 'Étudiants supervisés', val: stats?.nbEtudiants ?? '—', color: '#7c3aed' },
              { icon: <CheckCircle size={20} />, label: 'Déclarés aptes', val: stats?.aptes ?? '—', color: '#16a34a' },
              { icon: <XCircle size={20} />, label: 'Non aptes', val: stats?.nonAptes ?? '—', color: '#dc2626' },
              { icon: <BookOpen size={20} />, label: 'Mémoires déposés', val: stats?.memoiresDeposes ?? '—', color: '#0369a1' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Infos */}
          <div className="section-box">
            <h3>Vos informations</h3>
            <Row label="Nom complet">{user.prenom} {user.nom}</Row>
            <Row label="Email">{user.email}</Row>
            <Row label="Grade">{user.grade}</Row>
            <Row label="Spécialité">{user.specialite}</Row>
            <Row label="Téléphone">{user.telephone}</Row>
          </div>

          <div className="section-box" style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #86efac' }}>
            <h3 style={{ color: '#15803d' }}>📋 Actions disponibles</h3>
            <ul style={{ paddingLeft: 20, color: 'var(--gray-600)', lineHeight: 2.2, fontSize: '0.875rem' }}>
              <li>Complétez votre profil (département, grade, spécialité)</li>
              <li>Consultez la liste des étudiants et assignez-vous comme encadrant</li>
              <li>Déclarez l'aptitude à soutenir pour vos étudiants</li>
            </ul>
          </div>
        </div>
      )}

      {onglet === 'profil'         && <EncProfil       user={user} onSaved={() => {}} />}
      {onglet === 'mes-etudiants'  && <EncMesEtudiants />}
      {onglet === 'memoires'       && <EncMemoires />}
      {onglet === 'chat'           && <EncChat encadrantId={user?.id} />}
      {onglet === 'tous-etudiants' && <EncTousEtudiants />}
    </div>
  )
}

/* ══════════════════════════════════════════
   RP — Onglet Assignations
══════════════════════════════════════════ */
function RPAssignations() {
  const [etudiants,  setEtudiants]  = useState([])
  const [encadrants, setEncadrants] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modalEtu,   setModalEtu]   = useState(null) // étudiant à assigner
  const [encChoisi,  setEncChoisi]  = useState('')
  const [annee,      setAnnee]      = useState('')
  const [saving,     setSaving]     = useState(false)
  const [vue,        setVue]        = useState('sans') // 'sans' | 'toutes'
  const [assignations, setAssignations] = useState([])

  const loadSans = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/assignations/etudiants-sans-encadrant'),
      api.get('/assignations/encadrants-disponibles'),
    ])
      .then(([r1, r2]) => {
        setEtudiants(r1.data.data || [])
        setEncadrants(r2.data.data || [])
      })
      .catch(() => toast.error('Erreur.'))
      .finally(() => setLoading(false))
  }, [])

  const loadToutes = useCallback(() => {
    setLoading(true)
    api.get('/assignations')
      .then(r => setAssignations(r.data.data || []))
      .catch(() => toast.error('Erreur.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (vue === 'sans') loadSans()
    else loadToutes()
  }, [vue, loadSans, loadToutes])

  const handleAssigner = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/assignations', {
        etudiant_id:        modalEtu.id,
        encadrant_id:       parseInt(encChoisi),
        annee_universitaire: annee,
      })
      toast.success('Assignation créée.')
      setModalEtu(null); setEncChoisi(''); setAnnee('')
      loadSans()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
    finally { setSaving(false) }
  }

  const handleSupprimer = async (id) => {
    if (!confirm('Supprimer cette assignation ?')) return
    try {
      await api.delete(`/assignations/${id}`)
      toast.success('Assignation supprimée.')
      loadToutes()
    } catch { toast.error('Erreur.') }
  }

  return (
    <div>
      {/* Modal assignation */}
      {modalEtu && (
        <div className="modal-overlay" onClick={() => setModalEtu(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Assigner un encadrant</h3>
            <p>
              Étudiant : <strong>{modalEtu.prenom} {modalEtu.nom}</strong>
              {modalEtu.filiereInfo && ` · ${modalEtu.filiereInfo.nom}`}
            </p>
            <form onSubmit={handleAssigner} className="form-inline">
              <div>
                <label>Encadrant *</label>
                <select value={encChoisi} onChange={e => setEncChoisi(e.target.value)} required>
                  <option value="">Choisir un encadrant...</option>
                  {encadrants.map(enc => (
                    <option key={enc.id} value={enc.id}>
                      {enc.prenom} {enc.nom}
                      {enc.grade && ` (${enc.grade})`}
                      {` — ${enc.nb_etudiants} étudiant(s)`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Année universitaire</label>
                <input
                  value={annee}
                  onChange={e => setAnnee(e.target.value)}
                  placeholder="2024-2025"
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalEtu(null)}>Annuler</button>
                <button type="submit" className="btn-save" style={{ borderRadius: 6, padding: '7px 16px' }} disabled={saving}>
                  {saving ? 'Assignation...' : 'Assigner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Switcher vue */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'sans',   label: `Sans encadrant (${vue === 'sans' ? etudiants.length : '…'})` },
          { key: 'toutes', label: 'Toutes les assignations' },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setVue(v.key)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1.5px solid',
              borderColor: vue === v.key ? 'var(--primary)' : 'var(--gray-200)',
              background: vue === v.key ? 'var(--primary-light)' : 'white',
              color: vue === v.key ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: vue === v.key ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            {v.label}
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => vue === 'sans' ? loadSans() : loadToutes()}>
          <RefreshCw size={14} />Actualiser
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ borderColor: '#7c3aed30', borderTopColor: '#7c3aed', width: 32, height: 32, margin: '0 auto' }} />
        </div>
      ) : vue === 'sans' ? (
        <>
          {etudiants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
              <CheckCircle size={40} style={{ color: '#16a34a', opacity: 0.5, marginBottom: 12 }} />
              <p>Tous les étudiants ont un encadrant assigné 🎉</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {etudiants.map(e => (
                <div key={e.id} className="student-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                      {e.prenom?.[0]}{e.nom?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{e.prenom} {e.nom}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        {e.ecoleInfo?.sigle ?? '—'} · {e.filiereInfo?.nom ?? '—'} · {e.niveau ?? '—'}
                      </div>
                    </div>
                  </div>
                  <span className="badge-status badge-orange">
                    <AlertTriangle size={11} />Sans encadrant
                  </span>
                  <button
                    className="btn-save"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', borderRadius: 7 }}
                    onClick={() => setModalEtu(e)}
                  >
                    <UserPlus size={14} />Assigner
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {assignations.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 40 }}>Aucune assignation.</p>
          ) : assignations.map(a => (
            <div key={a.id} className="student-card">
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.etudiant?.prenom} {a.etudiant?.nom}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  Encadrant : {a.encadrant?.prenom} {a.encadrant?.nom} {a.encadrant?.grade && `(${a.encadrant.grade})`}
                </div>
                {a.annee_universitaire && (
                  <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)' }}>{a.annee_universitaire}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge-status ${a.statut === 'active' ? 'badge-green' : 'badge-gray'}`}>
                  {a.statut === 'active' ? 'Active' : a.statut}
                </span>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleSupprimer(a.id)}
                  title="Supprimer l'assignation"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   RP — Vue d'ensemble
══════════════════════════════════════════ */
function RPAccueil() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/assignations/stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
  }, [])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: <GraduationCap size={20} />, label: 'Total étudiants',     val: stats?.totalEtudiants ?? '—', color: '#0369a1' },
          { icon: <CheckCircle size={20} />,   label: 'Avec encadrant',      val: stats?.avecEncadrant  ?? '—', color: '#16a34a' },
          { icon: <AlertTriangle size={20} />, label: 'Sans encadrant',      val: stats?.sansEncadrant  ?? '—', color: '#d97706' },
          { icon: <Users size={20} />,         label: 'Encadrants actifs',   val: stats?.totalEncadrants ?? '—', color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats?.sansEncadrant > 0 && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={20} color="#d97706" />
          <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
            <strong>{stats.sansEncadrant} étudiant(s)</strong> n'ont pas encore d'encadrant.
            Allez dans l'onglet <strong>"Assignations"</strong> pour les assigner.
          </p>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   DASHBOARD RESPONSABLE PÉDAGOGIQUE
══════════════════════════════════════════ */
function DashboardRP({ user }) {
  const [onglet, setOnglet] = useState('accueil')

  return (
    <div>
      <div className="tab-bar">
        {[
          { key: 'accueil',      label: 'Accueil' },
          { key: 'profil',       label: 'Mon profil' },
          { key: 'assignations', label: 'Assignations' },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${onglet === t.key ? 'active' : ''}`} onClick={() => setOnglet(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {onglet === 'accueil'      && <RPAccueil />}
      {onglet === 'profil'       && <EncProfil user={user} onSaved={() => {}} />}
      {onglet === 'assignations' && <RPAssignations />}
    </div>
  )
}

/* ══════════════════════════════════════════
   DASHBOARD PRINCIPAL
══════════════════════════════════════════ */
export default function Dashboard() {
  const { user, deconnexion } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    deconnexion()
    toast.success('Vous avez été déconnecté.')
    navigate('/connexion')
  }

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase()
  const roleLabel = ROLE_LABELS[user?.role] ?? user?.role

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <span className="topbar-brand">Portail Personnel</span>
        <div className="topbar-user">
          <div className="avatar">{initiales}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{roleLabel}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} />Déconnexion
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Carte de bienvenue */}
        <div className="welcome-card">
          <h2>Bonjour, M. {user?.nom}</h2>
          <p>
            {user?.role === 'encadrant'
              ? 'Bienvenue sur votre espace de supervision des étudiants.'
              : "Bienvenue. Gérez les assignations encadrants / étudiants."}
          </p>
          <span className="badge-role">{roleLabel}</span>
        </div>

        {/* Contenu selon rôle */}
        {user?.role === 'encadrant'               && <DashboardEncadrant user={user} />}
        {user?.role === 'responsable_pedagogique' && <DashboardRP        user={user} />}
      </main>
    </div>
  )
}
