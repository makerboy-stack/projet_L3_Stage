import { useEffect, useState } from 'react'
import { GraduationCap, UserCheck, Users, Activity, XCircle, TrendingUp } from 'lucide-react'
import api from '../api/axios'

export default function DashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner spinner-dark" /></div>

  const cards = [
    { icon: GraduationCap, label: 'Étudiants',       value: stats?.totalEtudiants ?? 0, bg: '#eff6ff', color: '#1d4ed8' },
    { icon: UserCheck,     label: 'Encadrants',       value: stats?.totalEncadrants ?? 0, bg: '#f5f3ff', color: '#6d28d9' },
    { icon: Users,         label: 'Resp. Péda.',      value: stats?.totalRP ?? 0, bg: '#fef3c7', color: '#92400e' },
    { icon: Activity,      label: 'Comptes actifs',   value: stats?.totalActifs ?? 0, bg: '#f0fdf4', color: '#15803d' },
    { icon: XCircle,       label: 'Comptes inactifs', value: stats?.totalInactifs ?? 0, bg: '#fef2f2', color: '#dc2626' },
  ]

  return (
    <div>
      <div className="page-header">
        <div><h1>Tableau de bord</h1><p>Vue d'ensemble de la plateforme</p></div>
      </div>

      <div className="stats-grid">
        {cards.map(({ icon: Icon, label, value, bg, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}><Icon size={22} /></div>
            <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ background:'white', border:'1px solid var(--gray-200)', borderRadius:12, padding:28, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ width:52, height:52, borderRadius:12, background:'#fffbeb', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <TrendingUp size={26} />
        </div>
        <div>
          <div style={{ fontSize:'0.82rem', color:'var(--gray-500)', marginBottom:4 }}>Total utilisateurs inscrits</div>
          <div style={{ fontSize:'2.4rem', fontWeight:800, color:'var(--primary)', lineHeight:1 }}>{stats?.totalUtilisateurs ?? 0}</div>
          <div style={{ fontSize:'0.78rem', color:'var(--gray-400)', marginTop:4 }}>Étudiants + Encadrants + Responsables pédagogiques</div>
        </div>
      </div>
    </div>
  )
}
