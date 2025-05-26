import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Chip, FormControlLabel, Switch, CircularProgress,
  Snackbar, Alert, Tooltip, Breadcrumbs, Link
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { companyUserService, companyService, roleService } from '../services/api';

const CompanyUsers = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
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
    fetchCompany();
    fetchCompanyUsers();
    fetchRoles();
  }, [companyId]);

  const fetchCompany = async () => {
    try {
      const response = await companyService.getById(companyId);
      setCompany(response.data);
    } catch (error) {
      console.error('Şirket bilgileri yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Şirket bilgileri yüklenirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const fetchCompanyUsers = async () => {
    setLoading(true);
    try {
      const response = await companyService.getUsers(companyId);
      setUsers(response.data || []);
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

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAll();
      setRoles(response.data || []);
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
          company: parseInt(companyId),
          roles: formData.roles,
          is_admin: formData.is_admin,
          is_active: formData.is_active
        };
        
        // Kullanıcı bilgilerini güncelle
        const userData = {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name
        };
        
        if (formData.password) {
          userData.password = formData.password;
        }
        
        response = await companyUserService.update(currentUser.id, updateData);
        
        setSnackbar({
          open: true,
          message: 'Kullanıcı başarıyla güncellendi',
          severity: 'success'
        });
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
          company: parseInt(companyId),
          roles: formData.roles,
          is_admin: formData.is_admin,
          is_active: formData.is_active
        };
        
        response = await companyUserService.create(newUserData);
        
        setSnackbar({
          open: true,
          message: 'Kullanıcı başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchCompanyUsers(); // Kullanıcı listesini yenile
    } catch (error) {
      console.error('Kullanıcı kaydedilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Kullanıcı kaydedilirken hata oluştu',
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
      fetchCompanyUsers(); // Kullanıcı listesini yenile
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

  const handleBack = () => {
    navigate('/companies');
  };

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          sx={{ cursor: 'pointer' }}
          onClick={handleBack}
        >
          Şirketler
        </Link>
        <Typography color="text.primary">
          {company?.name} - Kullanıcılar
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {company?.name} - Kullanıcı Yönetimi
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchCompanyUsers}
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

export default CompanyUsers; 