import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}><div className="spinner" style={{ width:40, height:40, borderColor:'#7c3aed30', borderTopColor:'#7c3aed' }} /></div>
  if (!user) return <Navigate to="/connexion" replace />
  return children
}

export default ProtectedRoute
