import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Connexion        from './pages/Connexion'
import Inscription      from './pages/Inscription'
import Dashboard        from './pages/Dashboard'
import MotDePasseOublie from './pages/MotDePasseOublie'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: 10, fontSize: '0.9rem' } }} />
        <Routes>
          <Route path="/"                    element={<Navigate to="/connexion" replace />} />
          <Route path="/connexion"           element={<Connexion />} />
          <Route path="/inscription"         element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/dashboard"           element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*"                    element={<Navigate to="/connexion" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
