import { BarChart2, GraduationCap, UserCheck, Users, Settings, School, LogOut, BookOpen } from 'lucide-react'
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
  { icon: BookOpen,    label: 'Depts & Filières',      page: 'structure' },
]

/* ── Logo SenMémoire SVG inline ── */
function LogoSenMemoire() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      {/* Icône toque */}
      <div style={{
        width: 46, height: 46,
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Toque de diplômé */}
          <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" fillOpacity="0.95"/>
          <path d="M2 8v6M22 8v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7 10.5v4.5c0 1.5 2 3 5 3s5-1.5 5-3V10.5" fill="white" fillOpacity="0.7"/>
          <circle cx="22" cy="8" r="1.5" fill="white"/>
          <line x1="22" y1="9.5" x2="22" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        {/* Nom stylisé */}
        <div style={{ lineHeight: 1.1 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)', display: 'block', letterSpacing: '0.05em' }}>
            Sen
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Mémoire
          </span>
        </div>
      </div>
    </div>
  )
}

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
      <div className="sidebar-brand" style={{ paddingBottom: 16 }}>
        <LogoSenMemoire />
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Panneau d'administration
        </p>
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
            <div style={{ fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.38)' }}>Administrateur</div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color:'#fca5a5' }}>
          <LogOut size={17} />Déconnexion
        </button>
      </div>
    </aside>
  )
}
