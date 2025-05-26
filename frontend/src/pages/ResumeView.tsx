import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
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

const ResumeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!id) {
        setError('Resume ID is required');
        setLoading(false);
        return;
      }

      try {
        const data = await resumes.getById(id);
        const transformedData = transformResumeData(data);
        setResume(transformedData);
      } catch (err: any) {
        console.error('Error fetching resume:', err);
        setError(err.response?.data?.error || 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !resume) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Resume not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {resume.title}
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Chip
              label={resume.status === 'active' ? 'Active' : 'Archived'}
              color={resume.status === 'active' ? 'success' : 'default'}
              sx={{ mr: 1 }}
            />
          </Box>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography paragraph>
            {resume.description}
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(resume.skills || []).map((skill: string, index: number) => (
              <Chip key={index} label={skill} />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Experience
          </Typography>
          <Typography paragraph>
            {resume.experience}
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Education
          </Typography>
          <Typography paragraph>
            {resume.education}
          </Typography>
        </Box>

        {user?.id === resume.userId && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                console.log('Navigating to edit resume:', resume.id);
                navigate(`/resumes/${resume.id}/edit`);
              }}
            >
              Редактировать
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/resumes')}
            >
              Вернуться к списку
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ResumeView; 