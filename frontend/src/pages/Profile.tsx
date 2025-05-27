import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/api';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const Profile: React.FC = () => {
  const { user, fetchUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.name.split(' ')[0] || '',
      lastName: user?.name.split(' ').slice(1).join(' ') || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await auth.updateProfile({ 
        name: fullName,
        email: formData.email
      });
      await fetchUserProfile();
      setSuccess('Профиль успешно обновлен');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Произошла ошибка при обновлении профиля');
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Профиль
            </Typography>
            {!isEditing && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEdit}
                variant="outlined"
              >
                Редактировать
              </Button>
            )}
          </Box>
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
                  required
                  disabled={!isEditing}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={!isEditing}
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
                  required
                  disabled={!isEditing}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Typography variant="subtitle1" gutterBottom>
                  Роль: {user.role === 'jobseeker' ? 'Соискатель' : 'Работодатель'}
                </Typography>
              </Box>
              {isEditing && (
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={<SaveIcon />}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                    startIcon={<CancelIcon />}
                  >
                    Отмена
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 