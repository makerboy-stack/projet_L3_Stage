import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, School, RefreshCw, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const EMPTY = { nom: '', sigle: '', ville: '', pays: 'Sénégal', description: '' }

function FormEcole({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    nom: initial.nom || '', sigle: initial.sigle || '',
    ville: initial.ville || '', pays: initial.pays || 'Sénégal', description: initial.description || ''
  } : { ...EMPTY })

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    if (!form.nom.trim()) return toast.error('Le nom est obligatoire.')
    onSave(form)
  }

  return (
    <form onSubmit={submit} className="inline-form">
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Nom complet *</label>
          <div className="input-wrapper"><School size={15} className="input-icon" /><input name="nom" value={form.nom} onChange={set} placeholder="École Supérieure Polytechnique" /></div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Sigle</label>
          <div className="input-wrapper"><input name="sigle" value={form.sigle} onChange={set} placeholder="ESP" style={{ paddingLeft: 14 }} /></div>
        </div>
      </div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Ville</label>
          <div className="input-wrapper"><input name="ville" value={form.ville} onChange={set} placeholder="Dakar" style={{ paddingLeft: 14 }} /></div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Pays</label>
          <div className="input-wrapper"><input name="pays" value={form.pays} onChange={set} placeholder="Sénégal" style={{ paddingLeft: 14 }} /></div>
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label>Description</label>
        <div className="input-wrapper">
          <textarea name="description" value={form.description} onChange={set} rows={2} placeholder="Description optionnelle..." style={{ paddingLeft: 14, resize: 'vertical' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}><X size={14} />Annuler</button>
        <button type="submit" className="btn btn-primary btn-sm"><Check size={14} />{initial ? 'Enregistrer' : 'Ajouter'}</button>
      </div>
    </form>
  )
}

export default function GestionEcoles() {
  const [ecoles, setEcoles]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editEcole, setEditEcole]   = useState(null)
  const [toDelete, setToDelete]     = useState(null)

  const fetch = () => {
    setLoading(true)
    api.get('/ecoles/admin/liste')
      .then(r => setEcoles(r.data.data || []))
      .catch(() => toast.error('Erreur de chargement.'))
      .finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const handleCreate = async data => {
    try {
      await api.post('/ecoles', data)
      toast.success('Établissement créé.')
      setShowForm(false); fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
  }

  const handleEdit = async data => {
    try {
      await api.patch(`/ecoles/${editEcole.id}`, data)
      toast.success('Établissement mis à jour.')
      setEditEcole(null); fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.') }
  }

  const handleToggle = async ecole => {
    try {
      await api.patch(`/ecoles/${ecole.id}`, { is_active: !ecole.is_active })
      toast.success(`Établissement ${!ecole.is_active ? 'activé' : 'masqué'}.`)
      fetch()
    } catch { toast.error('Erreur.') }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/ecoles/${toDelete.id}`)
      toast.success('Établissement supprimé.')
      setToDelete(null); fetch()
    } catch { toast.error('Erreur.') }
  }

  return (
    <div>
      {/* Modal suppression */}
      {toDelete && (
        <div className="modal-overlay" onClick={() => setToDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Supprimer l'établissement</h3>
            <p>Voulez-vous supprimer <strong>{toDelete.nom}</strong> ? Les comptes liés ne seront pas supprimés.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setToDelete(null)}>Annuler</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div><h1>Établissements</h1><p>Gérer les écoles disponibles à l'inscription</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={fetch}><RefreshCw size={14} />Actualiser</button>
          {!showForm && !editEcole && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={14} />Nouvel établissement</button>
          )}
        </div>
      </div>

      {showForm && <FormEcole onSave={handleCreate} onCancel={() => setShowForm(false)} />}
      {editEcole && <FormEcole initial={editEcole} onSave={handleEdit} onCancel={() => setEditEcole(null)} />}

      <div className="table-container">
        {loading ? (
          <div className="loading-center"><div className="spinner spinner-dark" /></div>
        ) : ecoles.length === 0 ? (
          <div className="empty-state">
            <School size={40} />
            <p>Aucun établissement enregistré</p>
            <p style={{ marginTop: 6, fontSize: '0.8rem' }}>Cliquez sur "Nouvel établissement" pour commencer.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Établissement</th>
                  <th>Sigle</th>
                  <th>Ville</th>
                  <th>Pays</th>
                  <th>Visibilité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ecoles.map(ecole => (
                  <tr key={ecole.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ecole.nom}</div>
                      {ecole.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 }}>
                          {ecole.description.length > 70 ? ecole.description.substring(0, 70) + '…' : ecole.description}
                        </div>
                      )}
                    </td>
                    <td>
                      {ecole.sigle && <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>{ecole.sigle}</span>}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{ecole.ville || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{ecole.pays || '—'}</td>
                    <td>
                      <span className={`badge ${ecole.is_active ? 'badge-actif' : 'badge-inactif'}`}>
                        {ecole.is_active ? 'Visible' : 'Masqué'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-ghost btn-sm" title="Modifier" onClick={() => { setShowForm(false); setEditEcole(ecole) }}>
                          <Pencil size={14} />
                        </button>
                        <button
                          className={`btn btn-sm ${ecole.is_active ? 'btn-ghost' : 'btn-success'}`}
                          title={ecole.is_active ? 'Masquer' : 'Afficher'}
                          onClick={() => handleToggle(ecole)}
                        >
                          {ecole.is_active ? <X size={14} /> : <Check size={14} />}
                        </button>
                        <button className="btn btn-danger btn-sm" title="Supprimer" onClick={() => setToDelete(ecole)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
