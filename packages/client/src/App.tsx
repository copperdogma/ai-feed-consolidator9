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

function App() {
  const { queryClient, trpcClient } = useQueryTrpcClient()

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<ProtectedRoute element={Home} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/todo" element={<ProtectedRoute element={ToDo} />} />
              <Route path="*" element={<ProtectedRoute element={NotFound} />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default App
