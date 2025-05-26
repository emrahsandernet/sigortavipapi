import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Chip, FormControlLabel, Switch, CircularProgress,
  Snackbar, Alert, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { companyUserService, insuranceCompanyService, roleService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    company: user?.company?.id || '',
    roles: [],
    is_admin: false,
    is_active: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsers();
    fetchInsuranceCompanies();
    fetchRoles();
  }, []);

  useEffect(() => {
    // Kullanıcı bilgisi yüklendiğinde şirket ID'sini güncelle
    if (user && user.company) {
      setFormData(prev => ({
        ...prev,
        company: user.company.id
      }));
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await companyUserService.getAll();
      console.log('API Yanıtı (Kullanıcılar):', response.data);
      
      // API'den gelen yanıt yapısını kontrol et
      if (response.data && response.data.results) {
        setUsers(response.data.results);
      } else {
        setUsers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Kullanıcılar yüklenirken hata oluştu',
        severity: 'error'
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsuranceCompanies = async () => {
    try {
      const response = await insuranceCompanyService.getAll();
      console.log('API Yanıtı (Sigorta Şirketleri):', response.data);
      
      // API'den gelen yanıt yapısını kontrol et
      if (response.data && response.data.results) {
        // API pagination yapısı kullanıyor (results alanı içinde veriler)
        setInsuranceCompanies(response.data.results);
      } else if (Array.isArray(response.data)) {
        // Doğrudan dizi olarak geliyorsa
        setInsuranceCompanies(response.data);
      } else {
        // Hiçbir koşul sağlanmıyorsa boş dizi ata
        console.warn('Sigorta şirketi verileri beklenen formatta değil:', response.data);
        setInsuranceCompanies([]);
      }
    } catch (error) {
      console.error('Sigorta şirketleri yüklenirken hata oluştu:', error);
      setInsuranceCompanies([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAll();
      console.log('API Yanıtı (Roller):', response.data);
      
      // API'den gelen yanıt yapısını kontrol et
      if (response.data && response.data.results) {
        // API pagination yapısı kullanıyor (results alanı içinde veriler)
        setRoles(response.data.results);
      } else if (Array.isArray(response.data)) {
        // Doğrudan dizi olarak geliyorsa
        setRoles(response.data);
      } else {
        // Hiçbir koşul sağlanmıyorsa boş dizi ata
        console.warn('Rol verileri beklenen formatta değil:', response.data);
        setRoles([]);
      }
    } catch (error) {
      console.error('Roller yüklenirken hata oluştu:', error);
      setRoles([]);
    }
  };

  const handleOpenDialog = (userData = null) => {
    if (userData) {
      // Düzenleme modu
      setCurrentUser(userData);
      setFormData({
        username: userData.user.username,
        email: userData.user.email,
        password: '',
        first_name: userData.user.first_name,
        last_name: userData.user.last_name,
        company: user?.company?.id || '',
        roles: Array.isArray(userData.roles) ? userData.roles.map(role => role.id) : [],
        is_admin: userData.is_admin,
        is_active: userData.is_active
      });
    } else {
      // Yeni kullanıcı oluşturma modu
      setCurrentUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        company: user?.company?.id || '',
        roles: [],
        is_admin: false,
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (userData) => {
    setCurrentUser(userData);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'is_admin' || name === 'is_active') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRoleChange = (event) => {
    setFormData({ ...formData, roles: event.target.value });
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (currentUser) {
        // Kullanıcı güncelleme
        const updateData = {
          company: formData.company,
          roles: formData.roles,
          is_admin: formData.is_admin,
          is_active: formData.is_active,
          user: {
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name
          }
        };
        
        // Şifre değiştirilecekse ekle
        if (formData.password) {
          updateData.user.password = formData.password;
        }
        
        try {
          response = await companyUserService.update(currentUser.id, updateData);
          
          setSnackbar({
            open: true,
            message: 'Kullanıcı başarıyla güncellendi',
            severity: 'success'
          });
          
          handleCloseDialog();
          fetchUsers(); // Kullanıcı listesini yenile
        } catch (error) {
          console.error('Kullanıcı güncelleme hatası:', error);
          
          // API'den gelen hata mesajını göster
          let errorMessage = 'Kullanıcı güncellenirken hata oluştu';
          
          if (error.response && error.response.data) {
            if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (typeof error.response.data === 'object') {
              // Hata mesajlarını birleştir
              const errorMessages = [];
              Object.keys(error.response.data).forEach(key => {
                const value = error.response.data[key];
                if (Array.isArray(value)) {
                  errorMessages.push(`${key}: ${value.join(', ')}`);
                } else if (typeof value === 'string') {
                  errorMessages.push(`${key}: ${value}`);
                }
              });
              
              if (errorMessages.length > 0) {
                errorMessage = errorMessages.join('. ');
              }
            }
          }
          
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
          return;
        }
      } else {
        // Yeni kullanıcı oluşturma
        const newUserData = {
          user: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name
          },
          company: formData.company,
          roles: formData.roles,
          is_admin: formData.is_admin,
          is_active: formData.is_active
        };
        
        try {
          response = await companyUserService.create(newUserData);
          
          setSnackbar({
            open: true,
            message: 'Kullanıcı başarıyla oluşturuldu',
            severity: 'success'
          });
          
          handleCloseDialog();
          fetchUsers(); // Kullanıcı listesini yenile
        } catch (error) {
          console.error('Kullanıcı oluşturma hatası:', error);
          
          // API'den gelen hata mesajını göster
          let errorMessage = 'Kullanıcı kaydedilirken hata oluştu';
          
          if (error.response && error.response.data) {
            if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (typeof error.response.data === 'object') {
              // Hata mesajlarını birleştir
              const errorMessages = [];
              Object.keys(error.response.data).forEach(key => {
                const value = error.response.data[key];
                if (Array.isArray(value)) {
                  errorMessages.push(`${key}: ${value.join(', ')}`);
                } else if (typeof value === 'string') {
                  errorMessages.push(`${key}: ${value}`);
                }
              });
              
              if (errorMessages.length > 0) {
                errorMessage = errorMessages.join('. ');
              }
            }
          }
          
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
          return;
        }
      }
    } catch (error) {
      console.error('Kullanıcı kaydedilirken hata oluştu:', error);
      
      // API'den gelen hata mesajını göster
      let errorMessage = 'Kullanıcı kaydedilirken hata oluştu';
      
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'object') {
          // Hata mesajlarını birleştir
          const errorMessages = [];
          Object.keys(error.response.data).forEach(key => {
            const value = error.response.data[key];
            if (Array.isArray(value)) {
              errorMessages.push(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
              errorMessages.push(`${key}: ${value}`);
            }
          });
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('. ');
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await companyUserService.delete(currentUser.id);
      setSnackbar({
        open: true,
        message: 'Kullanıcı başarıyla silindi',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchUsers(); // Kullanıcı listesini yenile
    } catch (error) {
      console.error('Kullanıcı silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Kullanıcı silinirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Kullanıcı Yönetimi</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            sx={{ mr: 1 }}
          >
            Yenile
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Kullanıcı
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Kullanıcı Adı</TableCell>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Şirket</TableCell>
                <TableCell>Roller</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(users) && users.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell>{userData.id}</TableCell>
                  <TableCell>{userData.user.username}</TableCell>
                  <TableCell>
                    {userData.user.first_name} {userData.user.last_name}
                  </TableCell>
                  <TableCell>{userData.user.email}</TableCell>
                  <TableCell>{userData.company.name}</TableCell>
                  <TableCell>
                    {Array.isArray(userData.roles) ? userData.roles.map((role) => (
                      <Chip 
                        key={role.id} 
                        label={role.name} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    )) : null}
                  </TableCell>
                  <TableCell>
                    {userData.is_admin ? (
                      <CheckIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )}
                  </TableCell>
                  <TableCell>
                    {userData.is_active ? (
                      <Chip label="Aktif" color="success" size="small" />
                    ) : (
                      <Chip label="Pasif" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(userData)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(userData)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Kullanıcı Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Kullanıcı Adı"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={currentUser !== null} // Düzenleme modunda kullanıcı adı değiştirilemez
              />
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Şifre"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={currentUser ? "Değiştirmek istemiyorsanız boş bırakın" : ""}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Ad"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Soyad"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Şirket"
              value={user?.company?.name || ''}
              disabled={true}
              InputProps={{
                readOnly: true,
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Roller</InputLabel>
              <Select
                multiple
                name="roles"
                value={formData.roles || []}
                onChange={handleRoleChange}
                label="Roller"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Array.isArray(selected) && selected.map((roleId) => {
                      const role = Array.isArray(roles) && roles.find(r => r.id === roleId);
                      return role ? (
                        <Chip key={roleId} label={role.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {Array.isArray(roles) && roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_admin}
                    onChange={handleInputChange}
                    name="is_admin"
                    color="primary"
                  />
                }
                label="Yönetici"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Aktif"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentUser ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Kullanıcı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{currentUser?.user?.username}" kullanıcısını silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>İptal</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bildirim Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users; 