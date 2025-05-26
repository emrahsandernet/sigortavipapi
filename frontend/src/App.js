import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { trTR } from '@mui/material/locale';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import InsuranceCompanies from './pages/Companies';
import Roles from './pages/Roles';
import QueryTypes from './pages/QueryTypes';
import RolePermissions from './pages/RolePermissions';
import Partages from './pages/Partages';
import CompanyInsuranceAgency from './pages/CompanyInsuranceAgency';
import UpdatePartage from './pages/UpdatePartage';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
}, trTR);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="insurance-companies" element={<InsuranceCompanies />} />
              <Route path="roles" element={<Roles />} />
              <Route path="query-types" element={<QueryTypes />} />
              <Route path="role-permissions" element={<RolePermissions />} />
              <Route path="partages" element={<Partages />} />
              <Route path="company-insurance-agency" element={<CompanyInsuranceAgency />} />
              <Route path="update-partage" element={<UpdatePartage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 