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
import ResumeView from './pages/ResumeView';
import ResumeEdit from './pages/ResumeEdit';
import EmployerDashboard from './pages/EmployerDashboard';
import Applications from './pages/Applications';

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
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route path="vacancies" element={<VacancyList />} />
              <Route path="vacancies/create" element={<CreateVacancy />} />
              <Route path="vacancies/:id" element={<VacancyView />} />
              <Route path="vacancies/:id/edit" element={<VacancyEdit />} />
              <Route path="resumes" element={<ResumeList />} />
              <Route path="resumes/create" element={<CreateResume />} />
              <Route path="resumes/:id" element={<ResumeView />} />
              <Route path="resumes/:id/edit" element={<ResumeEdit />} />
              <Route path="applications" element={<Applications />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
