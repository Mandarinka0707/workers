import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'jobseeker' | 'employer';
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'jobseeker'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5">
            Регистрация
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box>
                <TextField
                  required
                  fullWidth
                  label="Имя"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleTextFieldChange}
                />
              </Box>
              <Box>
                <TextField
                  required
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleTextFieldChange}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleTextFieldChange}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField
                  required
                  fullWidth
                  label="Пароль"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleTextFieldChange}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField
                  required
                  fullWidth
                  label="Подтвердите пароль"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleTextFieldChange}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <FormControl fullWidth>
                  <InputLabel>Тип аккаунта</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="Тип аккаунта"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="jobseeker">Соискатель</MenuItem>
                    <MenuItem value="employer">Работодатель</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Уже есть аккаунт? Войдите
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 