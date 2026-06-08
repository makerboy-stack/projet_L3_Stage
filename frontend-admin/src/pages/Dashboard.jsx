import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import DashboardStats from './DashboardStats'
import GestionUtilisateurs from './GestionUtilisateurs'
import GestionEcoles from './GestionEcoles'
import { useAuth } from '../context/AuthContext'

const TITLES = {
  dashboard:    'Tableau de bord',
  etudiants:    'Étudiants',
  encadrants:   'Encadrants',
  responsables: 'Responsables Pédagogiques',
  tous:         'Tous les comptes',
  ecoles:       'Établissements',
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const { user } = useAuth()

  const content = () => {
    switch (activePage) {
      case 'dashboard':    return <DashboardStats />
      case 'etudiants':    return <GestionUtilisateurs roleFilter="etudiant" />
      case 'encadrants':   return <GestionUtilisateurs roleFilter="encadrant" />
      case 'responsables': return <GestionUtilisateurs roleFilter="responsable_pedagogique" />
      case 'tous':         return <GestionUtilisateurs roleFilter={null} />
      case 'ecoles':       return <GestionEcoles />
      default:             return <DashboardStats />
    }
  }

  return (
    <div className="admin-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="admin-main">
        <header className="topbar">
          <span className="topbar-title">{TITLES[activePage]}</span>
          <div className="topbar-user">
            <div className="avatar">
              {`${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.prenom} {user?.nom}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>Administrateur</div>
            </div>
          </div>
        </header>

        <main className="page-content">{content()}</main>
      </div>
    </div>
  )
}
