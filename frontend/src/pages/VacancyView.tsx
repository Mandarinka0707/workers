import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { vacancies, applications, resumes } from '../services/api';
import { Vacancy, Resume } from '../types';

const transformVacancyData = (data: any): Vacancy => {
  console.log('Transforming vacancy data:', data);
  
  const transformed = {
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

  console.log('Transformed vacancy:', transformed);
  return transformed;
};

const transformApplicationData = (data: any) => {
  return {
    id: data.ID || data.id,
    vacancyId: data.VacancyID || data.vacancyId || data.vacancy_id,
    resumeId: data.ResumeID || data.resumeId || data.resume_id,
    status: data.Status || data.status,
    createdAt: data.CreatedAt || data.createdAt || data.created_at,
    updatedAt: data.UpdatedAt || data.updatedAt || data.updated_at
  };
};

const VacancyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [userResumes, setUserResumes] = useState<Resume[]>([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const checkExistingApplication = async () => {
    if (!id || !user) {
      console.log('No ID or user:', { id, user });
      return;
    }

    const vacancyId = Number(id);
    if (isNaN(vacancyId)) {
      console.error('Invalid vacancy ID:', id);
      return;
    }

    try {
      console.log('Checking existing application for vacancy ID:', vacancyId);
      const rawApplications = await applications.getAll();
      console.log('Raw applications data:', rawApplications);
      
      const userApplications = Array.isArray(rawApplications) 
        ? rawApplications.map(transformApplicationData)
        : [transformApplicationData(rawApplications)];
      
      console.log('Transformed applications:', userApplications);
      
      const hasAppliedToVacancy = userApplications.some((app) => {
        const appVacancyId = Number(app.vacancyId);
        console.log('Application data:', {
          appId: app.id,
          appVacancyId,
          currentVacancyId: vacancyId,
          isMatch: appVacancyId === vacancyId
        });
        return appVacancyId === vacancyId;
      });
      
      console.log('Has applied to vacancy:', hasAppliedToVacancy);
      setHasApplied(hasAppliedToVacancy);
    } catch (err) {
      console.error('Ошибка при проверке отклика:', err);
    }
  };

  useEffect(() => {
    if (!id) {
      setError('ID вакансии не указан');
      setLoading(false);
      return;
    }
    fetchVacancy();
    if (user?.role === 'jobseeker') {
      fetchUserResumes();
      checkExistingApplication();
    }
  }, [id, user]);

  const fetchVacancy = async () => {
    if (!id) return;
    try {
      const rawData = await vacancies.getById(id);
      console.log('Raw vacancy data:', rawData);
      
      // Проверяем структуру данных
      if (!rawData) {
        throw new Error('No vacancy data received');
      }

      // Преобразуем данные
      const transformedData = transformVacancyData(rawData);
      console.log('Transformed vacancy data:', transformedData);

      // Проверяем обязательные поля
      if (!transformedData.title || !transformedData.company || !transformedData.salary) {
        console.warn('Missing required fields:', {
          title: transformedData.title,
          company: transformedData.company,
          salary: transformedData.salary
        });
      }

      setVacancy(transformedData);
    } catch (err: any) {
      console.error('Ошибка при загрузке вакансии:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Не удалось загрузить вакансию');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserResumes = async () => {
    try {
      console.log('Fetching user resumes...');
      const data = await resumes.getAll();
      console.log('Received resumes:', data);
      setUserResumes(data);
    } catch (err: any) {
      console.error('Ошибка при загрузке резюме:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    }
  };

  const handleApply = async () => {
    if (!id || !selectedResumeId) return;
    setApplyLoading(true);

    try {
      console.log('Sending application with data:', {
        vacancyId: parseInt(id),
        resumeId: parseInt(selectedResumeId),
        status: 'pending'
      });

      await applications.create({
        vacancyId: parseInt(id),
        resumeId: parseInt(selectedResumeId),
        status: 'pending'
      });

      setOpenDialog(false);
      navigate('/applications');
    } catch (err: any) {
      console.error('Ошибка при отклике на вакансию:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Не удалось отправить отклик');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleResumeSelect = (event: SelectChangeEvent) => {
    setSelectedResumeId(event.target.value);
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);

    try {
      await vacancies.delete(id);
      navigate('/vacancies');
    } catch (err: any) {
      console.error('Ошибка при удалении вакансии:', err);
      setError(err.response?.data?.error || 'Не удалось удалить вакансию');
    } finally {
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
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

  const isOwner = user?.role === 'employer' && user.id === vacancy.employerId;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {vacancy.title}
            </Typography>
            {isOwner && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/vacancies/${id}/edit`)}
                >
                  Редактировать
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  Удалить
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {vacancy.company}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {vacancy.location} • {vacancy.employmentType}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {vacancy.salary.toLocaleString()} ₽
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              <Typography variant="body1" paragraph>
                {vacancy.requirements}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Навыки
              </Typography>
              <Box sx={{ mb: 2 }}>
                {vacancy.skills?.map((skill: string, index: number) => (
                  <Chip
                    key={index}
                    label={skill}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Образование
              </Typography>
              <Typography variant="body1" paragraph>
                {vacancy.education}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Обязанности
              </Typography>
              <Typography variant="body1" paragraph>
                {vacancy.responsibilities}
              </Typography>
            </Box>
          </Box>

          {user?.role === 'jobseeker' && (
            <Box sx={{ mt: 4 }}>
              {hasApplied ? (
                <Alert severity="info">
                  Вы уже откликнулись на эту вакансию
                </Alert>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenDialog(true)}
                >
                  Откликнуться на вакансию
                </Button>
              )}
            </Box>
          )}

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Выберите резюме для отклика</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Резюме</InputLabel>
                <Select
                  value={selectedResumeId}
                  onChange={handleResumeSelect}
                  label="Резюме"
                >
                  {userResumes.map((resume) => (
                    <MenuItem key={resume.id} value={resume.id}>
                      {resume.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
              <Button
                onClick={handleApply}
                variant="contained"
                disabled={!selectedResumeId || applyLoading}
              >
                Отправить
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogContent>
              <Typography>
                Вы уверены, что хотите удалить вакансию "{vacancy.title}"? Это действие нельзя отменить.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
              <Button
                onClick={handleDelete}
                variant="contained"
                color="error"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Удаление...' : 'Удалить'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </Container>
  );
};

export default VacancyView; 