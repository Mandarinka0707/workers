import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vacancies } from '../services/api';
import { Vacancy } from '../types/index';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import VacancyFilter from '../components/VacancyFilter';

function transformVacancy(data: any): Vacancy {
  return {
    id: String(data.ID ?? data.id ?? ''),
    employerId: String(data.EmployerID ?? data.employerId ?? ''),
    title: data.Title ?? data.title ?? '',
    description: data.Description ?? data.description ?? '',
    requirements: typeof data.Requirements === 'string'
      ? data.Requirements.split(',').map((r: string) => r.trim()).filter(Boolean)
      : Array.isArray(data.requirements) ? data.requirements : [],
    responsibilities: data.Responsibilities ?? data.responsibilities ?? '',
    salary: String(data.Salary ?? data.salary ?? ''),
    location: data.Location ?? data.location ?? '',
    employmentType: data.EmploymentType ?? data.employmentType ?? '',
    company: data.Company ?? data.company ?? '',
    status: data.Status ?? data.status ?? 'active',
    skills: Array.isArray(data.Skills) ? data.Skills : Array.isArray(data.skills) ? data.skills : [],
    education: data.Education ?? data.education ?? '',
    createdAt: data.CreatedAt ?? data.createdAt ?? '',
    updatedAt: data.UpdatedAt ?? data.updatedAt ?? '',
  };
}

const VacancyList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacanciesList, setVacanciesList] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    salary: '',
    status: '',
  });

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vacancies.getAll();
      setVacanciesList(Array.isArray(data) ? data.map(transformVacancy) : []);
    } catch (err) {
      setError('Failed to load vacancies');
      console.error('Error loading vacancies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vacancy?')) {
      try {
        await vacancies.delete(id);
        setVacanciesList(vacanciesList.filter(v => String(v.id) !== id));
      } catch (err) {
        setError('Failed to delete vacancy');
        console.error('Error deleting vacancy:', err);
      }
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredVacancies = vacanciesList.filter(vacancy => {
    const matchesTitle = (vacancy.title ?? '').toLowerCase().includes(filters.title.toLowerCase());
    const matchesLocation = (vacancy.location ?? '').toLowerCase().includes(filters.location.toLowerCase());
    const matchesSalary = (vacancy.salary ?? '').toLowerCase().includes(filters.salary.toLowerCase());
    const matchesStatus = !filters.status || vacancy.status === filters.status;

    return matchesTitle && matchesLocation && matchesSalary && matchesStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Вакансии
        </Typography>
        {user?.role === 'employer' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vacancies/create')}
          >
            Создать вакансию
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <VacancyFilter filters={filters} onFilterChange={handleFilterChange} />

      <Box sx={{ display: 'grid', gap: 3 }}>
        {filteredVacancies.map((vacancy) => (
          <Card key={vacancy.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  {vacancy.title}
                </Typography>
                <Chip
                  label={vacancy.status === 'active' ? 'Активна' : 'В архиве'}
                  color={vacancy.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Typography color="text.secondary" gutterBottom>
                {vacancy.location}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {vacancy.salary}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {vacancy.description}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Array.isArray(vacancy.requirements) && vacancy.requirements.map((req: string) => (
                  <Chip key={req.trim()} label={req.trim()} size="small" />
                ))}
              </Stack>
            </CardContent>
            <CardActions>
              <Tooltip title="Просмотреть">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/vacancies/${vacancy.id}`)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              {user?.role === 'employer' && (
                <>
                  <Tooltip title="Редактировать">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/vacancies/${vacancy.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(String(vacancy.id))}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default VacancyList; 