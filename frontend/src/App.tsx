import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import VacancyList from './pages/VacancyList';
import VacancyView from './pages/VacancyView';
import VacancyEdit from './pages/VacancyEdit';
import CreateVacancy from './pages/CreateVacancy';
import ResumeList from './pages/ResumeList';
import CreateResume from './pages/CreateResume';
import ResumeDetails from './pages/ResumeDetails';
import ResumeEdit from './pages/ResumeEdit';
import EmployerDashboard from './pages/EmployerDashboard';
import Applications from './pages/Applications';
import VacancyResponses from './pages/VacancyResponses';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(',')
  }
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/vacancies" element={<PrivateRoute><VacancyList /></PrivateRoute>} />
              <Route path="/vacancies/create" element={<PrivateRoute><CreateVacancy /></PrivateRoute>} />
              <Route path="/vacancies/:id" element={<PrivateRoute><VacancyView /></PrivateRoute>} />
              <Route path="/vacancies/:id/edit" element={<PrivateRoute><VacancyEdit /></PrivateRoute>} />
              <Route path="/vacancies/:id/responses" element={<PrivateRoute><VacancyResponses /></PrivateRoute>} />
              <Route path="/resumes" element={<PrivateRoute><ResumeList /></PrivateRoute>} />
              <Route path="/resumes/create" element={<PrivateRoute><CreateResume /></PrivateRoute>} />
              <Route path="/resumes/:id" element={<PrivateRoute><ResumeDetails /></PrivateRoute>} />
              <Route path="/resumes/:id/edit" element={<PrivateRoute><ResumeEdit /></PrivateRoute>} />
              <Route path="/employer/dashboard" element={<PrivateRoute><EmployerDashboard /></PrivateRoute>} />
              <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
