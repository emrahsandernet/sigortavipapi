import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControlLabel, Switch,
  CircularProgress, Snackbar, Alert, Tooltip, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { partageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Partages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partages, setPartages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentPartage, setCurrentPartage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    order: 0,
    is_active: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchPartages();
  }, []);

  const fetchPartages = async () => {
    setLoading(true);
    try {
      const response = await partageService.getAll();
      console.log('API Yanıtı (Partajlar):', response.data);
      
      if (response.data && response.data.results) {
        setPartages(response.data.results);
      } else if (Array.isArray(response.data)) {
        setPartages(response.data);
      } else {
        console.warn('Partaj verileri beklenen formatta değil:', response.data);
        setPartages([]);
      }
    } catch (error) {
      console.error('Partajlar yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Partajlar yüklenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (partageData = null) => {
    if (partageData) {
      setCurrentPartage(partageData);
      setFormData({
        name: partageData.name,
        code: partageData.code,
        order: partageData.order || 0,
        is_active: partageData.is_active
      });
    } else {
      setCurrentPartage(null);
      setFormData({
        name: '',
        code: '',
        order: 0,
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (partageData) => {
    setCurrentPartage(partageData);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (name === 'is_active') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseInt(value, 10) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (currentPartage) {
        response = await partageService.update(currentPartage.id, formData);
        
        setSnackbar({
          open: true,
          message: 'Partaj başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        response = await partageService.create(formData);
        
        setSnackbar({
          open: true,
          message: 'Partaj başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchPartages();
    } catch (error) {
      console.error('Partaj kaydedilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Partaj kaydedilirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await partageService.delete(currentPartage.id);
      setSnackbar({
        open: true,
        message: 'Partaj başarıyla silindi',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchPartages();
    } catch (error) {
      console.error('Partaj silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Partaj silinirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const viewRelatedCompanies = (partageId) => {
    // Partaja ait şirketleri görüntüleme sayfasına yönlendir
    // Şimdilik bu fonksiyon hazır değil, ileride eklenebilir
    console.log(`Partaj ID ${partageId} için ilişkili şirketler görüntülenecek`);
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
        <Typography variant="h4">Partaj Yönetimi</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchPartages}
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
            Yeni Partaj
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
                <TableCell>Partaj Adı</TableCell>
                <TableCell>Partaj Kodu</TableCell>
                <TableCell>Sıra</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(partages) && partages.map((partage) => (
                <TableRow key={partage.id}>
                  <TableCell>{partage.id}</TableCell>
                  <TableCell>{partage.name}</TableCell>
                  <TableCell>{partage.code}</TableCell>
                  <TableCell>{partage.order || 0}</TableCell>
                  <TableCell>
                    {partage.is_active ? (
                      <Alert severity="success" sx={{ py: 0 }}>Aktif</Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>Pasif</Alert>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(partage.created_at)}</TableCell>
                  <TableCell>
                    <Tooltip title="İlişkili Şirketler">
                      <IconButton 
                        color="info" 
                        onClick={() => viewRelatedCompanies(partage.id)}
                      >
                        <BusinessIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(partage)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(partage)}
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

      {/* Partaj Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentPartage ? 'Partaj Düzenle' : 'Yeni Partaj Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Partaj Adı"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              label="Partaj Kodu"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              disabled={currentPartage !== null}
              helperText="Partaj kodu benzersiz olmalıdır ve daha sonra değiştirilemez."
            />
            
            <TextField
              fullWidth
              label="Sıra"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleInputChange}
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
            {currentPartage ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Partaj Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{currentPartage?.name}" partajını silmek istediğinizden emin misiniz?
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

export default Partages; 