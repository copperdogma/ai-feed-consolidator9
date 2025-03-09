import { useState } from 'react'
import {
  Button,
  majorScale,
  Pane,
  TextInput,
  Heading,
  toaster,
  Popover,
  Position,
  Text
} from 'evergreen-ui'
import { useAuth } from '../../../hooks/useAuth'

type SignInButtonProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function SignInButton({ isOpen, setIsOpen }: SignInButtonProps) {
  const { signIn, signInWithGoogle, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn(email, password)
      toaster.success('Successfully signed in!')
      setIsOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in'
      toaster.danger(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      toaster.success('Successfully signed in with Google!')
      setIsOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google'
      toaster.danger(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Popover
        isShown={isOpen}
        onClose={() => setIsOpen(false)}
        position={Position.BOTTOM_LEFT}
        content={
          <Pane
            padding={majorScale(3)}
            width={300}
            display="flex"
            flexDirection="column"
            gap={majorScale(2)}
          >
            <Heading size={700} marginBottom={majorScale(2)}>
              Sign In
            </Heading>
            {authError && (
              <Text color="danger">{authError}</Text>
            )}
            <TextInput
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextInput
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              appearance="primary"
              intent="success"
              isLoading={isLoading}
              onClick={handleSignIn}
              marginTop={majorScale(1)}
            >
              Sign In
            </Button>
            <Pane marginTop={majorScale(1)} marginBottom={majorScale(1)}>
              <Text>Or</Text>
            </Pane>
            <Button
              appearance="default"
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
            >
              Sign In with Google
            </Button>
          </Pane>
        }
      >
        <Button
          appearance="minimal"
          cursor="pointer"
          onClick={() => setIsOpen(true)}
        >
          Sign In
        </Button>
      </Popover>
    </>
  )
}
