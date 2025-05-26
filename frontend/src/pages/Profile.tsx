import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // TODO: Implement profile update API call
      setSuccess('Профиль успешно обновлен');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Профиль
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Имя"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Typography variant="subtitle1" gutterBottom>
                  Роль: {user.role === 'jobseeker' ? 'Соискатель' : 'Работодатель'}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 