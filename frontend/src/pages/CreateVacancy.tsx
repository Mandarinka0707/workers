import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Stack
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { vacancies } from '../services/api';

const employmentTypes = [
  'Полная занятость',
  'Частичная занятость',
  'Удаленная работа',
  'Проектная работа'
];

const educationLevels = [
  'Не требуется',
  'Среднее',
  'Среднее специальное',
  'Высшее',
  'Бакалавр',
  'Магистр',
  'Аспирант'
];

const CreateVacancy: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary: '',
    location: '',
    employmentType: '',
    company: '',
    skills: [] as string[],
    education: ''
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      employmentType: e.target.value
    }));
  };

  const handleEducationChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      education: e.target.value
    }));
  };

  const handleSkillAdd = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleSkillDelete = (skillToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToDelete)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    try {
      if (!formData.title || !formData.description || !formData.requirements || 
          !formData.responsibilities || !formData.salary || !formData.location || 
          !formData.employmentType || !formData.company || !formData.education) {
        throw new Error('Пожалуйста, заполните все обязательные поля');
      }

      const vacancyData = {
        ...formData,
        salary: parseInt(formData.salary),
        status: 'active',
        employerId: user.id
      };

      console.log('Отправляемые данные:', vacancyData);

      const response = await vacancies.create(vacancyData);
      console.log('Ответ сервера:', response);

      navigate('/vacancies');
    } catch (err: any) {
      console.error('Ошибка при создании вакансии:', err);
      console.error('Детали ошибки:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || err.message || 'Не удалось создать вакансию');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'employer') {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          У вас нет прав для создания вакансий
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Создание вакансии
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Название вакансии"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Описание"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                fullWidth
              />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Требования
                </Typography>
                <TextField
                  label="Основные требования"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  fullWidth
                  sx={{ mb: 3 }}
                />

                <Typography variant="subtitle1" gutterBottom>
                  Навыки
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    label="Добавить навык"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleSkillAdd}
                    disabled={!currentSkill.trim()}
                  >
                    Добавить
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                  {formData.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleSkillDelete(skill)}
                    />
                  ))}
                </Stack>

                <FormControl fullWidth required sx={{ mb: 3 }}>
                  <InputLabel>Образование</InputLabel>
                  <Select
                    value={formData.education}
                    onChange={handleEducationChange}
                    label="Образование"
                  >
                    {educationLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Обязанности"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                multiline
                rows={4}
                required
                fullWidth
              />

              <TextField
                label="Зарплата"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                type="number"
                required
                fullWidth
              />

              <TextField
                label="Местоположение"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                fullWidth
              />

              <FormControl fullWidth required>
                <InputLabel>Тип занятости</InputLabel>
                <Select
                  value={formData.employmentType}
                  onChange={handleSelectChange}
                  label="Тип занятости"
                >
                  {employmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Название компании"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Создать вакансию
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/vacancies')}
                >
                  Отмена
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateVacancy; 