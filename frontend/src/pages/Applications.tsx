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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { applications, vacancies } from '../services/api';
import { Application, Vacancy } from '../types';

const transformApplicationData = (data: any): Application => {
  return {
    id: Number(data.id || data.ID),
    vacancy_id: Number(data.vacancy_id || data.vacancyId || data.VacancyID),
    resume_id: Number(data.resume_id || data.resumeId || data.ResumeID),
    user_id: Number(data.user_id || data.userId || data.UserID),
    status: data.status || data.Status,
    applicant_name: data.applicant_name || data.applicantName || data.ApplicantName,
    applicant_email: data.applicant_email || data.applicantEmail || data.ApplicantEmail,
    created_at: data.created_at || data.createdAt || data.CreatedAt,
    updated_at: data.updated_at || data.updatedAt || data.UpdatedAt
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
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [updateLoading, setUpdateLoading] = useState(false);

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
            vacancyId: app.vacancy_id,
            allFields: app
          });
          return app.vacancy_id;
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
            acc[Number(vacancy.id)] = vacancy;
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

  const handleStatusChange = (application: Application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication) return;

    try {
      setUpdateLoading(true);
      await applications.updateStatus(selectedApplication.id, newStatus);
      setApplicationsList(applicationsList.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: newStatus }
          : app
      ));
      setStatusDialogOpen(false);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
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
              console.log('Looking for vacancy with ID:', application.vacancy_id);
              console.log('Available vacancies:', vacanciesMap);
              const vacancy = vacanciesMap[application.vacancy_id];
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
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/vacancies/${application.vacancy_id}`)}
                    >
                      Просмотреть вакансию
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigate(`/resumes/${application.resume_id}`)}
                    >
                      Просмотреть резюме
                    </Button>
                    {user?.role === 'employer' && (
                      <Button
                        size="small"
                        onClick={() => handleStatusChange(application)}
                      >
                        Обновить статус
                      </Button>
                    )}
                  </CardActions>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Обновить статус заявки</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={newStatus}
              label="Статус"
              onChange={(e) => setNewStatus(e.target.value as 'pending' | 'accepted' | 'rejected')}
            >
              <MenuItem value="pending">На рассмотрении</MenuItem>
              <MenuItem value="accepted">Принято</MenuItem>
              <MenuItem value="rejected">Отклонено</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleStatusUpdate} 
            disabled={updateLoading}
            variant="contained"
          >
            {updateLoading ? <CircularProgress size={24} /> : 'Обновить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications; 