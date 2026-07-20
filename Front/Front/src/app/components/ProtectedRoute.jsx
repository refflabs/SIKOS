import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        window.history.pushState({}, '', '/login')
        window.dispatchEvent(new PopStateEvent('popstate'))
      } else if (requireAdmin && !isAdmin) {
        window.history.pushState({}, '', '/')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin])

  if (isLoading) return <LoadingSpinner fullScreen />

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null
  }

  return children
}
