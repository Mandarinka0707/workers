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

const transformApplicationData = (data: any): Application => {
  return {
    id: data.ID || data.id,
    vacancyId: data.VacancyID || data.vacancyId || data.vacancy_id,
    resumeId: data.ResumeID || data.resumeId || data.resume_id,
    status: (data.Status || data.status || 'pending') as 'pending' | 'accepted' | 'rejected',
    createdAt: data.CreatedAt || data.createdAt || data.created_at,
    updatedAt: data.UpdatedAt || data.updatedAt || data.updated_at,
    applicantName: data.ApplicantName || data.applicantName || data.applicant_name || '',
  };
};

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

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [myVacancies, setMyVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<(Application & { resume?: Resume })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<(Application & { resume?: Resume }) | null>(null);

  useEffect(() => {
    if (user?.role === 'employer') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем вакансии работодателя
      const vacanciesData = await vacancies.getAll();
      const employerVacancies = Array.isArray(vacanciesData) 
        ? vacanciesData.map(transformVacancyData).filter(v => v.employerId === user?.id)
        : [];
      setMyVacancies(employerVacancies);

      // Получаем все отклики
      const applicationsData = await applicationsApi.getAll();
      const transformedApplications = Array.isArray(applicationsData)
        ? applicationsData.map(transformApplicationData)
        : [transformApplicationData(applicationsData)];

      // Фильтруем отклики только на вакансии работодателя
      const employerApplications = transformedApplications.filter(app => 
        employerVacancies.some(v => v.id === app.vacancyId)
      );

      // Загружаем данные резюме для каждого отклика
      const applicationsWithResumes = await Promise.all(
        employerApplications.map(async (app) => {
          if (app.resumeId) {
            try {
              const resumeData = await resumes.getById(app.resumeId.toString());
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
          <Typography>Загрузка...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (user?.role !== 'employer') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Доступ запрещен</Typography>
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
            {applications.map((application) => {
              const vacancy = myVacancies.find(v => v.id === application.vacancyId);
              return (
                <Card key={application.id}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {vacancy?.title || 'Вакансия не найдена'}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Отклик от: {application.applicantName || 'Имя не указано'}
                    </Typography>
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
        {myVacancies.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              У вас пока нет созданных вакансий
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/vacancies/create')}
            >
              Создать вакансию
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {myVacancies.map((vacancy) => (
              <Card key={vacancy.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {vacancy.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {vacancy.company} • {vacancy.location}
                  </Typography>
                  <Chip
                    label={vacancy.status === 'active' ? 'Активна' : 'Закрыта'}
                    color={vacancy.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/vacancies/${vacancy.id}`)}
                  >
                    Просмотр
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
        )}
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
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Информация о соискателе
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Имя: {selectedApplication.applicantName || 'Не указано'}
                </Typography>

                {selectedApplication.resume && (
                  <>
                    <Divider sx={{ my: 2 }} />
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
                  </>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Статус отклика
                </Typography>
                <Chip
                  label={getStatusLabel(selectedApplication.status)}
                  color={getStatusColor(selectedApplication.status)}
                />
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