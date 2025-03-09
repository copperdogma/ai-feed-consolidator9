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

type SignUpButtonProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function SignUpButton({ isOpen, setIsOpen }: SignUpButtonProps) {
  const { signUp, signInWithGoogle, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toaster.danger('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      await signUp(email, password)
      toaster.success('Account created successfully!')
      setIsOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign up'
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
              Sign Up
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
            <TextInput
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              appearance="primary"
              intent="success"
              isLoading={isLoading}
              onClick={handleSignUp}
              marginTop={majorScale(1)}
            >
              Sign Up
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
          appearance="primary"
          cursor="pointer"
          onClick={() => setIsOpen(true)}
        >
          Sign Up
        </Button>
      </Popover>
    </>
  )
}
