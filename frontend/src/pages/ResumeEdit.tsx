import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Autocomplete
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

const ResumeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [newSkill, setNewSkill] = useState('');

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
        setTitle(transformedData.title);
        setDescription(transformedData.description);
        setSkills(transformedData.skills || []);
        setExperience(transformedData.experience);
        setEducation(transformedData.education);
        setStatus(transformedData.status);
      } catch (err: any) {
        console.error('Error fetching resume:', err);
        setError(err.response?.data?.error || 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      setError('Resume ID is required');
      return;
    }

    try {
      const updatedResume = {
        ...resume,
        title,
        description,
        skills,
        experience,
        education,
        status
      };

      console.log('Sending update request with data:', updatedResume);
      console.log('Resume ID:', id);
      
      const response = await resumes.update(id, updatedResume);
      console.log('Update response:', response);
      
      navigate(`/resumes/${id}`);
    } catch (err: any) {
      console.error('Error updating resume:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        request: err.request
      });
      setError(err.response?.data?.error || 'Failed to update resume');
    }
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills(skills.filter(skill => skill !== skillToDelete));
  };

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
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Resume
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="New skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddSkill}
                    disabled={!newSkill}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => handleDeleteSkill(skill)}
                    />
                  ))}
                </Box>
              </Box>

              <TextField
                label="Experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />

              <TextField
                label="Education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/resumes/${id}`)}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResumeEdit; 