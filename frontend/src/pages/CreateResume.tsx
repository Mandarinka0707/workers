import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CreateResume: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    experience: '',
    education: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const skillsArray = formData.skills.split(',').map(skill => skill.trim());
      
      const response = await api.post('/resumes', {
        ...formData,
        skills: skillsArray,
        status: 'active'
      });

      console.log('Resume created:', response.data);
      navigate('/resumes');
    } catch (err: any) {
      console.error('Error creating resume:', err);
      setError(err.response?.data?.error || 'Failed to create resume');
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
        <Typography variant="h4" component="h1" gutterBottom>
          Создать резюме
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Название резюме"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={4}
            />

            <TextField
              fullWidth
              label="Навыки (через запятую)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Введите навыки через запятую"
            />

            <TextField
              fullWidth
              label="Опыт работы"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={4}
            />

            <TextField
              fullWidth
              label="Образование"
              name="education"
              value={formData.education}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={3}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Создание...' : 'Создать резюме'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/resumes')}
              >
                Отмена
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateResume; 