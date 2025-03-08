import { Button } from 'evergreen-ui'
import { trpc } from 'lib/trpc'

const LogoutButton = () => {
  const utils = trpc.useUtils()
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => utils.auth.getUser.invalidate()
  })

  return (
    <Button appearance="primary" cursor="pointer" onClick={() => logout.mutate()}>
      Logout
    </Button>
  )
}

LogoutButton.displayName = 'LogoutButton'

export default LogoutButton
