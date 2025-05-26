import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper
} from '@mui/material';
import {
  Work as WorkIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);
  }, [user]);

  const jobSeekerFeatures: Feature[] = [
    {
      title: 'Поиск вакансий',
      description: 'Просматривайте доступные вакансии и находите подходящую работу',
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      path: '/vacancies'
    },
    {
      title: 'Моё резюме',
      description: 'Создайте и управляйте своим резюме для привлечения работодателей',
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      path: '/resumes'
    },
    {
      title: 'Мои заявки',
      description: 'Отслеживайте статус своих заявок на вакансии',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      path: '/applications'
    }
  ];

  const employerFeatures: Feature[] = [
    {
      title: 'Мои вакансии',
      description: 'Создавайте и управляйте вакансиями вашей компании',
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      path: '/employer/dashboard'
    },
    {
      title: 'Отклики',
      description: 'Просматривайте и обрабатывайте отклики на ваши вакансии',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      path: '/employer/dashboard'
    }
  ];

  const features = user?.role === 'employer' ? employerFeatures : jobSeekerFeatures;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white'
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Добро пожаловать в Job Search Platform
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            {user && user.name
              ? `Здравствуйте, ${user.name.split(' ')[0]}!`
              : 'Найдите работу своей мечты или талантливых сотрудников'}
          </Typography>
          {!user && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ mr: 2 }}
              >
                Зарегистрироваться
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/login')}
              >
                Войти
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
        {features.map((feature) => (
          <Box key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.3s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography gutterBottom variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography>{feature.description}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  fullWidth
                  onClick={() => navigate(feature.path)}
                >
                  Перейти
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Home; 