import { Heading } from 'evergreen-ui'
import Center from 'components/CenterPage'

const Home = () => (
  <Center>
    <Heading
      size={900}
      fontWeight={400}
      textTransform="uppercase"
      textAlign="center"
    >
      Home
    </Heading>
  </Center>
)

Home.displayName = 'Home'

export default Home
