import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner fullScreen />

  if (!isAuthenticated) {
    window.location.href = '/login'
    return null
  }

  if (requireAdmin && !isAdmin) {
    window.location.href = '/'
    return null
  }

  return children
}
