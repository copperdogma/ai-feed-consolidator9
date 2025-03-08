import { Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { trpc } from 'lib/trpc'
import React from 'react'
import { Spinner } from 'evergreen-ui'

interface ProtectedRouteProps {
  element: React.ComponentType
  [key: string]: unknown
}

const ProtectedRoute = ({
  element: Component,
  ...rest
}: ProtectedRouteProps) => {
  const queryClient = useQueryClient()
  const {
    data: user,
    isLoading,
    isError
  } = trpc.auth.getUser.useQuery(undefined, {
    retry: false,
    onError: () => {
      queryClient.setQueryData(['auth', 'user'], null)
    }
  })

  if (isLoading || user === undefined) {
    return <Spinner>Loading...</Spinner>
  }

  if (isError || user === null) {
    return <Navigate to="/login" replace />
  }

  return <Component {...rest} />
}

ProtectedRoute.displayName = 'ProtectedRoute'

export default ProtectedRoute
