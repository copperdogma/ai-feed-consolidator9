import { Navigate } from 'react-router-dom'
import React from 'react'
import { Spinner } from 'evergreen-ui'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  element: React.ComponentType
  [key: string]: unknown
}

const ProtectedRoute = ({
  element: Component,
  ...rest
}: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <Spinner>Loading...</Spinner>
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <Component {...rest} />
}

ProtectedRoute.displayName = 'ProtectedRoute'

export default ProtectedRoute
