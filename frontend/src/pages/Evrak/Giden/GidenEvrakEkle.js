import React, { useState } from 'react';
import axios from 'axios';
import { Button, Grid, TextField, Typography, Alert, CircularProgress, Card, CardContent, Divider, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const initialState = {
  sira_no: '',
  nereye: '', // <-- değişti
  evrak_tarih: '',
  evrak_no: '',
  evrak_cinsi: '',
  evrak_eki: 1,
  evrak_ozet: '',
};

export default function GidenEvrakEkle({ onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'evrak_eki') {
      setFiles(Array(Number(value)).fill(null));
    }
  };

  const handleNereyeChange = (e) => {
    const { value } = e.target;
    
    // İ, i, I harflerinden biri basıldığında otomatik tamamlama
    if (value.toLowerCase().includes('i') || value.includes('İ') || value.includes('I')) {
      setForm((prev) => ({ ...prev, nereye: "İLÇE MİLLİ EĞİTİM MÜDÜRLÜĞÜ" }));
    } else {
      setForm((prev) => ({ ...prev, nereye: value }));
    }
  };

  const handleFileChange = (idx, file) => {
    setFiles((prev) => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      
      console.log('Form verileri:', form);
      console.log('Dosyalar:', files);
      
      // Sadece null olmayan dosyaları ekle
      files.forEach((file, index) => {
        if (file) {
          console.log(`Dosya ${index} ekleniyor:`, {
            name: file.name,
            size: file.size,
            type: file.type
          });
          formData.append('belgeler', file);
        }
      });
      
      const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
      console.log('API URL:', API_URL);
      console.log('FormData içeriği:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await axios.post(`${API_URL}/giden-evrak`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('Evrak başarıyla eklendi:', response.data);
      setForm(initialState);
      setFiles([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Evrak ekleme hatası:', err);
      console.error('Hata detayları:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      let msg = 'Kayıt sırasında hata oluştu.';
      if (err.response && err.response.data && err.response.data.detail) {
        msg += ' ' + err.response.data.detail;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 4, boxShadow: 3, p: { xs: 1, sm: 2 } }}>
      <Card elevation={6} sx={{ borderRadius: 4, maxWidth: 600, mx: 'auto', my: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom color="primary.main">
            Giden Evrak Ekle
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <form onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Sıra No" name="sira_no" type="number" value={form.sira_no} onChange={handleChange} required fullWidth size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Nereye" 
                  name="nereye" 
                  value={form.nereye} 
                  onChange={handleNereyeChange} 
                  required 
                  fullWidth 
                  size="small" 
                  variant="outlined"
                  helperText="İ, i veya I yazınca otomatik tamamlanır"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Evrak Tarihi" name="evrak_tarih" type="date" value={form.evrak_tarih} onChange={handleChange} required fullWidth size="small" InputLabelProps={{ shrink: true }} variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Evrak No" name="evrak_no" value={form.evrak_no} onChange={handleChange} required fullWidth size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Cinsi" name="evrak_cinsi" value={form.evrak_cinsi} onChange={handleChange} required fullWidth size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Eki (Dosya Sayısı)" name="evrak_eki" type="number" min="1" value={form.evrak_eki} onChange={handleChange} required fullWidth size="small" variant="outlined" helperText="Kaç dosya ekleyeceksiniz?" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Özeti" name="evrak_ozet" value={form.evrak_ozet} onChange={handleChange} required fullWidth size="small" variant="outlined" multiline minRows={2} maxRows={4} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Ekler
                </Typography>
                <Grid container spacing={2}>
                  {Array.from({ length: Number(form.evrak_eki) }).map((_, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          borderStyle: 'dashed',
                          bgcolor: files[idx] ? '#e3f2fd' : '#fafafa',
                          color: files[idx] ? 'primary.main' : 'inherit',
                          fontWeight: 500,
                          py: 2,
                        }}
                      >
                        {files[idx] ? files[idx].name : 'Dosya Seç veya Sürükle-Bırak'}
                        <input
                          type="file"
                          accept=".pdf,.xlsx,.xls,.jpeg,.jpg,.png,.docx,.doc"
                          hidden
                          onChange={(e) => handleFileChange(idx, e.target.files[0])}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Desteklenen dosya türleri: pdf, xlsx, xls, jpeg, jpg, png, docx, doc
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              {info && (
                <Grid item xs={12}><Alert severity="info">{info}</Alert></Grid>
              )}
              {error && (
                <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>
              )}
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 160, borderRadius: 3, fontWeight: 700, boxShadow: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Kaydet'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 