import { Heading, Pane, majorScale } from 'evergreen-ui'
import LogoutButton from 'views/Login/Auth/LogoutButton'
import { useAuth } from '../../hooks/useAuth'

const Home = () => {
  const { currentUser } = useAuth()

  return (
    <>
      {/* Header with app name and logout button */}
      <Pane
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        padding={majorScale(2)}
        borderBottom="1px solid #EDF0F2"
      >
        <Heading
          size={600}
          fontWeight={500}
          color="#234361"
        >
          AI Feed Consolidator
        </Heading>
        <LogoutButton />
      </Pane>

      {/* Main content */}
      <Pane 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
        padding={majorScale(4)}
      >
        <Heading
          size={900}
          fontWeight={400}
          textTransform="uppercase"
          textAlign="center"
          marginBottom={majorScale(2)}
        >
          Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}
        </Heading>
        <Heading
          size={500}
          fontWeight={400}
          textAlign="center"
          color="#66788A"
        >
          Your personalized AI-powered feed consolidator
        </Heading>
      </Pane>
    </>
  )
}

Home.displayName = 'Home'

export default Home
