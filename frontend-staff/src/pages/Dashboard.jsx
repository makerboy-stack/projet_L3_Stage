import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LogOut, Users, BookOpen, CheckCircle, XCircle,
  ClipboardList, Save, Search, UserPlus, UserMinus,
  RefreshCw, School, GraduationCap, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/* ─────────────────────────────── helpers ── */
const ROLE_LABELS = {
  encadrant: 'Encadrant',
  responsable_pedagogique: 'Responsable Pédagogique',
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
   ENCADRANT — Onglet Profil
══════════════════════════════════════════ */
function EncProfil({ user, onSaved }) {
  const { mettreAJourProfil } = useAuth()
  const [ecoles, setEcoles] = useState([])
  const [depts,  setDepts]  = useState([])
  const [form, setForm]     = useState({
    departement_id: user?.departement_id ?? '',
    grade:          user?.grade          ?? '',
    specialite:     user?.specialite     ?? '',
    telephone:      user?.telephone      ?? '',
  })
  const [saving, setSaving] = useState(false)

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
      await mettreAJourProfil({
        ...form,
        departement_id: parseInt(form.departement_id) || null,
      })
      toast.success('Profil mis à jour !')
      onSaved()
    } catch { toast.error('Erreur lors de la sauvegarde.') }
    finally { setSaving(false) }
  }

  return (
    <div className="section-box">
      <h3>Mes informations</h3>

      {/* Infos fixes */}
      <Row label="Nom complet">{user?.prenom} {user?.nom}</Row>
      <Row label="Email">{user?.email}</Row>
      <Row label="École">
        {user?.ecole_id
          ? (ecoles.find(e => e.id === user.ecole_id)?.nom ?? `École #${user.ecole_id}`)
          : '—'}
      </Row>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-200)' }}>
        <h3 style={{ marginBottom: 16 }}>Compléter mon profil</h3>
        <form onSubmit={submit} className="form-inline">
          {/* Département */}
          <div>
            <label>Département de rattachement</label>
            <select
              value={form.departement_id}
              onChange={e => setForm(f => ({ ...f, departement_id: e.target.value }))}
            >
              <option value="">Choisir un département...</option>
              {depts.map(d => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </select>
            {depts.length === 0 && user?.ecole_id && (
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>
                Aucun département enregistré pour cette école.
              </p>
            )}
          </div>

          {/* Grade & Spécialité */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Grade / Titre</label>
              <input
                value={form.grade}
                onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                placeholder="Ex: Maître de conférences"
              />
            </div>
            <div>
              <label>Spécialité</label>
              <input
                value={form.specialite}
                onChange={e => setForm(f => ({ ...f, specialite: e.target.value }))}
                placeholder="Ex: Génie Logiciel"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label>Téléphone</label>
            <input
              value={form.telephone}
              onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
              placeholder="77 000 00 00"
            />
          </div>

          <div>
            <button type="submit" className="btn-save" disabled={saving}>
              <Save size={15} />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   ENCADRANT — Onglet Mes étudiants
══════════════════════════════════════════ */
function EncMesEtudiants() {
  const [etudiants, setEtudiants] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null) // { etudiant, mode: 'aptitude' }
  const [aptForm,   setAptForm]   = useState({ aptitude: 'apte', motif_refus: '', commentaire: '' })
  const [saving,    setSaving]    = useState(false)

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
    if (!confirm('Vous désassigner de cet étudiant ?')) return
    try {
      await api.delete(`/encadrant/s-desassigner/${etudiant_id}`)
      toast.success('Vous vous êtes retiré.')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div className="spinner" style={{ borderColor: '#7c3aed30', borderTopColor: '#7c3aed', width: 32, height: 32, margin: '0 auto' }} />
    </div>
  )

  return (
    <div>
      {/* Modal aptitude */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Décision pour {modal.etudiant.prenom} {modal.etudiant.nom}</h3>
            <p>Déclarez si cet étudiant est apte à soutenir son mémoire.</p>
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
                  <input
                    value={aptForm.motif_refus}
                    onChange={e => setAptForm(f => ({ ...f, motif_refus: e.target.value }))}
                    placeholder="Raison du refus..."
                  />
                </div>
              )}
              <div>
                <label>Commentaire (optionnel)</label>
                <textarea
                  rows={3}
                  value={aptForm.commentaire}
                  onChange={e => setAptForm(f => ({ ...f, commentaire: e.target.value }))}
                  placeholder="Remarques pour l'étudiant..."
                  style={{ padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn-save btn-sm" disabled={saving} style={{ borderRadius: 6, padding: '6px 14px' }}>
                  {saving ? 'Envoi...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{etudiants.length} étudiant(s) sous votre supervision</p>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} />Actualiser</button>
      </div>

      {etudiants.length === 0 ? (
        <div className="section-box" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 48 }}>
          <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>Vous n'avez pas encore d'étudiant assigné.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {etudiants.map(e => (
            <div key={e.id} className="student-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar */}
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                  {e.prenom?.[0]}{e.nom?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{e.prenom} {e.nom}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                    {e.filiereInfo?.nom ?? '—'} · {e.niveau ?? '—'}
                    {e.ecoleInfo && ` · ${e.ecoleInfo.sigle ?? e.ecoleInfo.nom}`}
                  </div>
                  {e.memoire?.titre && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 4, fontStyle: 'italic' }}>
                      📄 {e.memoire.titre}
                    </div>
                  )}
                </div>
              </div>

              {/* Statuts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                {e.stage?.a_stage
                  ? <span className="badge-status badge-blue">Stage : {e.stage.entreprise || 'Oui'}</span>
                  : <span className="badge-status badge-gray">Pas de stage</span>
                }
                {e.memoire ? statutMemBadge(e.memoire.statut) : <span className="badge-status badge-gray">Pas de mémoire</span>}
                {e.memoire && aptitudeBadge(e.memoire.aptitude)}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  className="btn-save"
                  style={{ padding: '7px 14px', fontSize: '0.8rem', borderRadius: 7, background: '#7c3aed' }}
                  onClick={() => { setAptForm({ aptitude: e.memoire?.aptitude ?? 'apte', motif_refus: e.memoire?.motif_refus ?? '', commentaire: '' }); setModal({ etudiant: e }) }}
                >
                  <CheckCircle size={14} />
                  Aptitude
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  title="Se désassigner"
                  onClick={() => handleDesassigner(e.id)}
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                >
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
          { key: 'accueil',        label: '🏠 Accueil' },
          { key: 'profil',         label: '👤 Mon profil' },
          { key: 'mes-etudiants',  label: '👥 Mes étudiants' },
          { key: 'tous-etudiants', label: '🔍 Trouver des étudiants' },
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
          { key: 'accueil',      label: '🏠 Accueil' },
          { key: 'profil',       label: '👤 Mon profil' },
          { key: 'assignations', label: '🔗 Assignations' },
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
        <span className="topbar-brand">🏛️ Portail Personnel</span>
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
          <h2>Bonjour, {user?.prenom} 👋</h2>
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
