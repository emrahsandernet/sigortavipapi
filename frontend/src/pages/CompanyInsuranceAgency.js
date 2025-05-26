import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControlLabel, Switch,
  CircularProgress, Snackbar, Alert, Tooltip, MenuItem, Select, InputLabel,
  FormControl, FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import { insuranceCompanyService,insuranceCompanyItemService ,partageService} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const InsuranceCompanies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [availableInsuranceCompanies, setAvailableInsuranceCompanies] = useState([]);
  const [partageOptions, setPartageOptions] = useState([]);
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
    fetchAvailableInsuranceCompanies();
    fetchPartageOptions();
  }, []);

  const fetchInsuranceCompanies = async () => {
    setLoading(true);
    try {
      const response = await insuranceCompanyItemService.getAll();
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
      console.log(insuranceCompanies);
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

  const fetchAvailableInsuranceCompanies = async () => {
    try {
      const response = await insuranceCompanyService.getAll();
      if (response.data && response.data.results) {
        setAvailableInsuranceCompanies(response.data.results);
      } else if (Array.isArray(response.data)) {
        setAvailableInsuranceCompanies(response.data);
      } else {
        console.warn('Sigorta şirketi verileri beklenen formatta değil:', response.data);
        setAvailableInsuranceCompanies([]);
      }
    } catch (error) {
      console.error('Sigorta şirketleri yüklenirken hata oluştu:', error);
    }
  };

  const fetchPartageOptions = async () => {
    try {
      // API servisini kullanarak partaj değerlerini çekiyoruz
      const response = await partageService.getAll();
      const data = response.data;
      
      if (Array.isArray(data)) {
        setPartageOptions(data);
      } else if (data && data.results && Array.isArray(data.results)) {
        setPartageOptions(data.results);
      } else {
        console.warn('Partaj verileri beklenen formatta değil:', data);
        // Fallback olarak sabit değerler kullanabilir
        setDefaultPartageOptions();
      }
    } catch (error) {
      console.error('Partaj değerleri yüklenirken hata oluştu:', error);
      // Hata durumunda sabit değerler kullanıyoruz
      setDefaultPartageOptions();
    }
  };

  const setDefaultPartageOptions = () => {
    setPartageOptions([
     
      { id: 50, value: 50 }
    ]);
  };

  const handleOpenDialog = (companyData = null) => {
    if (companyData) {
      // Düzenleme modu
      setCurrentCompany(companyData);
      console.log(companyData);
      setFormData({
        username: companyData.username,
        password: companyData.password,
        company_code: companyData.insurance_company.code || '',
        company_name: companyData.insurance_company.name || '',
        image: null, // Dosya seçimi için boş bırakıyoruz
        totp_code: companyData.totp_code || '',
        phone_number: companyData.phone_number || '',
        proxy_url: companyData.proxy_url || '',
        proxy_username: companyData.proxy_username || '',
        proxy_password: companyData.proxy_password || '',
        is_proxy_active: companyData.is_proxy_active || false,
        sms_code: companyData.sms_code || '',
        is_active: companyData.is_active,
        company: companyData.company,
        insurance_company: companyData.insurance_company.id,
        partage: companyData.partage,
      });
    } else {
      // Yeni sigorta şirketi oluşturma modu
      setCurrentCompany(null);
      setFormData({
        username: '',
        password: '',
        company_code: '',
        company_name: '',
        image: null,
        totp_code: '',
        phone_number: '',
        proxy_url: '',
        proxy_username: '',
        proxy_password: '',
        is_proxy_active: false,
        sms_code: '',
        is_active: true,
        company: user.company?.id, // Kullanıcının şirket ID'si
        insurance_company: '', // Boş olarak başlat, kullanıcı seçecek
        partage: '',
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
    if (name === 'is_active' || name === 'is_proxy_active') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'image' && files) {
      setFormData({ ...formData, [name]: files[0] });
    } else if (name === 'insurance_company') {
      // Sigorta şirketi seçildiğinde, şirket adı ve kodunu otomatik doldur
      const selectedCompany = availableInsuranceCompanies.find(company => company.id.toString() === value.toString());
      if (selectedCompany) {
        setFormData({
          ...formData,
          [name]: value,
          company_name: selectedCompany.name,
          company_code: selectedCompany.code
        });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (id) => {
    try {
      if (!formData.insurance_company && !currentCompany) {
        setSnackbar({
          open: true,
          message: 'Lütfen bir sigorta şirketi seçin',
          severity: 'error'
        });
        return;
      }

      // FormData nesnesi oluştur (dosya yüklemek için)
      const submitData = new FormData();
      
      // Form verilerini FormData nesnesine ekle
      submitData.append('username', formData.username);
      submitData.append('password', formData.password);
      submitData.append('company_code', formData.company_code);
      submitData.append('company_name', formData.company_name);
      submitData.append('totp_code', formData.totp_code || '');
      submitData.append('phone_number', formData.phone_number || '');
      submitData.append('proxy_url', formData.proxy_url || '');
      submitData.append('proxy_username', formData.proxy_username || '');
      submitData.append('proxy_password', formData.proxy_password || '');
      submitData.append('is_proxy_active', formData.is_proxy_active || false);
      submitData.append('sms_code', formData.sms_code || '');
      submitData.append('is_active', formData.is_active);
      
      // Partage değerini sayısal değere dönüştürerek ekle
      if (formData.partage) {
        submitData.append('partage', parseInt(formData.partage, 10));
      }
      
      // İmaj varsa ekle
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      let response;
      if (currentCompany) {
        // Mevcut şirketi güncelleme işlemi
        submitData.append('company', currentCompany.company);
        submitData.append('insurance_company', currentCompany.insurance_company.id);
        
        response = await insuranceCompanyItemService.update(currentCompany.id, submitData);
        
        setSnackbar({
          open: true,
          message: 'Firma sigorta şirketi başarıyla güncellendi',
          severity: 'success'
        });
      } else {
        // Yeni şirket ekleme işlemi
        submitData.append('company', user.company?.id); // Kullanıcının şirketini kullan
        submitData.append('insurance_company', formData.insurance_company);
        
        response = await insuranceCompanyItemService.create(submitData);
        
        setSnackbar({
          open: true,
          message: 'Firma sigorta şirketi başarıyla oluşturuldu',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchInsuranceCompanies(); // Sigorta şirketi listesini yenile
    } catch (error) {
      console.error('Firma sigorta şirketi kaydedilirken hata oluştu:', error);
      
      // Hata mesajını göster
      const errorMessage = error.response?.data?.message || 
                          JSON.stringify(error.response?.data) ||
                          'Firma sigorta şirketi kaydedilirken bir hata oluştu';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await insuranceCompanyItemService.delete(currentCompany.id);
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

  const goToUpdatePartage = () => {
    navigate('/update-partage');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Firma Sigorta Şirketi Yönetimi</Typography>
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
            color="secondary" 
            startIcon={<PercentIcon />}
            onClick={goToUpdatePartage}
            sx={{ mr: 1 }}
          >
            Partaj Güncelle
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Firma Sigorta Şirketi
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer 
          component={Paper}
          sx={{ 
            maxHeight: 'calc(100vh - 220px)',
            overflow: 'auto',
            position: 'relative',
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap'
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Şirket Adı</TableCell>
                <TableCell>Kullanıcı Adı</TableCell>
                <TableCell>Şifre</TableCell>
                <TableCell>Totp Kodu</TableCell>
                <TableCell>Telefon Numarası</TableCell>
                <TableCell>SMS Kodu</TableCell>
                <TableCell>Proxy URL</TableCell>
                <TableCell>Proxy Kullanıcı Adı</TableCell>
                <TableCell>Proxy Şifre</TableCell>
                <TableCell>Proxy Aktif mi?</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell 
                  sx={{ 
                    position: 'sticky', 
                    right: 0, 
                    background: 'white',
                    boxShadow: '-5px 0 5px -2px rgba(0,0,0,0.1)',
                    zIndex: 3
                  }}
                >İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insuranceCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.id}</TableCell>
                  <TableCell>{company.insurance_company.name}</TableCell>
                  <TableCell>{company.username}</TableCell>
                  <TableCell>{company.password}</TableCell>
                  <TableCell>{company.totp_code}</TableCell>
                  <TableCell>{company.phone_number}</TableCell>
                  <TableCell>{company.sms_code}</TableCell>
                  <TableCell>{company.proxy_url}</TableCell>
                  <TableCell>{company.proxy_username}</TableCell>
                  <TableCell>{company.proxy_password}</TableCell>
                  <TableCell>{company.is_proxy_active ? 'Aktif' : 'Pasif'}</TableCell>
                  
                  <TableCell>
                    {company.is_active ? (
                      <Alert severity="success" sx={{ py: 0 }}>Aktif</Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>Pasif</Alert>
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ 
                      position: 'sticky', 
                      right: 0,
                      background: 'white',
                      zIndex: 2
                    }}
                  >
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentCompany ? 'Sigorta Şirketi Düzenle' : 'Yeni Sigorta Şirketi Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Şirket Bilgileri Grubu */}
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              p: 2, 
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Şirket Bilgileri
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel id="insurance-company-label">Sigorta Şirketi</InputLabel>
                  <Select
                    labelId="insurance-company-label"
                    name="insurance_company"
                    value={formData.insurance_company}
                    onChange={handleInputChange}
                    label="Sigorta Şirketi"
                    disabled={currentCompany !== null}
                  >
                    {availableInsuranceCompanies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Şirket Adı"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    readOnly: true
                  }}
                  helperText="Sigorta şirketi seçildiğinde otomatik doldurulur"
                />
                
                <TextField
                  fullWidth
                  label="Şirket Kodu"
                  name="company_code"
                  value={formData.company_code}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    readOnly: true
                  }}
                  helperText="Sigorta şirketi seçildiğinde otomatik doldurulur"
                />
              </Box>
            </Box>
            
            {/* Kullanıcı Bilgileri Grubu */}
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              p: 2, 
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Kullanıcı Bilgileri
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Kullanıcı Adı"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Şifre"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Totp Kodu"
                  name="totp_code"
                  value={formData.totp_code}
                  onChange={handleInputChange}
                />
                
                <TextField
                  fullWidth
                  label="Telefon Numarası"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
                
                <TextField
                  fullWidth
                  label="SMS Kodu"
                  name="sms_code"
                  value={formData.sms_code}
                  onChange={handleInputChange}
                />
              </Box>
            </Box>
            
            {/* Proxy Ayarları Grubu */}
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              p: 2, 
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Proxy Ayarları
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Proxy URL"
                  name="proxy_url"
                  value={formData.proxy_url}
                  onChange={handleInputChange}
                />
                
                <TextField
                  fullWidth
                  label="Proxy Kullanıcı Adı"
                  name="proxy_username"
                  value={formData.proxy_username}
                  onChange={handleInputChange}
                />
                
                <TextField
                  fullWidth
                  label="Proxy Şifre"
                  name="proxy_password"
                  value={formData.proxy_password}
                  onChange={handleInputChange}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_proxy_active}
                      onChange={handleInputChange}
                      name="is_proxy_active"
                      color="primary"
                    />
                  }
                  label="Proxy Aktif"
                />
              </Box>
            </Box>
            
            {/* Genel Ayarlar Grubu */}
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              p: 2, 
              borderRadius: 1,
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Genel Ayarlar
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="partage-label">Partaj</InputLabel>
                  <Select
                    labelId="partage-label"
                    name="partage"
                    value={formData.partage || ''}
                    onChange={handleInputChange}
                    label="Partaj"
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {partageOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Komisyon oranını seçiniz</FormHelperText>
                </FormControl>
                
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={() => handleSubmit(currentCompany ? currentCompany.id : null)} 
            variant="contained" 
            color="primary"
          >
            {currentCompany ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Sigorta Şirketi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{currentCompany?.insurance_company?.name}" sigorta şirketini silmek istediğinizden emin misiniz?
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