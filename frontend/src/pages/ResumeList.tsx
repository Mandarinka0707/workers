import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Grid,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { resumes } from '../api';
import { Resume } from '../types';

const ResumeList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumesList, setResumesList] = useState<Resume[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resumes.getAll();
      setResumesList(data || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load resumes');
      setResumesList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это резюме?')) {
      return;
    }

    try {
      await resumes.delete(id);
      setResumesList(prev => prev.filter(resume => resume.id !== id));
    } catch (err) {
      console.error('Error deleting resume:', err);
      setError('Failed to delete resume');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Мои резюме
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/resumes/create')}
          >
            Создать резюме
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {(!resumesList || resumesList.length === 0) ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              У вас пока нет резюме
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/resumes/create')}
            >
              Создать первое резюме
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {resumesList.map((resume) => (
              <Box
                key={resume.id}
                sx={{
                  width: {
                    xs: '100%',
                    md: 'calc(50% - 12px)',
                    lg: 'calc(33.333% - 16px)'
                  }
                }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.3s ease-in-out',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {resume.title}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {resume.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(resume.skills || []).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Статус: {resume.status === 'active' ? 'Активно' : 'В архиве'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Tooltip title="Просмотреть">
                      <IconButton
                        onClick={() => navigate(`/resumes/${resume.id}`)}
                        color="primary"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton
                        onClick={() => navigate(`/resumes/${resume.id}/edit`)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={() => handleDelete(resume.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ResumeList; 