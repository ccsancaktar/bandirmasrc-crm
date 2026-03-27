import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Grid, TextField, Typography, Paper, Alert, CircularProgress, Card, Divider, Chip, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function GidenEvrakDuzenle({ evrakId, onSuccess, onCancel }) {
  const [form, setForm] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  // Belgeler state'ini slot bazlı yönet
  const [belgeler, setBelgeler] = useState([]); // [{id, belge_yolu, belge_adi}, ...]
  const [files, setFiles] = useState([]); // slot bazlı yeni dosyalar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBelgeId, setSelectedBelgeId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/giden-evrak/${evrakId}`)
      .then(res => {
        const f = {
          sira_no: res.data.sira_no,
          nereye: res.data.nereye, // <-- değişti
          evrak_tarih: res.data.evrak_tarih,
          evrak_no: res.data.evrak_no,
          evrak_cinsi: res.data.evrak_cinsi,
          evrak_eki: res.data.evrak_eki,
          evrak_ozet: res.data.evrak_ozet,
        };
        setForm(f);
        setInitialForm(f);
        setBelgeler(res.data.belgeler || []);
      })
      .catch(() => setError('Detaylar alınamadı.'))
      .finally(() => setLoading(false));
  }, [evrakId, API_URL]);

  // Evrak sayısı değiştiğinde slotları güncelle
  useEffect(() => {
    if (!form) return;
    const slotCount = Number(form.evrak_eki) || 0;
    setBelgeler(prev => {
      const arr = [...(prev || [])];
      while (arr.length < slotCount) arr.push({});
      if (arr.length > slotCount) arr.length = slotCount;
      return arr;
    });
    setFiles(prev => {
      const arr = [...(prev || [])];
      while (arr.length < slotCount) arr.push(null);
      if (arr.length > slotCount) arr.length = slotCount;
      return arr;
    });
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Sil: ilgili slotu boşalt
  const handleDeleteBelge = async (slotIdx) => {
    const belge = belgeler[slotIdx];
    if (!belge || !belge.id) return;
    setSelectedBelgeId(belge.id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBelge = async () => {
    try {
      await axios.delete(`${API_URL}/giden-evrak/${evrakId}/belge/${selectedBelgeId}`);
      const res = await axios.get(`${API_URL}/giden-evrak/${evrakId}`);
      setBelgeler(res.data.belgeler || []);
      setFiles(f => {
        const arr = [...f];
        arr[belgeler.findIndex(b => b.id === selectedBelgeId)] = null;
        return arr;
      });
      setShowDeleteDialog(false);
      setSelectedBelgeId(null);
    } catch {
      alert('Belge silinemedi.');
      setShowDeleteDialog(false);
      setSelectedBelgeId(null);
    }
  };

  // Dosya seçildiğinde sadece ilgili slotu güncelle
  const handleFileChange = async (slotIdx, file) => {
    if (!file) return;
    setLoading(true);
    let belge = belgeler[slotIdx];
    // Eğer slotun id'si yoksa, önce kaydet ve slotları güncelle
    if (!belge || !belge.id) {
      try {
        // Evrakı kaydet
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        for (let i = 0; i < Number(form.evrak_eki); i++) {
          if (files[i]) formData.append('belgeler', files[i]);
        }
        await axios.put(`${API_URL}/giden-evrak/${evrakId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // Güncel belge slotlarını çek
        const res = await axios.get(`${API_URL}/giden-evrak/${evrakId}`);
        setBelgeler(res.data.belgeler || []);
        belge = res.data.belgeler[slotIdx];
        if (!belge || !belge.id) {
          setLoading(false);
          alert('Belge slotu oluşturulamadı. Lütfen tekrar deneyin.');
          return;
        }
      } catch (err) {
        setLoading(false);
        alert('Belge slotu oluşturulamadı.');
        return;
      }
    }
    // Şimdi dosyayı yükle
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.put(`${API_URL}/giden-evrak/${evrakId}/belge/${belge.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await axios.get(`${API_URL}/giden-evrak/${evrakId}`);
      setBelgeler(res.data.belgeler || []);
      setFiles(f => {
        const arr = [...f];
        arr[slotIdx] = null;
        return arr;
      });
    } catch {
      alert('Belge güncellenemedi.');
    }
    setLoading(false);
  };

  // Kaydet: tüm slotları backend'e gönder
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      for (let i = 0; i < Number(form.evrak_eki); i++) {
        if (files[i]) formData.append('belgeler', files[i]);
        // Dosya yoksa hiçbir şey ekleme!
      }
      await axios.put(`${API_URL}/giden-evrak/${evrakId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setInitialForm(form);
      setFiles(Array(Number(form.evrak_eki)).fill(null));
      const res = await axios.get(`${API_URL}/giden-evrak/${evrakId}`);
      setBelgeler(res.data.belgeler || []);
      if (onSuccess) onSuccess();
      setLoading(false);
    } catch (err) {
      setError('Güncelleme sırasında hata oluştu.');
      setLoading(false);
    }
  };

  const isChanged = initialForm && form && Object.keys(form).some(key => String(form[key]) !== String(initialForm[key]));

  const handleBack = () => {
    if (isChanged) {
      setShowUnsavedDialog(true);
    } else {
      navigate(`/evrak/giden/detay/${evrakId}`);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!form) return null;

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 4, boxShadow: 3, p: { xs: 1, sm: 2 } }}>
      <Paper elevation={6} sx={{ borderRadius: 4, maxWidth: 700, mx: 'auto', my: 2, p: { xs: 2, sm: 4 }, position: 'relative' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight={700} color="primary.main">Giden Evrak Düzenle</Typography>
          <Chip label={`ID: ${evrakId}`} color="info" size="small" />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <form autoComplete="off" onSubmit={handleSave}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Sıra No" name="sira_no" type="number" value={form.sira_no} onChange={handleChange} required fullWidth size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Nereye" name="nereye" value={form.nereye} onChange={handleChange} required fullWidth size="small" variant="outlined" />
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
              <TextField label="Eki (Dosya Sayısı)" name="evrak_eki" type="number" min="1" value={form.evrak_eki} onChange={handleChange} required fullWidth size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <TextField
                label="Özeti"
                name="evrak_ozet"
                value={form.evrak_ozet}
                onChange={handleChange}
                required
                fullWidth
                size="medium"
                variant="outlined"
                multiline
                minRows={3}
                maxRows={6}
                sx={{ fontSize: 18, width: '100%' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Ekler</Typography>
              <Grid container spacing={2}>
                {Array.from({ length: Number(form.evrak_eki) }).map((_, idx) => {
                  const belge = belgeler[idx] || {};
                  const url = belge.belge_yolu ? `${API_URL}/${belge.belge_yolu.replace(/\\/g, '/')}` : '';
                  return (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      {belge.belge_yolu && belge.belge_adi ? (
                        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit', flex: 1 }}>
                              <Typography variant="body2" noWrap>{belge.belge_adi}</Typography>
                            </a>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDeleteBelge(idx)}
                              sx={{ ml: 'auto' }}
                            >
                              Sil
                            </Button>
                            <Button
                              variant="outlined"
                              component="label"
                              color="primary"
                              size="small"
                              sx={{ ml: 1 }}
                            >
                              Değiştir
                              <input
                                type="file"
                                accept=".pdf,.xlsx,.jpeg,.jpg,.png,.docx,.doc"
                                hidden
                                onChange={e => handleFileChange(idx, e.target.files[0])}
                              />
                            </Button>
                          </Box>
                        </Card>
                      ) : (
                        <Button
                          variant="contained"
                          component="label"
                          color="primary"
                          sx={{ mt: 1, width: '100%' }}
                        >
                          Ekle
                          <input
                            type="file"
                            accept=".pdf,.xlsx,.jpeg,.jpg,.png,.docx,.doc"
                            hidden
                            onChange={e => handleFileChange(idx, e.target.files[0])}
                          />
                        </Button>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
            {error && (
              <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>
            )}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 4 }}>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleBack}
                sx={{ minWidth: 140, borderRadius: 2, fontWeight: 600 }}
              >
                Geri Dön
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !isChanged}
                sx={{ minWidth: 140, borderRadius: 2, fontWeight: 600 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Değişiklikleri Kaydet'}
              </Button>
            </Grid>
          </Grid>
        </form>
        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
          <DialogTitle>Belgeyi silmek istediğinize emin misiniz?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)} color="primary">Vazgeç</Button>
            <Button onClick={confirmDeleteBelge} color="error" variant="contained">Sil</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={showUnsavedDialog} onClose={() => setShowUnsavedDialog(false)}>
          <DialogTitle>Kaydedilmemiş değişiklikler var. Yine de çıkmak istiyor musunuz?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setShowUnsavedDialog(false)} color="primary">Vazgeç</Button>
            <Button onClick={() => { setShowUnsavedDialog(false); navigate(`/evrak/giden/detay/${evrakId}`); }} color="error" variant="contained">Evet, Çık</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
} 