import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { vacancies, applications as applicationsApi, resumes } from '../services/api';
import { Application, Vacancy, Resume } from '../types';

const transformApplicationData = (data: any): Application => {
  return {
    id: data.ID || data.id,
    vacancy_id: data.VacancyID || data.vacancyId || data.vacancy_id,
    resume_id: data.ResumeID || data.resumeId || data.resume_id,
    user_id: data.UserID || data.userId || data.user_id,
    status: (data.Status || data.status || 'pending') as 'pending' | 'accepted' | 'rejected',
    created_at: data.CreatedAt || data.createdAt || data.created_at,
    updated_at: data.UpdatedAt || data.updatedAt || data.updated_at,
    applicant_name: data.ApplicantName || data.applicantName || data.applicant_name || '',
    applicant_email: data.ApplicantEmail || data.applicantEmail || data.applicant_email || '',
  };
};

const VacancyResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [applications, setApplications] = useState<(Application & { resume?: Resume })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<(Application & { resume?: Resume }) | null>(null);

  useEffect(() => {
    if (user?.role === 'employer' && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем данные вакансии
      const vacancyData = await vacancies.getById(id!);
      setVacancy(vacancyData);

      // Получаем все отклики
      const applicationsData = await applicationsApi.getAll();
      const transformedApplications = Array.isArray(applicationsData)
        ? applicationsData.map(transformApplicationData)
        : [transformApplicationData(applicationsData)];

      // Фильтруем отклики только для этой вакансии
      const vacancyApplications = transformedApplications.filter(app => 
        app.vacancy_id === parseInt(id!)
      );

      // Загружаем данные резюме для каждого отклика
      const applicationsWithResumes = await Promise.all(
        vacancyApplications.map(async (app) => {
          if (app.resume_id) {
            try {
              const resumeData = await resumes.getById(app.resume_id.toString());
              return {
                ...app,
                resume: resumeData
              };
            } catch (err) {
              console.error('Error fetching resume:', err);
              return app;
            }
          }
          return app;
        })
      );

      setApplications(applicationsWithResumes as (Application & { resume?: Resume })[]);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationClick = (application: Application & { resume?: Resume }) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const handleStatusChange = async (applicationId: number, newStatus: 'accepted' | 'rejected') => {
    try {
      await applicationsApi.updateStatus(applicationId, newStatus);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating application status:', err);
      setError(err.response?.data?.error || 'Failed to update application status');
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

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (user?.role !== 'employer') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Alert severity="error">Доступ запрещен</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Отклики на вакансию: {vacancy?.title}
        </Typography>

        {applications.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Пока нет откликов на эту вакансию
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Отклик от: {application.applicant_name || 'Имя не указано'}
                  </Typography>
                  {application.applicant_email && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email: {application.applicant_email}
                    </Typography>
                  )}
                  {application.resume && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Резюме: {application.resume.title || 'Без названия'}
                    </Typography>
                  )}
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
                    onClick={() => handleApplicationClick(application)}
                  >
                    Просмотреть детали
                  </Button>
                  {application.status === 'pending' && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleStatusChange(application.id, 'accepted')}
                      >
                        Принять
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                      >
                        Отклонить
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              Детали отклика
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Информация о соискателе
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Имя: {selectedApplication.applicant_name || 'Не указано'}
                    </Typography>
                    {selectedApplication.applicant_email && (
                      <Typography variant="body1" gutterBottom>
                        Email: {selectedApplication.applicant_email}
                      </Typography>
                    )}
                  </Paper>
                </Box>

                {selectedApplication.resume && (
                  <Box>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Резюме
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Название: {selectedApplication.resume.title}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Опыт работы: {selectedApplication.resume.experience}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Образование: {selectedApplication.resume.education}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Навыки: {selectedApplication.resume.skills?.join(', ')}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                <Box>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Статус отклика
                    </Typography>
                    <Chip
                      label={getStatusLabel(selectedApplication.status)}
                      color={getStatusColor(selectedApplication.status)}
                    />
                  </Paper>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Закрыть</Button>
              {selectedApplication.status === 'pending' && (
                <>
                  <Button
                    color="success"
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, 'accepted');
                      setOpenDialog(false);
                    }}
                  >
                    Принять
                  </Button>
                  <Button
                    color="error"
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, 'rejected');
                      setOpenDialog(false);
                    }}
                  >
                    Отклонить
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default VacancyResponses; 