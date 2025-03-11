import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import Login from 'views/Login'
import Home from 'views/Home'
import ToDo from 'views/ToDo'
import { useQueryTrpcClient } from 'useQueryClient'
import NotFound from 'components/NotFound'
import ProtectedRoute from 'components/ProtectedRoute'
import { AuthProvider } from './hooks/useAuth'
import { trpc } from './lib/trpc'
import ProfilePage from 'views/Profile/ProfilePage'
import Navigation from 'components/Navigation'

function App() {
  const { queryClient, trpcClient } = useQueryTrpcClient()

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute
                    element={(props) => (
                      <>
                        <Navigation />
                        <Home {...props} />
                      </>
                    )}
                  />
                }
              />
              <Route
                path="/todo"
                element={
                  <ProtectedRoute
                    element={(props) => (
                      <>
                        <Navigation />
                        <ToDo {...props} />
                      </>
                    )}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute
                    element={(props) => (
                      <>
                        <Navigation />
                        <ProfilePage {...props} />
                      </>
                    )}
                  />
                }
              />
              <Route
                path="*"
                element={
                  <ProtectedRoute
                    element={(props) => (
                      <>
                        <Navigation />
                        <NotFound {...props} />
                      </>
                    )}
                  />
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default App
