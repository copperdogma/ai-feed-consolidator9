import { Button } from 'evergreen-ui'
import { useAuth } from '../../../hooks/useAuth'

const LogoutButton = () => {
  const { logout } = useAuth()

  return (
    <Button appearance="primary" cursor="pointer" onClick={() => logout()}>
      Logout
    </Button>
  )
}

LogoutButton.displayName = 'LogoutButton'

export default LogoutButton
