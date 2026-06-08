import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, User, BookOpen, FileText, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    deconnexion();
    toast.success('Vous avez été déconnecté.');
    navigate('/connexion');
  };

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="dashboard-page">
      {/* Topbar */}
      <header className="topbar">
        <span className="topbar-brand">🎓 Portail Étudiant</span>
        <div className="topbar-user">
          <div className="avatar">{initiales}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.prenom} {user?.nom}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{user?.email}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Contenu */}
      <main className="dashboard-content">
        {/* Carte de bienvenue */}
        <div className="welcome-card">
          <h2>Bonjour, {user?.prenom} 👋</h2>
          <p>Bienvenue sur votre espace de gestion de stage et de mémoire.</p>
          <span className="badge-role">Étudiant</span>
        </div>

        {/* Infos rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <InfoCard icon={<User size={22} />} title="Mon profil" desc={`${user?.filiere ?? '—'} · ${user?.niveau ?? '—'}`} color="#2563eb" />
          <InfoCard icon={<BookOpen size={22} />} title="Mon stage" desc="Non déclaré" color="#7c3aed" />
          <InfoCard icon={<FileText size={22} />} title="Mon mémoire" desc="Aucun dépôt" color="#059669" />
          <InfoCard icon={<Clock size={22} />} title="Aptitude à soutenir" desc="En attente" color="#d97706" />
        </div>

        {/* Message informatif */}
        <div style={{
          marginTop: 28,
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 12,
          padding: 24,
        }}>
          <h3 style={{ marginBottom: 12, color: 'var(--gray-700)' }}>Prochaines étapes</h3>
          <ol style={{ paddingLeft: 20, color: 'var(--gray-600)', lineHeight: 2 }}>
            <li>Déclarez votre situation de stage (vous avez un stage ou non)</li>
            <li>Si vous avez un stage, renseignez les informations de votre entreprise</li>
            <li>Attendez que votre encadrant se prononce sur votre aptitude à soutenir</li>
            <li>Déposez votre mémoire une fois déclaré apte</li>
          </ol>
        </div>
      </main>
    </div>
  );
};

const InfoCard = ({ icon, title, desc, color }) => (
  <div style={{
    background: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
  }}>
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 10,
      background: color + '15',
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontWeight: 600, color: 'var(--gray-700)', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{desc}</div>
    </div>
  </div>
);

export default Dashboard;
