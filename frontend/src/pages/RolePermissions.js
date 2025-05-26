import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, FormControlLabel, Switch, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Snackbar, Alert, Tooltip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { rolePermissionService, roleService, queryTypeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RolePermissions = () => {
  const { user } = useAuth();
  const [rolePermissions, setRolePermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [queryTypes, setQueryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentPermission, setCurrentPermission] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    query_type: '',
    can_query: true,
    can_create: false,
    can_update: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchRolePermissions();
    fetchRoles();
    fetchQueryTypes();
  }, []);

  const fetchRolePermissions = async () => {
    setLoading(true);
    try {
      const response = await rolePermissionService.getAll();
      console.log('API Yanıtı (Rol İzinleri):', response.data);
      
      // API'den gelen yanıt yapısını kontrol et
      if (response.data && response.data.results) {
        setRolePermissions(response.data.results);
      } else if (Array.isArray(response.data)) {
        setRolePermissions(response.data);
      } else {
        console.warn('Rol izni verileri beklenen formatta değil:', response.data);
        setRolePermissions([]);
      }
    } catch (error) {
      console.error('Rol izinleri yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Rol izinleri yüklenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAll();
      if (response.data && response.data.results) {
        setRoles(response.data.results);
      } else if (Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error('Roller yüklenirken hata oluştu:', error);
      setRoles([]);
    }
  };

  const fetchQueryTypes = async () => {
    try {
      const response = await queryTypeService.getAll();
      if (response.data && response.data.results) {
        setQueryTypes(response.data.results);
      } else if (Array.isArray(response.data)) {
        setQueryTypes(response.data);
      } else {
        setQueryTypes([]);
      }
    } catch (error) {
      console.error('Sorgu türleri yüklenirken hata oluştu:', error);
      setQueryTypes([]);
    }
  };

  const handleOpenDialog = (permissionData = null) => {
    if (permissionData) {
      // Düzenleme modu
      setCurrentPermission(permissionData);
      setFormData({
        role: permissionData.role,
        query_type: permissionData.query_type,
        can_query: permissionData.can_query,
        can_create: permissionData.can_create,
        can_update: permissionData.can_update
      });
    } else {
      // Yeni izin oluşturma modu
      setCurrentPermission(null);
      setFormData({
        role: '',
        query_type: '',
        can_query: true,
        can_create: false,
        can_update: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (permissionData) => {
    setCurrentPermission(permissionData);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'can_query' || name === 'can_create' || name === 'can_update') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (currentPermission) {
        // İzin güncelleme
        response = await rolePermissionService.update(currentPermission.id, formData);
        
        setSnackbar({
          open: true,
          message: 'Rol izni başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        // Yeni izin oluşturma
        response = await rolePermissionService.create(formData);
        
        setSnackbar({
          open: true,
          message: 'Rol izni başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchRolePermissions(); // İzin listesini yenile
    } catch (error) {
      console.error('Rol izni kaydedilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Rol izni kaydedilirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await rolePermissionService.delete(currentPermission.id);
      setSnackbar({
        open: true,
        message: 'Rol izni başarıyla silindi',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchRolePermissions(); // İzin listesini yenile
    } catch (error) {
      console.error('Rol izni silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Rol izni silinirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : `Rol #${roleId}`;
  };

  const getQueryTypeName = (queryTypeId) => {
    const queryType = queryTypes.find(qt => qt.id === queryTypeId);
    return queryType ? (queryType.display_name || queryType.name) : `Sorgu Türü #${queryTypeId}`;
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
        <Typography variant="h4">Rol İzinleri Yönetimi</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchRolePermissions}
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
            Yeni Rol İzni
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
                <TableCell>Rol</TableCell>
                <TableCell>Sorgu Türü</TableCell>
                <TableCell>Sorgulama</TableCell>
                <TableCell>Oluşturma</TableCell>
                <TableCell>Güncelleme</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(rolePermissions) && rolePermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.id}</TableCell>
                  <TableCell>{getRoleName(permission.role)}</TableCell>
                  <TableCell>{permission.query_type_name || getQueryTypeName(permission.query_type)}</TableCell>
                  <TableCell>
                    {permission.can_query ? (
                      <Alert severity="success" sx={{ py: 0 }}>Evet</Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>Hayır</Alert>
                    )}
                  </TableCell>
                  <TableCell>
                    {permission.can_create ? (
                      <Alert severity="success" sx={{ py: 0 }}>Evet</Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>Hayır</Alert>
                    )}
                  </TableCell>
                  <TableCell>
                    {permission.can_update ? (
                      <Alert severity="success" sx={{ py: 0 }}>Evet</Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>Hayır</Alert>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(permission)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(permission)}
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

      {/* Rol İzni Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentPermission ? 'Rol İzni Düzenle' : 'Yeni Rol İzni Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="role-select-label">Rol</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Rol"
                disabled={currentPermission !== null} // Düzenleme modunda rol değiştirilemez
              >
                {Array.isArray(roles) && roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="query-type-select-label">Sorgu Türü</InputLabel>
              <Select
                labelId="query-type-select-label"
                id="query-type-select"
                name="query_type"
                value={formData.query_type}
                onChange={handleInputChange}
                label="Sorgu Türü"
                disabled={currentPermission !== null} // Düzenleme modunda sorgu türü değiştirilemez
              >
                {Array.isArray(queryTypes) && queryTypes.map((queryType) => (
                  <MenuItem key={queryType.id} value={queryType.id}>
                    {queryType.display_name || queryType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  İzinler
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_query}
                      onChange={handleInputChange}
                      name="can_query"
                      color="primary"
                    />
                  }
                  label="Sorgulama"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_create}
                      onChange={handleInputChange}
                      name="can_create"
                      color="primary"
                    />
                  }
                  label="Oluşturma"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.can_update}
                      onChange={handleInputChange}
                      name="can_update"
                      color="primary"
                    />
                  }
                  label="Güncelleme"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentPermission ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Rol İzni Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu rol iznini silmek istediğinizden emin misiniz?
          </Typography>
          {currentPermission && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Rol: {getRoleName(currentPermission.role)}<br />
              Sorgu Türü: {currentPermission.query_type_name || getQueryTypeName(currentPermission.query_type)}
            </Typography>
          )}
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

export default RolePermissions; 