import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, 
  Paper, CircularProgress, Divider 
} from '@mui/material';
import { 
  Business as BusinessIcon, 
  People as PeopleIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { 
  companyService, 
  companyUserService, 
  insuranceCompanyService, 
  insuranceCompanyItemService 
} from '../services/api';

const StatCard = ({ title, value, icon, loading, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <Typography variant="h4">{value}</Typography>
          )}
        </Box>
        <Box sx={{ 
          backgroundColor: `${color}.light`, 
          borderRadius: '50%', 
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    companies: { count: 0, loading: true },
    users: { count: 0, loading: true },
    insuranceCompanies: { count: 0, loading: true },
    insuranceItems: { count: 0, loading: true }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Şirketleri getir
        const companiesResponse = await companyService.getAll();
        
        // Kullanıcıları getir
        const usersResponse = await companyUserService.getAll();
        
        // Sigorta şirketlerini getir
        const insuranceCompaniesResponse = await insuranceCompanyService.getAll();
        
        // Sigorta şirket öğelerini getir
        const insuranceItemsResponse = await insuranceCompanyItemService.getAll();
        
        setStats({
          companies: { 
            count: companiesResponse.data.length,
            loading: false 
          },
          users: { 
            count: usersResponse.data.length,
            loading: false 
          },
          insuranceCompanies: { 
            count: insuranceCompaniesResponse.data.length,
            loading: false 
          },
          insuranceItems: { 
            count: insuranceItemsResponse.data.length,
            loading: false 
          }
        });
      } catch (error) {
        console.error('Stats fetching error:', error);
        // Hata durumunda loading durumunu false yap
        setStats(prev => ({
          companies: { ...prev.companies, loading: false },
          users: { ...prev.users, loading: false },
          insuranceCompanies: { ...prev.insuranceCompanies, loading: false },
          insuranceItems: { ...prev.insuranceItems, loading: false }
        }));
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gösterge Paneli
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Hoş geldiniz, {user?.username}!
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Şirketler"
            value={stats.companies.count}
            icon={<BusinessIcon sx={{ color: 'primary.main' }} />}
            loading={stats.companies.loading}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Kullanıcılar"
            value={stats.users.count}
            icon={<PeopleIcon sx={{ color: 'success.main' }} />}
            loading={stats.users.loading}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sigorta Şirketleri"
            value={stats.insuranceCompanies.count}
            icon={<SecurityIcon sx={{ color: 'warning.main' }} />}
            loading={stats.insuranceCompanies.loading}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sigorta Öğeleri"
            value={stats.insuranceItems.count}
            icon={<AssignmentIcon sx={{ color: 'error.main' }} />}
            loading={stats.insuranceItems.loading}
            color="error"
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sistem Bilgileri
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Şirket: {user?.company?.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Şirket Kodu: {user?.company?.code}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Kullanıcı Adı: {user?.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Kullanıcı Tipi: {user?.is_admin ? 'Yönetici' : 'Standart Kullanıcı'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Roller: {user?.roles?.map(role => role.name).join(', ') || 'Rol yok'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 