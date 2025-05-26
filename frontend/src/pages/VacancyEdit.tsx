import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { vacancies } from '../services/api';
import { Vacancy } from '../types';

const employmentTypes = [
  'Полная занятость',
  'Частичная занятость',
  'Проектная работа',
  'Стажировка',
  'Удаленная работа'
];

const VacancyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [formData, setFormData] = useState<Partial<Vacancy>>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary: 0,
    location: '',
    employmentType: '',
    company: '',
    skills: [],
    education: ''
  });

  useEffect(() => {
    if (!id) {
      setError('ID вакансии не указан');
      setLoading(false);
      return;
    }
    fetchVacancy();
  }, [id]);

  const fetchVacancy = async () => {
    try {
      const data = await vacancies.getById(id!);
      if (user?.id !== data.EmployerID) {
        setError('У вас нет прав на редактирование этой вакансии');
        return;
      }
      setFormData(data);
    } catch (err: any) {
      console.error('Ошибка при загрузке вакансии:', err);
      setError(err.response?.data?.error || 'Не удалось загрузить вакансию');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    try {
      console.log('Submitting form data:', formData);
      const response = await vacancies.update(id, formData);
      console.log('Update response:', response);
      navigate(`/vacancies/${id}`);
    } catch (err: any) {
      console.error('Ошибка при обновлении вакансии:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      setError(err.response?.data?.error || 'Не удалось обновить вакансию');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Редактирование вакансии
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Название вакансии"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Требования"
                multiline
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Обязанности"
                multiline
                rows={4}
                value={formData.responsibilities}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Зарплата"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) }))}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Местоположение"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth>
                <InputLabel>Тип занятости</InputLabel>
                <Select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleSelectChange}
                  label="Тип занятости"
                  required
                >
                  {employmentTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Компания"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Образование"
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Навыки
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Новый навык"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                  >
                    Добавить
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.skills?.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/vacancies/${id}`)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default VacancyEdit; 