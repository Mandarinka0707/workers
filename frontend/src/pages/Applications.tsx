import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { applications, vacancies } from '../services/api';
import { Application, Vacancy } from '../types';

const transformApplicationData = (data: any): Application => {
  return {
    id: data.id || data.ID,
    vacancyId: data.vacancyId || data.vacancy_id || data.VacancyID,
    resumeId: data.resumeId || data.resume_id || data.ResumeID,
    status: data.status || data.Status,
    applicantName: data.applicantName || data.applicant_name || data.ApplicantName,
    createdAt: data.createdAt || data.created_at || data.CreatedAt,
    updatedAt: data.updatedAt || data.updated_at || data.UpdatedAt
  };
};

const transformVacancyData = (data: any): Vacancy => {
  return {
    id: data.id || data.ID,
    employerId: data.employerId || data.EmployerID,
    title: data.title || data.Title,
    description: data.description || data.Description,
    requirements: data.requirements || data.Requirements,
    responsibilities: data.responsibilities || data.Responsibilities,
    salary: data.salary || data.Salary,
    location: data.location || data.Location,
    employmentType: data.employmentType || data.EmploymentType,
    company: data.company || data.Company,
    status: data.status || data.Status,
    skills: data.skills || data.Skills || [],
    education: data.education || data.Education,
    createdAt: data.createdAt || data.CreatedAt,
    updatedAt: data.updatedAt || data.UpdatedAt
  };
};

const Applications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applicationsList, setApplicationsList] = useState<Application[]>([]);
  const [vacanciesMap, setVacanciesMap] = useState<Record<number, Vacancy>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'jobseeker') {
      navigate('/');
      return;
    }
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const rawApplicationsData = await applications.getAll();
      console.log('Raw applications data:', JSON.stringify(rawApplicationsData, null, 2));

      const applicationsData = Array.isArray(rawApplicationsData)
        ? rawApplicationsData.map(transformApplicationData)
        : [transformApplicationData(rawApplicationsData)];

      console.log('Transformed applications data:', applicationsData);

      const vacancyIds = applicationsData
        .map((app: Application) => {
          console.log('Processing application:', {
            id: app.id,
            vacancyId: app.vacancyId,
            allFields: app
          });
          return app.vacancyId;
        })
        .filter((id: number | undefined | null): id is number => id !== undefined && id !== null);
      
      console.log('Filtered vacancy IDs:', vacancyIds);
      const uniqueVacancyIds = Array.from(new Set<number>(vacancyIds));
      console.log('Unique vacancy IDs:', uniqueVacancyIds);
      
      const vacanciesMap = await Promise.all(
        uniqueVacancyIds.map(async (id: number) => {
          try {
            console.log('Fetching vacancy with ID:', id);
            const rawVacancy = await vacancies.getById(id.toString());
            console.log('Raw vacancy data:', rawVacancy);
            const vacancy = transformVacancyData(rawVacancy);
            console.log('Transformed vacancy data:', vacancy);
            return vacancy;
          } catch (err) {
            console.error(`Failed to fetch vacancy ${id}:`, err);
            return null;
          }
        })
      ).then(vacancies => {
        const map = vacancies.reduce((acc: Record<number, Vacancy>, vacancy: Vacancy | null) => {
          if (vacancy) {
            acc[vacancy.id] = vacancy;
          }
          return acc;
        }, {} as Record<number, Vacancy>);
        console.log('Created vacancies map:', map);
        return map;
      });

      setVacanciesMap(vacanciesMap);
      setApplicationsList(applicationsData);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'На рассмотрении';
      case 'accepted':
        return 'Принято';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Мои заявки
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {applicationsList.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              У вас пока нет заявок
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/vacancies')}
            >
              Найти вакансии
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {applicationsList.map((application) => {
              console.log('Rendering application:', application);
              console.log('Looking for vacancy with ID:', application.vacancyId);
              console.log('Available vacancies:', vacanciesMap);
              const vacancy = vacanciesMap[application.vacancyId];
              console.log('Found vacancy:', vacancy);
              
              return (
                <Card key={application.id}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {vacancy?.title || 'Вакансия не найдена'}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                      {vacancy?.company || 'Компания не указана'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {vacancy?.location || 'Местоположение не указано'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={getStatusLabel(application.status)}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/vacancies/${application.vacancyId}`)}
                    >
                      Просмотреть вакансию
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigate(`/resumes/${application.resumeId}`)}
                    >
                      Просмотреть резюме
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default Applications; 