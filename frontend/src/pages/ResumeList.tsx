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
  Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { resumes } from '../services/api';
import { Resume } from '../types';

const transformResumeData = (data: any): Resume => {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    experience: data.experience,
    education: data.education,
    skills: data.skills || [],
    status: data.status || 'active',
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

const ResumeList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumesList, setResumesList] = useState<Resume[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ResumeList mounted, user:', user);
    fetchResumes();
  }, [user]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching resumes...');
      const data = await resumes.getAll();
      console.log('Raw resumes data:', data);
      
      if (!data) {
        console.error('No data received from server');
        setError('No data received from server');
        return;
      }

      if (!Array.isArray(data)) {
        console.error('Received data is not an array:', data);
        setError('Invalid data format received from server');
        return;
      }

      // Проверяем структуру каждого резюме
      data.forEach((resume, index) => {
        console.log(`Resume ${index} structure:`, {
          id: resume.ID,
          title: resume.Title,
          description: resume.Description,
          skills: resume.Skills,
          status: resume.Status
        });
      });

      console.log('Setting resumes list:', data);
      const transformedData = data.map(transformResumeData);
      setResumesList(transformedData);
    } catch (err: any) {
      console.error('Error fetching resumes:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    console.log('No user found, returning null');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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

      {loading ? (
        <Typography>Loading...</Typography>
      ) : resumesList.length === 0 ? (
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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {resumesList.map((resume) => (
            <Card key={resume.id}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {resume.title}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {resume.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {(resume.skills || []).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Статус: {resume.status === 'active' ? 'Активно' : 'В архиве'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/resumes/${resume.id}`)}
                >
                  Подробнее
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default ResumeList; 