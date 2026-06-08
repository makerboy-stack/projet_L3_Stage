import { BarChart2, GraduationCap, UserCheck, Users, Settings, School, LogOut, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { icon: BarChart2,    label: 'Tableau de bord',     page: 'dashboard' },
  { icon: GraduationCap,label: 'Étudiants',            page: 'etudiants' },
  { icon: UserCheck,   label: 'Encadrants',            page: 'encadrants' },
  { icon: Users,       label: 'Resp. Pédagogiques',    page: 'responsables' },
  { icon: Settings,    label: 'Tous les comptes',      page: 'tous' },
  { icon: School,      label: 'Établissements',        page: 'ecoles' },
]

export default function Sidebar({ activePage, setActivePage }) {
  const { user, deconnexion } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    deconnexion()
    toast.success('Déconnecté.')
    navigate('/connexion')
  }

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><Shield size={22} /></div>
        <h2>Admin Panel</h2>
        <p>Stages & Mémoires</p>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">Navigation</p>
        {NAV.map(({ icon: Icon, label, page }) => (
          <button key={page} className={`nav-item ${activePage === page ? 'active' : ''}`} onClick={() => setActivePage(page)}>
            <Icon size={17} />{label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px', marginBottom:8 }}>
          <div className="avatar" style={{ width:32, height:32, fontSize:'0.78rem' }}>{initiales}</div>
          <div>
            <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--gray-800)' }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>Administrateur</div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color:'var(--danger)' }}>
          <LogOut size={17} />Déconnexion
        </button>
      </div>
    </aside>
  )
}
