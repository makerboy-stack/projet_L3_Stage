import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LogOut, Users, BookOpen, FileText, CheckCircle, XCircle, ClipboardList, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = {
  encadrant: 'Encadrant',
  responsable_pedagogique: 'Responsable Pédagogique',
}

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
          <button className="btn-logout" onClick={handleLogout}><LogOut size={14} />Déconnexion</button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Carte bienvenue */}
        <div className="welcome-card">
          <h2>Bonjour, {user?.prenom} 👋</h2>
          <p>
            {user?.role === 'encadrant' && 'Bienvenue sur votre espace de supervision des étudiants.'}
            {user?.role === 'responsable_pedagogique' && 'Bienvenue. Vous pouvez vérifier l\'état d\'encadrement des étudiants.'}
          </p>
          <span className="badge-role">{roleLabel}</span>
        </div>

        {/* Contenu selon rôle */}
        {user?.role === 'encadrant' && <DashboardEncadrant user={user} />}
        {user?.role === 'responsable_pedagogique' && <DashboardRP user={user} />}
      </main>
    </div>
  )
}

/* ── Encadrant ── */
function DashboardEncadrant({ user }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <InfoCard icon={<Users size={22} />} title="Étudiants supervisés" desc="0 étudiant" color="#7c3aed" />
        <InfoCard icon={<CheckCircle size={22} />} title="Déclarés aptes" desc="0" color="#16a34a" />
        <InfoCard icon={<XCircle size={22} />} title="Non aptes" desc="0" color="#dc2626" />
        <InfoCard icon={<BookOpen size={22} />} title="Mémoires déposés" desc="0" color="#0369a1" />
      </div>

      <div className="section-box">
        <h3>Vos informations</h3>
        <div style={{ color: 'var(--gray-500)', fontSize: '0.9rem', lineHeight: 2.2 }}>
          <Row label="Nom complet" value={`${user.prenom} ${user.nom}`} />
          <Row label="Email" value={user.email} />
          <Row label="Grade" value={user.grade} />
          <Row label="Spécialité" value={user.specialite} />
          <Row label="Téléphone" value={user.telephone} />
        </div>
      </div>

      <div className="section-box" style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #86efac' }}>
        <h3 style={{ color: '#15803d' }}>📋 Prochaines actions</h3>
        <ol style={{ paddingLeft: 20, color: 'var(--gray-600)', lineHeight: 2.2, fontSize: '0.9rem' }}>
          <li>Attendre qu'un étudiant vous soit assigné</li>
          <li>Consulter les mémoires soumis par vos étudiants</li>
          <li>Déclarer l'aptitude à soutenir pour chaque étudiant suivi</li>
        </ol>
      </div>
    </div>
  )
}

/* ── Responsable Pédagogique ── */
function DashboardRP({ user }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <InfoCard icon={<Users size={22} />} title="Total étudiants" desc="0" color="#0369a1" />
        <InfoCard icon={<CheckCircle size={22} />} title="Avec encadrant" desc="0" color="#16a34a" />
        <InfoCard icon={<XCircle size={22} />} title="Sans encadrant" desc="0" color="#dc2626" />
        <InfoCard icon={<ClipboardList size={22} />} title="Encadrants actifs" desc="0" color="#7c3aed" />
      </div>

      <div className="section-box">
        <h3>Vos informations</h3>
        <div style={{ color: 'var(--gray-500)', fontSize: '0.9rem', lineHeight: 2.2 }}>
          <Row label="Nom complet" value={`${user.prenom} ${user.nom}`} />
          <Row label="Email" value={user.email} />
          <Row label="Téléphone" value={user.telephone} />
        </div>
      </div>

      <div style={{ marginTop: 16, background: '#fef9c3', border: '1px solid #fde047', borderRadius: 12, padding: 20 }}>
        <p style={{ color: '#854d0e', fontSize: '0.9rem' }}>
          ⚠️ <strong>0 étudiant(s)</strong> n'ont pas encore d'encadrant assigné. Contactez l'administration.
        </p>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, desc, color }) {
  return (
    <div className="info-card">
      <div className="info-card-icon" style={{ background: color + '15', color }}>{icon}</div>
      <div>
        <div className="info-card-title">{title}</div>
        <div className="info-card-desc">{desc}</div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div><strong>{label} :</strong> {value ?? '—'}</div>
  )
}
