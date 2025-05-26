import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControlLabel, Switch,
  CircularProgress, Snackbar, Alert, Tooltip, MenuItem, Select, InputLabel,
  FormControl, FormHelperText, Checkbox
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { insuranceCompanyService, insuranceCompanyItemService, partageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UpdatePartage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insuranceCompanyItems, setInsuranceCompanyItems] = useState([]);
  const [partageOptions, setPartageOptions] = useState([]);
  const [selectedPartage, setSelectedPartage] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchInsuranceCompanyItems();
    fetchPartageOptions();
  }, []);

  const fetchInsuranceCompanyItems = async () => {
    setLoading(true);
    try {
      const response = await insuranceCompanyItemService.getAll();
      if (response.data && response.data.results) {
        setInsuranceCompanyItems(response.data.results);
      } else if (Array.isArray(response.data)) {
        setInsuranceCompanyItems(response.data);
      } else {
        console.warn('Sigorta şirketi öğeleri beklenen formatta değil:', response.data);
        setInsuranceCompanyItems([]);
      }
    } catch (error) {
      console.error('Sigorta şirketi öğeleri yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Sigorta şirketi öğeleri yüklenirken hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartageOptions = async () => {
    try {
      const response = await partageService.getAll();
      const data = response.data;
      
      if (Array.isArray(data)) {
        setPartageOptions(data);
      } else if (data && data.results && Array.isArray(data.results)) {
        setPartageOptions(data.results);
      } else {
        console.warn('Partaj verileri beklenen formatta değil:', data);
        setDefaultPartageOptions();
      }
    } catch (error) {
      console.error('Partaj değerleri yüklenirken hata oluştu:', error);
      setDefaultPartageOptions();
    }
  };

  const setDefaultPartageOptions = () => {
    setPartageOptions([
      { id: 50, value: 50 }
    ]);
  };

  const handlePartageChange = (event) => {
    setSelectedPartage(event.target.value);
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(insuranceCompanyItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleUpdatePartage = async () => {
    if (!selectedPartage) {
      setSnackbar({
        open: true,
        message: 'Lütfen bir partaj değeri seçin',
        severity: 'error'
      });
      return;
    }

    if (selectedItems.length === 0) {
      setSnackbar({
        open: true,
        message: 'Lütfen en az bir sigorta şirketi seçin',
        severity: 'error'
      });
      return;
    }

    setUpdating(true);
    try {
      // API'de toplu güncelleme işlemi varsa:
      // await insuranceCompanyItemService.bulkUpdatePartage(selectedItems, parseInt(selectedPartage, 10));
      
      // Yoksa tek tek güncelleme yapılabilir:
      const updatePromises = selectedItems.map(itemId => {
        const formData = new FormData();
        formData.append('partage', parseInt(selectedPartage, 10));
        return insuranceCompanyItemService.update(itemId, formData);
      });
      
      await Promise.all(updatePromises);
      
      setSnackbar({
        open: true,
        message: `${selectedItems.length} adet sigorta şirketi öğesi başarıyla güncellendi`,
        severity: 'success'
      });
      
      // Güncellemeden sonra listeyi yenile
      fetchInsuranceCompanyItems();
      setSelectedItems([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Partaj güncellenirken hata oluştu:', error);
      const errorMessage = error.response?.data?.message || 
                          JSON.stringify(error.response?.data) ||
                          'Partaj güncellenirken bir hata oluştu';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={goBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Toplu Partaj Güncelleme</Typography>
        </Box>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchInsuranceCompanyItems}
            sx={{ mr: 1 }}
            disabled={updating}
          >
            Yenile
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="partage-label">Partaj</InputLabel>
            <Select
              labelId="partage-label"
              value={selectedPartage}
              onChange={handlePartageChange}
              label="Partaj"
              disabled={updating}
            >
              <MenuItem value="">Seçiniz</MenuItem>
              {partageOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Tüm seçili şirketlere uygulanacak yeni partaj değeri</FormHelperText>
          </FormControl>

          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleUpdatePartage}
            disabled={updating || !selectedPartage || selectedItems.length === 0}
          >
            {updating ? 'Güncelleniyor...' : 'Seçili Şirketleri Güncelle'}
          </Button>

          <Typography color="text.secondary" sx={{ ml: 2 }}>
            {selectedItems.length} şirket seçildi
          </Typography>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer 
          component={Paper}
          sx={{ 
            maxHeight: 'calc(100vh - 300px)',
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
                <TableCell padding="checkbox">
                  <Checkbox 
                    checked={selectAll} 
                    onChange={handleSelectAll} 
                    disabled={updating}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Şirket Adı</TableCell>
                <TableCell>Kullanıcı Adı</TableCell>
                <TableCell>Mevcut Partaj</TableCell>
                <TableCell>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insuranceCompanyItems.map((item) => (
                <TableRow 
                  key={item.id}
                  selected={selectedItems.includes(item.id)}
                  onClick={() => handleSelectItem(item.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox 
                      checked={selectedItems.includes(item.id)} 
                      onChange={() => handleSelectItem(item.id)}
                      disabled={updating}
                    />
                  </TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.insurance_company.name}</TableCell>
                  <TableCell>{item.username}</TableCell>
                  <TableCell>
                    {item.partage ? (
                      partageOptions.find(p => p.id === item.partage)?.name || `%${item.partage}`
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {item.is_active ? (
                      <Alert severity="success" sx={{ py: 0 }}>Aktif</Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>Pasif</Alert>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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

export default UpdatePartage; 