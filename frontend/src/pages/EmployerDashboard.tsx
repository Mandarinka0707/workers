import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
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
  Divider,
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { vacancies, applications as applicationsApi, resumes } from '../services/api';
import { Application, Vacancy, Resume } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const transformResumeData = (data: any): Resume => {
  return {
    id: Number(data.id || data.ID),
    userId: String(data.user_id || data.userId || data.UserID),
    title: data.title || data.Title,
    description: data.description || data.Description,
    skills: Array.isArray(data.skills || data.Skills) ? data.skills || data.Skills : [],
    experience: data.experience || data.Experience,
    education: data.education || data.Education,
    status: data.status || data.Status || 'active',
    createdAt: data.created_at || data.createdAt || data.CreatedAt,
    updatedAt: data.updated_at || data.updatedAt || data.UpdatedAt
  };
};

const transformApplicationData = (data: any): Application & { resume?: Resume } => {
  return {
    id: Number(data.id || data.ID),
    vacancy_id: Number(data.vacancy_id || data.vacancyId || data.VacancyID),
    resume_id: Number(data.resume_id || data.resumeId || data.ResumeID),
    user_id: Number(data.user_id || data.userId || data.UserID),
    status: data.status || data.Status,
    applicant_name: data.applicant_name || data.applicantName || data.ApplicantName,
    applicant_email: data.applicant_email || data.applicantEmail || data.ApplicantEmail,
    created_at: data.created_at || data.createdAt || data.CreatedAt,
    updated_at: data.updated_at || data.updatedAt || data.UpdatedAt,
    resume: data.resume ? transformResumeData(data.resume) : undefined
  };
};

const transformVacancyData = (data: any): Vacancy => {
  return {
    id: data.ID || data.id,
    employerId: data.EmployerID || data.employerId || data.employer_id,
    title: data.Title || data.title,
    description: data.Description || data.description,
    requirements: data.Requirements || data.requirements,
    responsibilities: data.Responsibilities || data.responsibilities,
    salary: data.Salary || data.salary,
    location: data.Location || data.location,
    employmentType: data.EmploymentType || data.employmentType || data.employment_type,
    company: data.Company || data.company,
    status: data.Status || data.status,
    skills: data.Skills || data.skills || [],
    education: data.Education || data.education,
    createdAt: data.CreatedAt || data.createdAt || data.created_at,
    updatedAt: data.UpdatedAt || data.updatedAt || data.updated_at
  };
};

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [myVacancies, setMyVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<(Application & { resume?: Resume })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application & { resume?: Resume } | null>(null);

  useEffect(() => {
    console.log('EmployerDashboard mounted, user:', user);
    if (user?.role === 'employer') {
      console.log('User is employer, fetching applications...');
      fetchApplications();
    } else {
      console.log('User is not employer, skipping applications fetch');
      setLoading(false);
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      console.log('Starting to fetch applications...');
      setLoading(true);
      setError(null);
      
      // Сначала получаем вакансии работодателя
      console.log('Fetching all vacancies...');
      const vacanciesData = await vacancies.getAll();
      console.log('All vacancies response:', vacanciesData);
      
      // Проверяем формат данных вакансий
      if (!Array.isArray(vacanciesData)) {
        console.error('Invalid vacancies data format:', vacanciesData);
        setError('Неверный формат данных вакансий');
        return;
      }
      
      const employerVacancies = vacanciesData
        .filter(Boolean)
        .map(transformVacancyData)
        .filter(v => {
          console.log('Checking vacancy:', v);
          console.log('Comparing employerId:', v.employerId, 'with user.id:', user?.id);
          return v.employerId === user?.id;
        });
      
      console.log('Employer ID:', user?.id);
      console.log('Employer vacancies after filtering:', employerVacancies);
      setMyVacancies(employerVacancies);
      
      if (employerVacancies.length === 0) {
        console.log('No vacancies found for employer');
        setApplications([] as (Application & { resume?: Resume })[]);
        return;
      }

      // Получаем отклики для каждой вакансии работодателя
      const vacancyIds = employerVacancies.map(v => v.id);
      console.log('Fetching applications for vacancy IDs:', vacancyIds);

      const rawApplications = await applicationsApi.getAll({ 
        employer_id: user?.id,
        vacancy_ids: vacancyIds.join(',')
      });
      
      console.log('Raw applications response:', rawApplications);

      // Преобразуем данные откликов
      const transformedApplications = Array.isArray(rawApplications)
        ? rawApplications.map(transformApplicationData)
        : [];

      console.log('Transformed applications:', transformedApplications);

      // Получаем резюме для каждого отклика
      const applicationsWithResumes = await Promise.all(
        transformedApplications.map(async (app) => {
          try {
            const resumeData = await resumes.getById(app.resume_id.toString());
            const transformedResume: Resume = {
              id: resumeData.id,
              userId: resumeData.userId,
              title: resumeData.title,
              description: resumeData.description,
              skills: resumeData.skills,
              experience: resumeData.experience,
              education: resumeData.education,
              status: resumeData.status,
              createdAt: resumeData.createdAt,
              updatedAt: resumeData.updatedAt
            };
            return { ...app, resume: transformedResume };
          } catch (error) {
            console.error('Error fetching resume:', error);
            return app;
          }
        })
      );

      console.log('Applications with resumes:', applicationsWithResumes);
      setApplications(applicationsWithResumes);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      setError(error.response?.data?.error || 'Не удалось загрузить отклики');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApplicationClick = (application: Application & { resume?: Resume }) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const handleStatusChange = async (applicationId: number, newStatus: 'accepted' | 'rejected') => {
    try {
      await applicationsApi.updateStatus(applicationId, newStatus);
      await fetchApplications();
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
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Отклики" />
          <Tab label="Мои вакансии" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {applications.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              У вас пока нет откликов на вакансии
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {applications.map((application: Application & { resume?: Resume }) => {
              const vacancy = myVacancies.find(v => Number(v.id) === application.vacancy_id);
              return (
                <Card key={application.id}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {vacancy?.title || 'Вакансия не найдена'}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
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
              );
            })}
          </Stack>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Stack spacing={2}>
          {myVacancies.map((vacancy) => (
            <Card key={vacancy.id}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {vacancy.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {vacancy.company}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {vacancy.location}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={vacancy.status}
                    color={vacancy.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/vacancies/${vacancy.id}`)}
                >
                  Просмотреть
                </Button>
                <Button
                  size="small"
                  onClick={() => navigate(`/vacancies/${vacancy.id}/edit`)}
                >
                  Редактировать
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </TabPanel>

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
                      Имя: {(selectedApplication as any).applicant_name || 'Не указано'}
                    </Typography>
                    {(selectedApplication as any).applicant_email && (
                      <Typography variant="body1" gutterBottom>
                        Email: {(selectedApplication as any).applicant_email}
                      </Typography>
                    )}
                  </Paper>
                </Box>

                {(selectedApplication as any).resume && (
                  <Box>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Резюме
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Название: {(selectedApplication as any).resume.title}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Опыт работы: {(selectedApplication as any).resume.experience}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Образование: {(selectedApplication as any).resume.education}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Навыки: {(selectedApplication as any).resume.skills?.join(', ')}
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

export default EmployerDashboard; 