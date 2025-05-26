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
  People as PeopleIcon
} from '@mui/icons-material';
import { insuranceCompanyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import trLocale from 'date-fns/locale/tr';

const InsuranceCompanies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    login_url: '',
    explorer_url: '',
    image: null,
    is_active: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchInsuranceCompanies();
  }, []);

  const fetchInsuranceCompanies = async () => {
    setLoading(true);
    try {
      const response = await insuranceCompanyService.getAll();
      console.log('API Yanıtı (Sigorta Şirketleri):', response.data);
      
      // API'den gelen yanıt yapısını kontrol et
      if (response.data && response.data.results) {
        setInsuranceCompanies(response.data.results);
      } else if (Array.isArray(response.data)) {
        setInsuranceCompanies(response.data);
      } else {
        console.warn('Sigorta şirketi verileri beklenen formatta değil:', response.data);
        setInsuranceCompanies([]);
      }
    } catch (error) {
      console.error('Sigorta şirketleri yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Sigorta şirketleri yüklenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (companyData = null) => {
    if (companyData) {
      // Düzenleme modu
      setCurrentCompany(companyData);
      setFormData({
        name: companyData.name,
        code: companyData.code,
        login_url: companyData.login_url || '',
        explorer_url: companyData.explorer_url || '',
        image: null, // Dosya seçimi için boş bırakıyoruz
        is_active: companyData.is_active
      });
    } else {
      // Yeni sigorta şirketi oluşturma modu
      setCurrentCompany(null);
      setFormData({
        name: '',
        code: '',
        login_url: '',
        explorer_url: '',
        image: null,
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (companyData) => {
    setCurrentCompany(companyData);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, files } = e.target;
    if (name === 'is_active') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'image' && files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      // FormData nesnesi oluştur (dosya yüklemek için)
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('code', formData.code);
      submitData.append('login_url', formData.login_url);
      submitData.append('explorer_url', formData.explorer_url);
      submitData.append('is_active', formData.is_active);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      let response;
      if (currentCompany) {
        // Sigorta şirketi güncelleme
        response = await insuranceCompanyService.update(currentCompany.id, submitData);
        
        setSnackbar({
          open: true,
          message: 'Sigorta şirketi başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        // Yeni sigorta şirketi oluşturma
        response = await insuranceCompanyService.create(submitData);
        
        setSnackbar({
          open: true,
          message: 'Sigorta şirketi başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchInsuranceCompanies(); // Sigorta şirketi listesini yenile
    } catch (error) {
      console.error('Sigorta şirketi kaydedilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Sigorta şirketi kaydedilirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await insuranceCompanyService.delete(currentCompany.id);
      setSnackbar({
        open: true,
        message: 'Sigorta şirketi başarıyla silindi',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchInsuranceCompanies(); // Sigorta şirketi listesini yenile
    } catch (error) {
      console.error('Sigorta şirketi silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Sigorta şirketi silinirken hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const viewCompanyItems = (companyId) => {
    navigate(`/insurance-companies/${companyId}/items`);
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
        <Typography variant="h4">Sigorta Şirketleri Yönetimi</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchInsuranceCompanies}
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
            Yeni Sigorta Şirketi
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
                <TableCell>Logo</TableCell>
                <TableCell>Şirket Adı</TableCell>
                <TableCell>Şirket Kodu</TableCell>
                <TableCell>Login URL</TableCell>
                <TableCell>Explorer URL</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insuranceCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.id}</TableCell>
                  <TableCell>
                    {company.image && (
                      <img 
                        src={company.image} 
                        alt={company.name} 
                        style={{ width: 50, height: 50, objectFit: 'contain' }} 
                      />
                    )}
                  </TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.code}</TableCell>
                  <TableCell>{company.login_url}</TableCell>
                  <TableCell>{company.explorer_url}</TableCell>
                  <TableCell>
                    {company.is_active ? (
                      <Alert severity="success" sx={{ py: 0 }}>Aktif</Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>Pasif</Alert>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(company.created_at)}</TableCell>
                  <TableCell>
                    <Tooltip title="Sigorta Şirketi Öğeleri">
                      <IconButton 
                        color="info" 
                        onClick={() => viewCompanyItems(company.id)}
                      >
                        <PeopleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(company)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(company)}
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

      {/* Sigorta Şirketi Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentCompany ? 'Sigorta Şirketi Düzenle' : 'Yeni Sigorta Şirketi Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Şirket Adı"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              label="Şirket Kodu"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              disabled={currentCompany !== null} // Düzenleme modunda şirket kodu değiştirilemez
              helperText="Şirket kodu benzersiz olmalıdır ve daha sonra değiştirilemez."
            />
            
            <TextField
              fullWidth
              label="Login URL"
              name="login_url"
              value={formData.login_url}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              label="Explorer URL"
              name="explorer_url"
              value={formData.explorer_url}
              onChange={handleInputChange}
            />
            
            <Box>
              <Button
                variant="contained"
                component="label"
              >
                Logo Yükle
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  hidden
                  onChange={handleInputChange}
                />
              </Button>
              {formData.image && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Seçilen dosya: {formData.image.name}
                </Typography>
              )}
            </Box>
            
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
            {currentCompany ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Sigorta Şirketi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{currentCompany?.name}" sigorta şirketini silmek istediğinizden emin misiniz?
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

export default InsuranceCompanies; 