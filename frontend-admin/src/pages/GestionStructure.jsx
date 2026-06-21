import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Check, X, RefreshCw, School } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

/* ── Formulaire département ── */
function FormDept({ ecole_id, initial, onSave, onCancel }) {
  const [form, setForm] = useState({ nom: initial?.nom ?? '', code: initial?.code ?? '' })
  const submit = e => {
    e.preventDefault()
    if (!form.nom.trim()) return toast.error('Le nom est obligatoire.')
    onSave({ ...form, ecole_id })
  }
  return (
    <form onSubmit={submit} style={{ display:'flex', gap:8, alignItems:'flex-end', flexWrap:'wrap', margin:'8px 0' }}>
      <div style={{ flex:2, minWidth:180 }}>
        <label style={{ fontSize:'0.78rem', color:'var(--gray-600)', fontWeight:600 }}>Nom *</label>
        <input value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} placeholder="Ex: Génie Informatique" style={{ marginTop:3 }} />
      </div>
      <div style={{ flex:1, minWidth:100 }}>
        <label style={{ fontSize:'0.78rem', color:'var(--gray-600)', fontWeight:600 }}>Code</label>
        <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="GI" style={{ marginTop:3 }} />
      </div>
      <button type="submit" className="btn btn-primary btn-sm"><Check size={13} />{initial ? 'Modifier' : 'Ajouter'}</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}><X size={13} />Annuler</button>
    </form>
  )
}

/* ── Formulaire filière ── */
function FormFiliere({ departement_id, initial, onSave, onCancel }) {
  const ALL_NIVEAUX = ['L1','L2','L3','M1','M2']

  // niveaux peut être string JSON ou tableau
  const parseNiveaux = (val) => {
    if (!val) return ['L1','L2','L3','M1','M2']
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) } catch { return ['L1','L2','L3','M1','M2'] }
  }

  const [nom,  setNom]  = useState(initial?.nom ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [nivx, setNivx] = useState(parseNiveaux(initial?.niveaux))

  const toggleNiveau = n => setNivx(prev => prev.includes(n) ? prev.filter(x=>x!==n) : [...prev, n])

  const submit = e => {
    e.preventDefault()
    if (!nom.trim()) return toast.error('Le nom est obligatoire.')
    if (nivx.length === 0) return toast.error('Choisissez au moins un niveau.')
    onSave({ nom: nom.trim(), code, niveaux: nivx, departement_id })
  }

  return (
    <form onSubmit={submit} style={{ padding:'12px 16px', background:'#f5f3ff', borderRadius:8, margin:'8px 0', display:'grid', gap:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:10 }}>
        <div>
          <label style={{ fontSize:'0.78rem', color:'var(--gray-600)', fontWeight:600 }}>Nom de la filière *</label>
          <input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex: Génie Logiciel" style={{ marginTop:3 }} />
        </div>
        <div>
          <label style={{ fontSize:'0.78rem', color:'var(--gray-600)', fontWeight:600 }}>Code</label>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="GL" style={{ marginTop:3 }} />
        </div>
      </div>
      <div>
        <label style={{ fontSize:'0.78rem', color:'var(--gray-600)', fontWeight:600, display:'block', marginBottom:6 }}>Niveaux disponibles *</label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {ALL_NIVEAUX.map(n => (
            <label key={n} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontWeight:'normal', fontSize:'0.875rem', color:'var(--gray-700)' }}>
              <input type="checkbox" checked={nivx.includes(n)} onChange={()=>toggleNiveau(n)} style={{ width:'auto', padding:0 }} />
              {n}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button type="submit" className="btn btn-primary btn-sm"><Check size={13} />{initial ? 'Modifier' : 'Ajouter la filière'}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}><X size={13} />Annuler</button>
      </div>
    </form>
  )
}

/* ── Ligne Filière ── */
function LigneFiliere({ f, onEdit, onDelete, onToggle }) {
  const niveauxList = (() => {
    if (!f.niveaux) return []
    if (Array.isArray(f.niveaux)) return f.niveaux
    try { return JSON.parse(f.niveaux) } catch { return [] }
  })()
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'white', borderRadius:8, border:'1px solid var(--gray-200)', marginBottom:6 }}>
      <div style={{ flex:1 }}>
        <span style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--gray-800)' }}>{f.nom}</span>
        {f.code && <span style={{ marginLeft:8, fontSize:'0.75rem', color:'var(--gray-400)' }}>[{f.code}]</span>}
        <div style={{ marginTop:4, display:'flex', gap:4, flexWrap:'wrap' }}>
          {niveauxList.map(n => (
            <span key={n} style={{ padding:'1px 8px', background:'#eff6ff', color:'#1d4ed8', borderRadius:12, fontSize:'0.72rem', fontWeight:600 }}>{n}</span>
          ))}
        </div>
      </div>
      <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:12, background: f.is_active?'#f0fdf4':'#fef2f2', color: f.is_active?'#15803d':'#dc2626', fontWeight:600 }}>
        {f.is_active ? 'Active' : 'Inactive'}
      </span>
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(f)}><Pencil size={13} /></button>
        <button className={`btn btn-sm ${f.is_active?'btn-ghost':'btn-success'}`} onClick={()=>onToggle(f)} title={f.is_active?'Désactiver':'Activer'}>
          {f.is_active ? <X size={13}/> : <Check size={13}/>}
        </button>
        <button className="btn btn-danger btn-sm" onClick={()=>onDelete(f)}><Trash2 size={13} /></button>
      </div>
    </div>
  )
}

/* ── Bloc Département ── */
function BlocDepartement({ dept, ecole_id, onRefresh }) {
  const [open,      setOpen]      = useState(false)
  const [editDept,  setEditDept]  = useState(false)
  const [addFil,    setAddFil]    = useState(false)
  const [editFil,   setEditFil]   = useState(null)

  const handleEditDept = async data => {
    try {
      await api.patch(`/structure/departements/${dept.id}`, data)
      toast.success('Département mis à jour.'); onRefresh(); setEditDept(false)
    } catch { toast.error('Erreur.') }
  }
  const handleDeleteDept = async () => {
    if (!confirm(`Supprimer le département "${dept.nom}" et ses filières ?`)) return
    try { await api.delete(`/structure/departements/${dept.id}`); toast.success('Supprimé.'); onRefresh() }
    catch { toast.error('Erreur.') }
  }
  const handleToggleDept = async () => {
    try { await api.patch(`/structure/departements/${dept.id}`, { is_active: !dept.is_active }); onRefresh() }
    catch { toast.error('Erreur.') }
  }
  const handleAddFiliere = async data => {
    try {
      await api.post('/structure/filieres', data)
      toast.success('Filière ajoutée.'); onRefresh(); setAddFil(false)
    } catch { toast.error('Erreur.') }
  }
  const handleEditFiliere = async data => {
    try {
      await api.patch(`/structure/filieres/${editFil.id}`, data)
      toast.success('Filière mise à jour.'); onRefresh(); setEditFil(null)
    } catch { toast.error('Erreur.') }
  }
  const handleDeleteFiliere = async f => {
    if (!confirm(`Supprimer la filière "${f.nom}" ?`)) return
    try { await api.delete(`/structure/filieres/${f.id}`); toast.success('Filière supprimée.'); onRefresh() }
    catch { toast.error('Erreur.') }
  }
  const handleToggleFiliere = async f => {
    try { await api.patch(`/structure/filieres/${f.id}`, { is_active: !f.is_active }); onRefresh() }
    catch { toast.error('Erreur.') }
  }

  return (
    <div style={{ border:'1px solid var(--gray-200)', borderRadius:10, overflow:'hidden', marginBottom:10 }}>
      {/* Header département */}
      {editDept ? (
        <div style={{ padding:'10px 16px', background:'var(--gray-50)' }}>
          <FormDept ecole_id={ecole_id} initial={dept} onSave={handleEditDept} onCancel={()=>setEditDept(false)} />
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'var(--gray-50)', cursor:'pointer' }} onClick={()=>setOpen(o=>!o)}>
          <div style={{ color:'var(--gray-400)', flexShrink:0 }}>
            {open ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
          </div>
          <div style={{ flex:1 }}>
            <span style={{ fontWeight:700, color:'var(--gray-800)' }}>{dept.nom}</span>
            {dept.code && <span style={{ marginLeft:8, fontSize:'0.78rem', color:'var(--gray-400)' }}>[{dept.code}]</span>}
            <span style={{ marginLeft:10, fontSize:'0.75rem', color:'var(--gray-500)' }}>
              {dept.filieres?.length ?? 0} filière(s)
            </span>
          </div>
          <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:12, background: dept.is_active?'#f0fdf4':'#fef2f2', color: dept.is_active?'#15803d':'#dc2626', fontWeight:600 }}>
            {dept.is_active ? 'Actif' : 'Inactif'}
          </span>
          <div style={{ display:'flex', gap:6 }} onClick={e=>e.stopPropagation()}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setEditDept(true)}><Pencil size={13}/></button>
            <button className={`btn btn-sm ${dept.is_active?'btn-ghost':'btn-success'}`} onClick={handleToggleDept}>
              {dept.is_active ? <X size={13}/> : <Check size={13}/>}
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteDept}><Trash2 size={13}/></button>
          </div>
        </div>
      )}

      {/* Filières */}
      {open && (
        <div style={{ padding:'12px 16px', borderTop:'1px solid var(--gray-200)' }}>
          {dept.filieres?.length === 0 && !addFil && (
            <p style={{ color:'var(--gray-400)', fontSize:'0.82rem', marginBottom:10 }}>Aucune filière. Ajoutez-en une ci-dessous.</p>
          )}
          {(dept.filieres ?? []).map(f => (
            <div key={f.id}>
              {editFil?.id === f.id ? (
                <FormFiliere departement_id={dept.id} initial={f} onSave={handleEditFiliere} onCancel={()=>setEditFil(null)} />
              ) : (
                <LigneFiliere f={f} onEdit={setEditFil} onDelete={handleDeleteFiliere} onToggle={handleToggleFiliere} />
              )}
            </div>
          ))}

          {addFil ? (
            <FormFiliere departement_id={dept.id} onSave={handleAddFiliere} onCancel={()=>setAddFil(false)} />
          ) : (
            <button className="btn btn-ghost btn-sm" style={{ marginTop:6, color:'var(--primary)', borderColor:'var(--primary)' }} onClick={()=>setAddFil(true)}>
              <Plus size={13}/>Ajouter une filière
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Page principale ── */
export default function GestionStructure() {
  const [structure, setStructure] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [ecoleOuverte, setEcoleOuverte] = useState(null)
  const [addDept,   setAddDept]   = useState(null) // ecole_id

  const charger = useCallback(() => {
    setLoading(true)
    api.get('/structure/ecoles-structure')
      .then(r => setStructure(r.data.data || []))
      .catch(() => toast.error('Erreur de chargement.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(charger, [charger])

  const handleAddDept = async data => {
    try {
      await api.post('/structure/departements', data)
      toast.success('Département créé.'); charger(); setAddDept(null)
    } catch { toast.error('Erreur.') }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60 }}>
      <div className="spinner spinner-dark" style={{ width:36, height:36 }} />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Structure académique</h1>
          <p>Gérer les départements et filières de chaque établissement</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={charger}><RefreshCw size={14}/>Actualiser</button>
      </div>

      {structure.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--gray-400)' }}>
          <School size={48} style={{ marginBottom:12, opacity:0.3 }} />
          <p>Aucun établissement trouvé.</p>
          <p style={{ fontSize:'0.82rem', marginTop:6 }}>Créez d'abord un établissement dans l'onglet "Établissements".</p>
        </div>
      ) : structure.map(ecole => (
        <div key={ecole.id} style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:12, marginBottom:16, overflow:'hidden' }}>
          {/* Header école */}
          <div
            style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px', cursor:'pointer', borderBottom: ecoleOuverte===ecole.id ? '1px solid var(--gray-200)' : 'none' }}
            onClick={() => setEcoleOuverte(o => o===ecole.id ? null : ecole.id)}
          >
            <div style={{ width:40, height:40, background:'linear-gradient(135deg,#1e40af,#3b82f6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
              {ecole.sigle?.[0] ?? 'E'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--gray-900)' }}>{ecole.nom}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>
                {ecole.sigle && `${ecole.sigle} · `}{ecole.ville ?? ''}{ecole.ville && ecole.pays ? ', ' : ''}{ecole.pays ?? ''}
                {' · '}{ecole.departements?.length ?? 0} département(s)
              </div>
            </div>
            <div style={{ color:'var(--gray-400)' }}>
              {ecoleOuverte===ecole.id ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
            </div>
          </div>

          {/* Départements */}
          {ecoleOuverte === ecole.id && (
            <div style={{ padding:'16px 20px' }}>
              {ecole.departements?.length === 0 && !addDept && (
                <p style={{ color:'var(--gray-400)', fontSize:'0.875rem', marginBottom:12 }}>
                  Aucun département pour cet établissement.
                </p>
              )}

              {(ecole.departements ?? []).map(dept => (
                <BlocDepartement key={dept.id} dept={dept} ecole_id={ecole.id} onRefresh={charger} />
              ))}

              {addDept === ecole.id ? (
                <div style={{ background:'var(--gray-50)', border:'1px solid var(--primary)', borderRadius:10, padding:'14px 16px', marginTop:8 }}>
                  <p style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--gray-700)', marginBottom:8 }}>Nouveau département</p>
                  <FormDept ecole_id={ecole.id} onSave={handleAddDept} onCancel={()=>setAddDept(null)} />
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop:8 }}
                  onClick={() => setAddDept(ecole.id)}
                >
                  <Plus size={14}/>Ajouter un département
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
