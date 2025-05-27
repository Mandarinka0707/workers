import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resumes } from '../api';
import { Resume } from '../types';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Lightbulb as LightbulbIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  TextFields as TextFieldsIcon,
} from '@mui/icons-material';

const ResumeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<Partial<Resume>>({
    title: '',
    description: '',
    skills: [],
    experience: '',
    education: '',
    status: 'active'
  });

  useEffect(() => {
    const fetchResume = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await resumes.get(parseInt(id));
          setResume(data);
        } catch (err) {
          setError('Failed to load resume');
          console.error('Error loading resume:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResume();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name?: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    setResume(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSkillsChange = (_: any, newValue: string[]) => {
    setResume(prev => ({ ...prev, skills: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (id) {
        await resumes.update(parseInt(id), resume);
      } else {
        await resumes.create(resume as Omit<Resume, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
      }

      navigate('/resumes');
    } catch (err) {
      setError('Failed to save resume');
      console.error('Error saving resume:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ mr: 1, fontSize: 32 }} />
              {id ? 'Редактирование резюме' : 'Создание резюме'}
            </Typography>
            {!id && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/resumes')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Вернуться к списку
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Название резюме"
              name="title"
              value={resume.title}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={resume.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TextFieldsIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={resume.skills || []}
              onChange={handleSkillsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...chipProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option}
                      {...chipProps}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Навыки"
                  required={!resume.skills?.length}
                  error={!resume.skills?.length}
                  helperText={!resume.skills?.length ? "Это поле обязательно для заполнения" : "Введите навык и нажмите Enter для добавления"}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LightbulbIcon color="action" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <TextField
              fullWidth
              label="Опыт работы"
              name="experience"
              value={resume.experience}
              onChange={handleChange}
              required
              multiline
              rows={4}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Образование"
              name="education"
              value={resume.education}
              onChange={handleChange}
              required
              multiline
              rows={4}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth required>
              <InputLabel>Статус</InputLabel>
              <Select
                name="status"
                value={resume.status}
                onChange={handleChange}
                label="Статус"
                startAdornment={
                  <InputAdornment position="start">
                    <CheckCircleIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="active">Активно</MenuItem>
                <MenuItem value="archived">В архиве</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/resumes')}
                startIcon={<CloseIcon />}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Сохранение...' : 'Сохранить резюме'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResumeEdit; 