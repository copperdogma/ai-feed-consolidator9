import { Link } from 'react-router-dom';
import { Pane, Button, Avatar, Menu, Popover, Position } from 'evergreen-ui';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from '../views/Login/Auth/LogoutButton';

const Navigation = () => {
  const { currentUser } = useAuth();
  
  return (
    <Pane
      display="flex"
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      padding={16}
      borderBottom="1px solid #EDF0F2"
      background="white"
    >
      <Pane>
        <Link to="/" style={{ textDecoration: 'none', marginRight: 16 }}>
          <Button appearance="minimal">Home</Button>
        </Link>
        <Link to="/feeds" style={{ textDecoration: 'none', marginRight: 16 }}>
          <Button appearance="minimal">Feeds</Button>
        </Link>
      </Pane>
      
      <Pane display="flex" alignItems="center">
        <Popover
          position={Position.BOTTOM_RIGHT}
          content={
            <Menu>
              <Menu.Group>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <Menu.Item>Profile</Menu.Item>
                </Link>
                <Link to="/feeds" style={{ textDecoration: 'none' }}>
                  <Menu.Item>Manage Feeds</Menu.Item>
                </Link>
              </Menu.Group>
              <Menu.Divider />
              <Menu.Group>
                <Menu.Item>
                  <LogoutButton />
                </Menu.Item>
              </Menu.Group>
            </Menu>
          }
        >
          <Avatar
            src={currentUser?.photoURL || undefined}
            name={currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
            size={32}
            cursor="pointer"
          />
        </Popover>
      </Pane>
    </Pane>
  );
};

export default Navigation; 