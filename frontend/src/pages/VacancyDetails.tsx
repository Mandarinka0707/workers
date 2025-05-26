import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Vacancy } from '../types';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const VacancyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchVacancy();
  }, [id]);

  const fetchVacancy = async () => {
    try {
      const response = await api.get(`/vacancies/${id}`);
      setVacancy(response.data);
    } catch (err) {
      setError('Не удалось загрузить информацию о вакансии');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!vacancy) return;

    setApplying(true);
    try {
      await api.post(`/applications`, {
        vacancyId: vacancy.id,
        resumeId: null // TODO: Add resume selection
      });
      navigate('/applications');
    } catch (err) {
      setError('Не удалось отправить заявку');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vacancy) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Вакансия не найдена'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {vacancy.title}
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {vacancy.company}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {vacancy.employmentType}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {vacancy.location}
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            {vacancy.salary.toLocaleString()} ₽
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Chip
              icon={<BusinessIcon />}
              label={vacancy.company}
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              icon={<WorkIcon />}
              label={vacancy.employmentType}
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              icon={<LocationIcon />}
              label={vacancy.location}
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              icon={<MoneyIcon />}
              label={`${vacancy.salary} ₽`}
              sx={{ mb: 1 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Описание
              </Typography>
              <Typography variant="body1" paragraph>
                {vacancy.description}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Требования
              </Typography>
              <Typography paragraph>
                {vacancy.requirements}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Обязанности
              </Typography>
              <Typography paragraph>
                {vacancy.responsibilities}
              </Typography>
            </Box>

            {user?.role === 'jobseeker' && (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? 'Отправка...' : 'Откликнуться'}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VacancyDetails; 