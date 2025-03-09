import { Pane, majorScale, Button, Heading, Spinner, toaster } from 'evergreen-ui'
import NavBar from 'views/Login/Auth/NavBar'
import TechStack from 'views/Login/TechStack'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { signInWithGoogle, loading, currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Redirect if user is already logged in
  if (currentUser) {
    navigate('/')
    return null
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Pane display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner />
      </Pane>
    )
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      toaster.success('Successfully signed in with Google!')
      navigate('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google'
      toaster.danger(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Pane width="100%" height="100%" maxHeight={majorScale(200)}>
      <NavBar />
      <Pane
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap={majorScale(5)}
        height={majorScale(90)}
        position="relative"
      >
        <Heading size={900} marginBottom={majorScale(4)}>AI Feed Consolidator</Heading>
        <Button
          appearance="primary"
          intent="success"
          onClick={handleGoogleSignIn}
          isLoading={isLoading}
          height={majorScale(6)}
          fontSize={majorScale(2)}
        >
          Sign in with Google
        </Button>
        <TechStack />
      </Pane>
    </Pane>
  )
}

Login.displayName = 'Login'

export default Login
