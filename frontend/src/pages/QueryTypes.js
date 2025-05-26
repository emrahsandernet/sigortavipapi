import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControlLabel, Switch,
  CircularProgress, Snackbar, Alert, Tooltip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { queryTypeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QueryTypes = () => {
  const { user } = useAuth();
  const [queryTypes, setQueryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentQueryType, setCurrentQueryType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sorgu türü seçenekleri
  const queryTypeOptions = [
    { value: 'traffic', label: 'Trafik Sigortası' },
    { value: 'casco', label: 'Kasko' },
    { value: 'health', label: 'Sağlık Sigortası' },
    { value: 'life', label: 'Hayat Sigortası' },
    { value: 'travel', label: 'Seyahat Sigortası' },
    { value: 'home', label: 'Konut Sigortası' },
    { value: 'workplace', label: 'İşyeri Sigortası' },
    { value: 'other', label: 'Diğer' }
  ];

  useEffect(() => {
    fetchQueryTypes();
  }, []);

  const fetchQueryTypes = async () => {
    setLoading(true);
    try {
      const response = await queryTypeService.getAll();
      console.log('API Yanıtı (Sorgu Türleri):', response.data);
      
      // API'den gelen yanıt yapısını kontrol et
      if (response.data && response.data.results) {
        setQueryTypes(response.data.results);
      } else if (Array.isArray(response.data)) {
        setQueryTypes(response.data);
      } else {
        console.warn('Sorgu türü verileri beklenen formatta değil:', response.data);
        setQueryTypes([]);
      }
    } catch (error) {
      console.error('Sorgu türleri yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Sorgu türleri yüklenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (queryTypeData = null) => {
    if (queryTypeData) {
      // Düzenleme modu
      setCurrentQueryType(queryTypeData);
      setFormData({
        name: queryTypeData.name,
        description: queryTypeData.description || ''
      });
    } else {
      // Yeni sorgu türü oluşturma modu
      setCurrentQueryType(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (queryTypeData) => {
    setCurrentQueryType(queryTypeData);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (currentQueryType) {
        // Sorgu türü güncelleme
        response = await queryTypeService.update(currentQueryType.id, formData);
        
        setSnackbar({
          open: true,
          message: 'Sorgu türü başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        // Yeni sorgu türü oluşturma
        response = await queryTypeService.create(formData);
        
        setSnackbar({
          open: true,
          message: 'Sorgu türü başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchQueryTypes(); // Sorgu türü listesini yenile
    } catch (error) {
      console.error('Sorgu türü kaydedilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Sorgu türü kaydedilirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await queryTypeService.delete(currentQueryType.id);
      setSnackbar({
        open: true,
        message: 'Sorgu türü başarıyla silindi',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchQueryTypes(); // Sorgu türü listesini yenile
    } catch (error) {
      console.error('Sorgu türü silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Sorgu türü silinirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getQueryTypeName = (code) => {
    const option = queryTypeOptions.find(opt => opt.value === code);
    return option ? option.label : code;
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
        <Typography variant="h4">Sorgu Türleri Yönetimi</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchQueryTypes}
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
            Yeni Sorgu Türü
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
                <TableCell>Sorgu Türü</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(queryTypes) && queryTypes.map((queryType) => (
                <TableRow key={queryType.id}>
                  <TableCell>{queryType.id}</TableCell>
                  <TableCell>{queryType.display_name || getQueryTypeName(queryType.name)}</TableCell>
                  <TableCell>{queryType.description || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(queryType)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(queryType)}
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

      {/* Sorgu Türü Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentQueryType ? 'Sorgu Türü Düzenle' : 'Yeni Sorgu Türü Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="query-type-select-label">Sorgu Türü</InputLabel>
              <Select
                labelId="query-type-select-label"
                id="query-type-select"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={currentQueryType !== null} // Düzenleme modunda sorgu türü değiştirilemez
                label="Sorgu Türü"
              >
                {queryTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentQueryType ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Sorgu Türü Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{currentQueryType?.display_name || getQueryTypeName(currentQueryType?.name)}" sorgu türünü silmek istediğinizden emin misiniz?
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

export default QueryTypes; 