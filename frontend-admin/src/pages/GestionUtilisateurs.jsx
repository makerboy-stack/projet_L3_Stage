import { useEffect, useState, useCallback } from 'react'
import { Search, Trash2, ToggleLeft, ToggleRight, Users, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const ROLE_LABELS = { etudiant: 'Étudiant', encadrant: 'Encadrant', responsable_pedagogique: 'Resp. Péda.' }
const ROLE_BADGE  = { etudiant: 'badge-etudiant', encadrant: 'badge-encadrant', responsable_pedagogique: 'badge-rp' }
const AVATAR_COLORS = {
  etudiant: { bg: '#eff6ff', color: '#1d4ed8' },
  encadrant: { bg: '#f5f3ff', color: '#6d28d9' },
  responsable_pedagogique: { bg: '#fef3c7', color: '#92400e' },
}

function ConfirmModal({ user, action, onConfirm, onCancel }) {
  const isDelete = action === 'delete'
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{isDelete ? 'Supprimer le compte' : `${user?.is_active ? 'Désactiver' : 'Activer'} le compte`}</h3>
        <p>
          {isDelete
            ? `Voulez-vous vraiment supprimer le compte de ${user?.prenom} ${user?.nom} ? Cette action est irréversible.`
            : `Voulez-vous ${user?.is_active ? 'désactiver' : 'activer'} le compte de ${user?.prenom} ${user?.nom} ?`}
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Annuler</button>
          <button
            className={`btn btn-sm ${isDelete || user?.is_active ? 'btn-danger' : 'btn-success'}`}
            onClick={onConfirm}
          >Confirmer</button>
        </div>
      </div>
    </div>
  )
}

export default function GestionUtilisateurs({ roleFilter }) {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statut, setStatut]   = useState('')
  const [modal, setModal]     = useState(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (roleFilter) p.append('role', roleFilter)
    if (search)     p.append('search', search)
    if (statut)     p.append('is_active', statut)
    api.get(`/admin/utilisateurs?${p}`)
      .then(r => setUsers(r.data.data))
      .catch(() => toast.error('Erreur de chargement.'))
      .finally(() => setLoading(false))
  }, [roleFilter, search, statut])

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [fetchUsers])

  const handleToggle = async () => {
    try {
      await api.patch(`/admin/utilisateurs/${modal.user.id}/statut`)
      toast.success(`Compte ${modal.user.is_active ? 'désactivé' : 'activé'}.`)
      setModal(null); fetchUsers()
    } catch { toast.error('Erreur.') }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/utilisateurs/${modal.user.id}`)
      toast.success('Compte supprimé.')
      setModal(null); fetchUsers()
    } catch { toast.error('Erreur.') }
  }

  const TITLES = {
    etudiant: 'Étudiants', encadrant: 'Encadrants',
    responsable_pedagogique: 'Responsables Pédagogiques', null: 'Tous les comptes'
  }

  return (
    <div>
      {modal && (
        <ConfirmModal
          user={modal.user} action={modal.action}
          onConfirm={modal.action === 'delete' ? handleDelete : handleToggle}
          onCancel={() => setModal(null)}
        />
      )}

      <div className="page-header">
        <div>
          <h1>{TITLES[roleFilter] ?? 'Tous les comptes'}</h1>
          <p>Gérer les comptes utilisateurs de la plateforme</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchUsers}><RefreshCw size={14} />Actualiser</button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-filters">
            <div className="search-box">
              <Search size={14} className="input-icon" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>
          <span style={{ fontSize:'0.82rem', color:'var(--gray-400)' }}>{users.length} compte(s)</span>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner spinner-dark" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><Users size={40} /><p>Aucun utilisateur trouvé</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  {!roleFilter && <th>Rôle</th>}
                  <th>Établissement</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const initiales = `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase()
                  const av = AVATAR_COLORS[u.role] ?? { bg: '#f3f4f6', color: '#6b7280' }
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm" style={{ background: av.bg, color: av.color }}>{initiales}</div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{u.prenom} {u.nom}</div>
                            {u.numero_etudiant && <div style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>N° {u.numero_etudiant}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize:'0.82rem' }}>{u.email}</td>
                      {!roleFilter && (
                        <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABELS[u.role] ?? u.role}</span></td>
                      )}
                      <td style={{ fontSize:'0.82rem' }}>
                        {u.ecoleInfo ? (u.ecoleInfo.sigle || u.ecoleInfo.nom) : '—'}
                      </td>
                      <td><span className={`badge ${u.is_active ? 'badge-actif' : 'badge-inactif'}`}>{u.is_active ? 'Actif' : 'Inactif'}</span></td>
                      <td style={{ fontSize:'0.8rem', color:'var(--gray-400)' }}>
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn btn-ghost btn-sm"
                            title={u.is_active ? 'Désactiver' : 'Activer'}
                            onClick={() => setModal({ user: u, action: 'toggle' })}
                          >
                            {u.is_active
                              ? <ToggleRight size={16} style={{ color: 'var(--success)' }} />
                              : <ToggleLeft size={16} style={{ color: 'var(--gray-400)' }} />}
                          </button>
                          <button className="btn btn-danger btn-sm" title="Supprimer" onClick={() => setModal({ user: u, action: 'delete' })}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
