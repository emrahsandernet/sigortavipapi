import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControlLabel, Switch,
  CircularProgress, Snackbar, Alert, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { roleService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Roles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await roleService.getAll();
      console.log('API Yanıtı (Roller):', response.data);
      
      // API'den gelen yanıt yapısını kontrol et
      if (response.data && response.data.results) {
        setRoles(response.data.results);
      } else if (Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        console.warn('Rol verileri beklenen formatta değil:', response.data);
        setRoles([]);
      }
    } catch (error) {
      console.error('Roller yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Roller yüklenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (roleData = null) => {
    if (roleData) {
      // Düzenleme modu
      setCurrentRole(roleData);
      setFormData({
        name: roleData.name,
        description: roleData.description || '',
        is_active: roleData.is_active
      });
    } else {
      // Yeni rol oluşturma modu
      setCurrentRole(null);
      setFormData({
        name: '',
        description: '',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (roleData) => {
    setCurrentRole(roleData);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'is_active') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (currentRole) {
        // Rol güncelleme
        response = await roleService.update(currentRole.id, formData);
        
        setSnackbar({
          open: true,
          message: 'Rol başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        // Yeni rol oluşturma
        response = await roleService.create(formData);
        
        setSnackbar({
          open: true,
          message: 'Rol başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchRoles(); // Rol listesini yenile
    } catch (error) {
      console.error('Rol kaydedilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Rol kaydedilirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await roleService.delete(currentRole.id);
      setSnackbar({
        open: true,
        message: 'Rol başarıyla silindi',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchRoles(); // Rol listesini yenile
    } catch (error) {
      console.error('Rol silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Rol silinirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const viewRolePermissions = (roleId) => {
    navigate(`/roles/${roleId}/permissions`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Rol Yönetimi</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchRoles}
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
            Yeni Rol
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
                <TableCell>Rol Adı</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(roles) && roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    {role.is_active ? (
                      <Alert severity="success" sx={{ py: 0 }}>Aktif</Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>Pasif</Alert>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(role.created_at)}</TableCell>
                  <TableCell>
                    <Tooltip title="Yetkiler">
                      <IconButton 
                        color="info" 
                        onClick={() => viewRolePermissions(role.id)}
                      >
                        <SecurityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(role)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(role)}
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

      {/* Rol Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentRole ? 'Rol Düzenle' : 'Yeni Rol Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Rol Adı"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentRole ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Rol Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{currentRole?.name}" rolünü silmek istediğinizden emin misiniz?
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

export default Roles; 