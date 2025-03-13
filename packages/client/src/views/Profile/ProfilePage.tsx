import { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Container, TextField, Avatar, Typography, Stack, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';
import { trpc } from '../../lib/trpc';

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginBottom: theme.spacing(2),
  border: `2px solid ${theme.palette.primary.main}`,
}));

export default function ProfilePage() {
  const { currentUser, testUserCreation } = useAuth();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testingUserCreation, setTestingUserCreation] = useState(false);
  const [userCreationSuccess, setUserCreationSuccess] = useState(false);
  const [userCreationError, setUserCreationError] = useState<string | null>(null);

  // Get user profile from the server
  const { data: profileData, isLoading, refetch } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!currentUser,
    onSuccess: (data) => {
      if (!isEditing) {
        setName(data?.name || '');
        setAvatar(data?.avatar || '');
      }
    },
  });

  // Update profile mutation
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
      refetch();
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    },
  });

  // Save profile changes
  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name,
      avatar,
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setName(profileData?.name || '');
    setAvatar(profileData?.avatar || '');
  };

  // Start editing
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Test user creation
  const handleTestUserCreation = async () => {
    setTestingUserCreation(true);
    setUserCreationSuccess(false);
    setUserCreationError(null);
    
    try {
      const result = await testUserCreation();
      if (result) {
        setUserCreationSuccess(true);
        setTimeout(() => setUserCreationSuccess(false), 3000);
        refetch(); // Refetch user data to show the updated profile
      } else {
        setUserCreationError('Failed to create user record');
        setTimeout(() => setUserCreationError(null), 5000);
      }
    } catch (error) {
      setUserCreationError((error as Error)?.message || 'An error occurred');
      setTimeout(() => setUserCreationError(null), 5000);
    } finally {
      setTestingUserCreation(false);
    }
  };

  // Update Firebase display name when user profile changes
  useEffect(() => {
    if (currentUser && profileData?.name && currentUser.displayName !== profileData.name) {
      // Note: This is handled by Firebase and would require additional code to update
      // the Firebase user profile, which we're not implementing in this story
    }
  }, [currentUser, profileData]);

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardHeader title="User Profile" />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}
          {userCreationError && <Alert severity="error" sx={{ mb: 2 }}>{userCreationError}</Alert>}
          {userCreationSuccess && <Alert severity="success" sx={{ mb: 2 }}>User record created successfully!</Alert>}
          
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <ProfileAvatar
              src={avatar || currentUser?.photoURL || undefined}
              alt={name || currentUser?.displayName || 'User'}
            />
            <Typography variant="h5" gutterBottom>
              {isEditing ? 'Edit Profile' : (profileData?.name || currentUser?.displayName || 'User')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {profileData?.email || currentUser?.email}
            </Typography>
          </Box>

          {isEditing ? (
            <Stack spacing={3}>
              <TextField
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                fullWidth
                helperText="Enter the URL of your profile picture"
              />
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Stack>
          ) : (
            <Box display="flex" justifyContent="space-between">
              <Button 
                variant="outlined" 
                color="warning" 
                onClick={handleTestUserCreation}
                disabled={testingUserCreation}
              >
                {testingUserCreation ? 'Testing...' : 'Test User Creation'}
              </Button>
              <Button variant="contained" onClick={handleEdit}>
                Edit Profile
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
} 