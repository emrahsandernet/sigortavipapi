import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, 
  Paper, CircularProgress, Divider, Avatar,
  LinearProgress, Chip, IconButton, Fade, Zoom, Container
} from '@mui/material';
import { 
  Business as BusinessIcon, 
  People as PeopleIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { 
  companyService, 
  companyUserService, 
  insuranceCompanyService, 
  insuranceCompanyItemService 
} from '../services/api';

const ModernStatCard = ({ title, value, icon, loading, gradient, percentage, trend, subtitle }) => (
  <Zoom in={true} style={{ transitionDelay: '100ms' }}>
    <Card 
      sx={{ 
        height: '220px',
        background: `linear-gradient(135deg, ${gradient.start}, ${gradient.end})`,
        borderRadius: 4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }
      }}
    >
      <CardContent sx={{ color: 'white', position: 'relative', overflow: 'hidden', height: '100%', p: 3 }}>
        {/* Decorative background shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            zIndex: 0
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontWeight: 600
              }}
            >
              {title}
            </Typography>
            
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 48,
                height: 48,
                backdropFilter: 'blur(10px)',
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          <Box flex={1} display="flex" flexDirection="column" justifyContent="center">
            {loading ? (
              <CircularProgress size={32} sx={{ color: 'white' }} />
            ) : (
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {value}
              </Typography>
            )}
            
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  mb: 2
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {percentage && (
            <Box display="flex" alignItems="center" gap={1} mt="auto">
              <TrendingUpIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                +{percentage}% bu ay
              </Typography>
              <Chip 
                label="Artış" 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontSize: '0.7rem'
                }} 
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  </Zoom>
);

const WelcomeCard = ({ user }) => (
  <Fade in={true} timeout={800}>
    <Paper
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 6,
        p: 5,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        mb: 4,
        minHeight: 200
      }}
    >
      {/* Enhanced decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.08)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 250,
          height: 250,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '20%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.03)',
          zIndex: 0
        }}
      />
      
      <Box display="flex" alignItems="center" gap={4} sx={{ position: 'relative', zIndex: 1 }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'rgba(255,255,255,0.2)',
            fontSize: '2.5rem',
            backdropFilter: 'blur(15px)',
            border: '3px solid rgba(255,255,255,0.3)'
          }}
        >
          <DashboardIcon sx={{ fontSize: '2.5rem' }} />
        </Avatar>
        
        <Box flex={1}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            Hoş Geldiniz! 👋
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, mb: 3, fontWeight: 300 }}>
            Merhaba {user?.username}, bugün nasılsınız?
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip 
              icon={<BusinessIcon />}
              label={user?.company?.name} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                px: 2,
                py: 1
              }} 
            />
            <Chip 
              icon={user?.is_admin ? <CheckCircleIcon /> : <ScheduleIcon />}
              label={user?.is_admin ? 'Sistem Yöneticisi' : 'Standart Kullanıcı'} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                px: 2,
                py: 1
              }} 
            />
          </Box>
        </Box>
        
        <Box textAlign="center">
          <Typography variant="h6" sx={{ opacity: 0.8, mb: 1 }}>
            Bugün
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}
          </Typography>
        </Box>
      </Box>
    </Paper>
  </Fade>
);

const QuickStatsPanel = ({ stats }) => (
  <Fade in={true} timeout={1000}>
    <Paper
      sx={{
        borderRadius: 4,
        p: 4,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        height: '100%'
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
          Sistem Özeti
        </Typography>
        <IconButton 
          size="large"
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.8)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
      
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Box textAlign="center" p={3} bgcolor="white" borderRadius={3} boxShadow={2}>
            <Typography variant="h2" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
              {stats.companies.count + stats.users.count}
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>
              Toplam Sistem Kaydı
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              ↗ +5 bu hafta
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box textAlign="center" p={2}>
            <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
              %98
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
              Sistem Sağlığı
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box textAlign="center" p={2}>
            <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
              24/7
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
              Çalışma Süresi
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Box>
        <Typography variant="h6" color="textPrimary" gutterBottom sx={{ fontWeight: 600 }}>
          Sistem Performansı
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={95} 
          sx={{ 
            height: 12, 
            borderRadius: 6,
            bgcolor: 'rgba(0,0,0,0.1)',
            mb: 2,
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              background: 'linear-gradient(90deg, #4CAF50, #81C784)'
            }
          }} 
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
            95% - Mükemmel Performans
          </Typography>
          <Chip 
            icon={<CheckCircleIcon />}
            label="Aktif" 
            color="success" 
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>
    </Paper>
  </Fade>
);

const ActivityCard = () => (
  <Fade in={true} timeout={1400}>
    <Paper
      sx={{
        borderRadius: 4,
        p: 4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        background: 'white',
        height: '100%'
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#2c3e50' }}>
        Son Aktiviteler
      </Typography>
      
      <Box>
        {[
          { action: 'Yeni şirket eklendi', time: '2 saat önce', type: 'success' },
          { action: 'Kullanıcı girişi yapıldı', time: '4 saat önce', type: 'info' },
          { action: 'Sigorta poliçesi güncellendi', time: '6 saat önce', type: 'warning' },
          { action: 'Sistem yedeklemesi tamamlandı', time: '1 gün önce', type: 'success' }
        ].map((activity, index) => (
          <Box 
            key={index}
            display="flex" 
            alignItems="center" 
            gap={2}
            p={2}
            mb={2}
            borderRadius={2}
            bgcolor="grey.50"
            sx={{
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateX(4px)'
              }
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: activity.type === 'success' ? 'success.main' : 
                         activity.type === 'warning' ? 'warning.main' : 'info.main'
              }}
            >
              {activity.type === 'success' ? <CheckCircleIcon /> : 
               activity.type === 'warning' ? <WarningIcon /> : <ScheduleIcon />}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {activity.action}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {activity.time}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  </Fade>
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

  const cardConfigs = [
    {
      title: "Toplam Şirketler",
      value: stats.companies.count,
      loading: stats.companies.loading,
      icon: <BusinessIcon sx={{ color: 'white', fontSize: 28 }} />,
      gradient: { start: '#667eea', end: '#764ba2' },
      percentage: 12,
      subtitle: "Kayıtlı şirket sayısı"
    },
    {
      title: "Aktif Kullanıcılar", 
      value: stats.users.count,
      loading: stats.users.loading,
      icon: <PeopleIcon sx={{ color: 'white', fontSize: 28 }} />,
      gradient: { start: '#f093fb', end: '#f5576c' },
      percentage: 8,
      subtitle: "Sisteme kayıtlı kullanıcılar"
    },
    {
      title: "Sigorta Şirketleri",
      value: stats.insuranceCompanies.count,
      loading: stats.insuranceCompanies.loading,
      icon: <SecurityIcon sx={{ color: 'white', fontSize: 28 }} />,
      gradient: { start: '#4facfe', end: '#00f2fe' },
      percentage: 15,
      subtitle: "Partner sigorta şirketleri"
    },
    {
      title: "Sigorta Ürünleri",
      value: stats.insuranceItems.count,
      loading: stats.insuranceItems.loading,
      icon: <AssignmentIcon sx={{ color: 'white', fontSize: 28 }} />,
      gradient: { start: '#43e97b', end: '#38f9d7' },
      percentage: 22,
      subtitle: "Mevcut sigorta ürünleri"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <WelcomeCard user={user} />
        
        <Box sx={{ mb: 5 }}>
          <Grid 
            container 
            spacing={0}
            sx={{ 
              justifyContent: 'space-between',
              gap: 3
            }}
          >
            {cardConfigs.map((config, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={2.8}
                key={index}
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ width: '100%', maxWidth: 300 }}>
                  <ModernStatCard {...config} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <QuickStatsPanel stats={stats} />
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Fade in={true} timeout={1600}>
              <Paper
                sx={{
                  borderRadius: 4,
                  p: 4,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                  background: 'white',
                  height: '100%'
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#2c3e50' }}>
                  Detaylı Sistem Bilgileri
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Box p={3} borderRadius={3} bgcolor="primary.light" color="white" mb={3}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        🏢 Şirket Bilgileri
                      </Typography>
                      <Typography variant="body1" gutterBottom sx={{ opacity: 0.9 }}>
                        <strong>Şirket:</strong> {user?.company?.name}
                      </Typography>
                      <Typography variant="body1" gutterBottom sx={{ opacity: 0.9 }}>
                        <strong>Şirket Kodu:</strong> {user?.company?.code}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        <strong>Durum:</strong> Aktif
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box p={3} borderRadius={3} bgcolor="success.light" color="white">
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        👤 Kullanıcı Bilgileri
                      </Typography>
                      <Typography variant="body1" gutterBottom sx={{ opacity: 0.9 }}>
                        <strong>Kullanıcı Adı:</strong> {user?.username}
                      </Typography>
                      <Typography variant="body1" gutterBottom sx={{ opacity: 0.9 }}>
                        <strong>Kullanıcı Tipi:</strong> {user?.is_admin ? 'Yönetici' : 'Standart Kullanıcı'}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        <strong>Roller:</strong> {user?.roles?.map(role => role.name).join(', ') || 'Standart'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <ActivityCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 