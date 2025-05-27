import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { resumes } from '../api';
import { Resume } from '../types';

const ResumeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await resumes.get(parseInt(id));
        setResume(data);
      } catch (err) {
        console.error('Error loading resume:', err);
        setError('Failed to load resume details');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !resume) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Resume not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/resumes')}
        >
          Вернуться к списку резюме
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/resumes')}
          >
            Вернуться к списку резюме
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/resumes/${resume.id}/edit`)}
          >
            Редактировать
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {resume.title}
            </Typography>
            <Chip
              label={resume.status === 'active' ? 'Активно' : 'В архиве'}
              color={resume.status === 'active' ? 'success' : 'default'}
              sx={{ mb: 2 }}
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ mr: 1 }} />
              Описание
            </Typography>
            <Typography paragraph>
              {resume.description}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LightbulbIcon sx={{ mr: 1 }} />
              Навыки
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {resume.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ mr: 1 }} />
              Опыт работы
            </Typography>
            <Typography paragraph>
              {resume.experience}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1 }} />
              Образование
            </Typography>
            <Typography paragraph>
              {resume.education}
            </Typography>
          </Box>

          <Divider />
        </Box>
      </Paper>
    </Container>
  );
};

export default ResumeDetails; 