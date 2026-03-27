import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Grid, TextField, Typography, Paper, Alert, CircularProgress, Card, Divider, Chip, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Gelen_Evrak_Duzenle({ evrakId, onSuccess, onCancel }) {
  const [form, setForm] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [belgeler, setBelgeler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBelgeId, setSelectedBelgeId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';

  // Tarih formatını input için uygun hale getirir
  function toInputDate(str) {
    if (!str) return '';
    // Eğer zaten YYYY-MM-DD ise direkt döndür
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    // Eğer YYYY-MM-DD HH:mm:ss ise
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    // Eğer DD.MM.YYYY ise
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) {
      const [d, m, y] = str.split('.');
      return `${y}-${m}-${d}`;
    }
    // Diğer durumlar için boş döndür
    return '';
  }

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/gelen-evrak/${evrakId}`)
      .then(res => {
        const f = {
          sira_no: res.data.sira_no,
          kimden: res.data.kimden,
          evrak_tarih: toInputDate(res.data.evrak_tarih),
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

  // Evrak sayısı değiştiğinde belge alanlarını güncelle
  useEffect(() => {
    if (!form) return;
    if (Number(form.evrak_eki) > belgeler.length) {
      setBelgeler(prev => {
        const diff = Number(form.evrak_eki) - prev.length;
        if (diff > 0) {
          return [...prev, ...Array(diff).fill({})];
        }
        return prev;
      });
    } else if (Number(form.evrak_eki) < belgeler.length) {
      setBelgeler(prev => prev.slice(0, Number(form.evrak_eki)));
    }
  }, [form, belgeler.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteBelge = async (belgeId) => {
    setSelectedBelgeId(belgeId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBelge = async () => {
    try {
      await axios.delete(`${API_URL}/gelen-evrak/${evrakId}/belge/${selectedBelgeId}`);
      setBelgeler((prev) => prev.filter((b) => b.id !== selectedBelgeId));
      setShowDeleteDialog(false);
      setSelectedBelgeId(null);
    } catch {
      alert('Belge silinemedi.');
      setShowDeleteDialog(false);
      setSelectedBelgeId(null);
    }
  };

  const handleFileChange = async (belgeId, file) => {
    if (!file) return;
    setLoading(true);
    let belge = belgeler.find(b => b.id === belgeId);
    // Eğer slotun id'si yoksa, önce kaydet ve slotları güncelle
    if (!belge || !belge.id) {
      try {
        // Evrakı kaydet
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        await axios.put(`${API_URL}/gelen-evrak/${evrakId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // Güncel belge slotlarını çek
        const res = await axios.get(`${API_URL}/gelen-evrak/${evrakId}`);
        setBelgeler(res.data.belgeler || []);
        belge = res.data.belgeler.find((b, idx) => !b.belge_yolu && !b.belge_adi) || res.data.belgeler[0];
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
      await axios.put(`${API_URL}/gelen-evrak/${evrakId}/belge/${belge.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await axios.get(`${API_URL}/gelen-evrak/${evrakId}`);
      setBelgeler(res.data.belgeler || []);
    } catch {
      alert('Belge güncellenemedi.');
    }
    setLoading(false);
  };

  const handleAddBelge = async (file) => {
    if (!file) return;
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append('belgeler', file);
    try {
      await axios.put(`${API_URL}/gelen-evrak/${evrakId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await axios.get(`${API_URL}/gelen-evrak/${evrakId}`);
      setBelgeler(res.data.belgeler || []);
    } catch {
      alert('Belge eklenemedi.');
    }
  };

  const isChanged = initialForm && form && Object.keys(form).some(key => String(form[key]) !== String(initialForm[key]));

  const handleBack = () => {
    if (isChanged) {
      setShowUnsavedDialog(true);
    } else {
      navigate(`/evrak/detay/${evrakId}`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      await axios.put(`${API_URL}/gelen-evrak/${evrakId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setInitialForm(form);
      if (onSuccess) onSuccess();
      setLoading(false);
    } catch (err) {
      setError('Güncelleme sırasında hata oluştu.');
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!form) return null;

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 4, boxShadow: 3, p: { xs: 1, sm: 2 } }}>
      <Paper elevation={6} sx={{ borderRadius: 4, maxWidth: 700, mx: 'auto', my: 2, p: { xs: 2, sm: 4 }, position: 'relative' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight={700} color="primary.main">Gelen Evrak Düzenle</Typography>
          <Chip label={`ID: ${evrakId}`} color="info" size="small" />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <form autoComplete="off" onSubmit={handleSave}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Sıra No" name="sira_no" type="number" value={form.sira_no} onChange={handleChange} required fullWidth size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Kimden" name="kimden" value={form.kimden} onChange={handleChange} required fullWidth size="small" variant="outlined" />
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
                {belgeler.length === 0 && (
                  <Grid item xs={12}>
                    <Typography color="error">Belge yok veya geçersiz</Typography>
                    <Button
                      variant="contained"
                      component="label"
                      color="primary"
                      sx={{ mt: 1 }}
                    >
                      Ekle
                      <input
                        type="file"
                        accept=".pdf,.xlsx,.jpeg,.jpg,.png,.docx,.doc"
                        hidden
                        onChange={e => handleAddBelge(e.target.files[0])}
                      />
                    </Button>
                  </Grid>
                )}
                {belgeler.map((belge, idx) => {
                  if (!belge.belge_yolu || !belge.belge_adi) {
                    return (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Typography color="error">Belge yok veya geçersiz</Typography>
                        <Button
                          variant="contained"
                          component="label"
                          color="primary"
                          sx={{ mt: 1 }}
                        >
                          Ekle
                          <input
                            type="file"
                            accept=".pdf,.xlsx,.jpeg,.jpg,.png,.docx,.doc"
                            hidden
                            onChange={e => handleFileChange(belge.id, e.target.files[0])}
                          />
                        </Button>
                      </Grid>
                    );
                  }
                  const url = `${API_URL}/${belge.belge_yolu.replace(/\\/g, '/')}`;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={belge.id}>
                      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                          <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit', flex: 1 }}>
                            <Typography variant="body2" noWrap>{belge.belge_adi}</Typography>
                          </a>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteBelge(belge.id)}
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
                              onChange={e => handleFileChange(belge.id, e.target.files[0])}
                            />
                          </Button>
                        </Box>
                      </Card>
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
            <Button onClick={() => { setShowUnsavedDialog(false); navigate(`/evrak/gelen/detay/${evrakId}`); }} color="error" variant="contained">Evet, Çık</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
} 