import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { Work as WorkIcon, LocationOn as LocationIcon, Add as AddIcon } from '@mui/icons-material';
import { Vacancy } from '../types';
import { vacancies } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const transformVacancyData = (data: any): Vacancy => {
  return {
    id: data.ID || data.id,
    employerId: data.EmployerID || data.employerId,
    title: data.Title || data.title || 'Без названия',
    description: data.Description || data.description || 'Описание отсутствует',
    requirements: data.Requirements || data.requirements || '',
    responsibilities: data.Responsibilities || data.responsibilities || '',
    salary: Number(data.Salary || data.salary || 0),
    location: data.Location || data.location || 'Местоположение не указано',
    employmentType: data.EmploymentType || data.employmentType || '',
    company: data.Company || data.company || 'Компания не указана',
    status: data.Status || data.status || 'active',
    skills: Array.isArray(data.Skills || data.skills) ? (data.Skills || data.skills) : [],
    education: data.Education || data.education || '',
    createdAt: data.CreatedAt || data.createdAt || new Date().toISOString(),
    updatedAt: data.UpdatedAt || data.updatedAt || new Date().toISOString()
  };
};

const VacancyList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacanciesList, setVacanciesList] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchVacancies();
    }
  }, [user]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching vacancies...');
      const data = await vacancies.getAll();
      console.log('Received vacancies:', data);
      
      // Преобразуем данные
      const transformedData = Array.isArray(data) 
        ? data.map(transformVacancyData)
        : [transformVacancyData(data)];
      
      console.log('Transformed vacancies:', transformedData);
      setVacanciesList(transformedData);
    } catch (err: any) {
      console.error('Error fetching vacancies:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Failed to load vacancies');
      setVacanciesList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVacancies = vacanciesList?.filter(vacancy => {
    if (!vacancy || !vacancy.id) return false;
    const title = vacancy.title?.toLowerCase() || '';
    const description = vacancy.description?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return title.includes(query) || description.includes(query);
  }) || [];

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Вакансии
          </Typography>
          {user.role === 'employer' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/vacancies/create')}
            >
              Создать вакансию
            </Button>
          )}
        </Box>

        <TextField
          fullWidth
          label="Поиск вакансий"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 4 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredVacancies.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Вакансии не найдены
            </Typography>
            {user.role === 'employer' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/vacancies/create')}
              >
                Создать первую вакансию
              </Button>
            )}
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredVacancies.map((vacancy) => (
              <Card key={`vacancy-${vacancy.id}`}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {vacancy.title}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    {vacancy.company}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {[vacancy.location, vacancy.employmentType]
                      .filter(Boolean)
                      .join(' • ')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {vacancy.salary ? `${vacancy.salary.toLocaleString()} ₽` : 'Зарплата не указана'}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {vacancy.description}
                  </Typography>
                  <Chip
                    label={vacancy.status === 'active' ? 'Активна' : 'Закрыта'}
                    color={vacancy.status === 'active' ? 'success' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/vacancies/${vacancy.id}`)}
                  >
                    Подробнее
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default VacancyList; 