import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Paper, Typography, Box, Button, Grid, Alert, CircularProgress, Card, CardContent, Divider, Chip } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';

/**
 * Ortak EvrakDetay bileşeni
 * Props:
 *  - evrakId: Detayı gösterilecek evrakın id'si
 *  - type: 'gelen' | 'giden'
 *  - onEdit: (isteğe bağlı) düzenle butonu için callback
 */
export default function EvrakDetay({ evrakId, type, onEdit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';

  // Gelen ve giden için endpoint ve alanlar
  const config = {
    gelen: {
      endpoint: `${API_URL}/gelen-evrak/${evrakId}`,
      title: 'Gelen Evrak Detay',
      firstLabel: 'Kimden',
      firstValue: data?.kimden,
      editPath: `/evrak/gelen/duzenle/${evrakId}`,
      fileFolder: 'gelen',
    },
    giden: {
      endpoint: `${API_URL}/giden-evrak/${evrakId}`,
      title: 'Giden Evrak Detay',
      firstLabel: 'Nereye',
      firstValue: data?.nereye,
      editPath: `/evrak/giden/duzenle/${evrakId}`,
      fileFolder: 'giden',
    },
  };
  const cfg = config[type];

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(cfg.endpoint)
      .then(res => setData(res.data))
      .catch(() => setError('Detaylar alınamadı.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [evrakId, API_URL, type]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: 4, boxShadow: 3, p: { xs: 1, sm: 2 } }}>
      <Paper elevation={6} sx={{ borderRadius: 4, maxWidth: 700, mx: 'auto', my: 2, p: { xs: 2, sm: 4 }, position: 'relative' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight={700} color="primary.main">{cfg.title}</Typography>
          <Chip label={`ID: ${data.id}`} color="info" size="small" />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Sıra No</Typography>
                <Typography variant="h6" fontWeight={600}>{data.sira_no}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">{cfg.firstLabel}</Typography>
                <Typography variant="h6" fontWeight={600}>{cfg.firstValue}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Evrak Tarihi</Typography>
                <Typography variant="h6">{data.evrak_tarih}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Evrak No</Typography>
                <Typography variant="h6">{data.evrak_no}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Cinsi</Typography>
                <Typography variant="h6">{data.evrak_cinsi}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Eki (Dosya Sayısı)</Typography>
                <Typography variant="h6">{data.evrak_eki}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Özeti</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{data.evrak_ozet}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Ekler</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {data.belgeler && data.belgeler.length === 0 && <Typography sx={{ ml: 2 }}>Ek yok</Typography>}
              {data.belgeler && data.belgeler.map((belge) => {
                if (!belge.belge_yolu || !belge.belge_adi) {
                  return (
                    <Box key={belge.id} sx={{ width: 120, height: 150, border: '2px solid #1976d2', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5faff', p: 1, m: 0.5 }}>
                      <Typography color="error" fontSize={13}>Belge yok veya geçersiz</Typography>
                    </Box>
                  );
                }
                const url = `${API_URL}/${belge.belge_yolu.replace(/\\/g, '/')}`;
                const ext = belge.belge_adi.split('.').pop().toLowerCase();
                let preview = null;
                if (["jpg", "jpeg", "png"].includes(ext)) {
                  preview = (
                    <img src={url} alt={belge.belge_adi} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 4, border: '1px solid #bbb', background: '#fff', boxShadow: '0 1px 4px #0001' }} />
                  );
                } else if (ext === "pdf") {
                  preview = <PictureAsPdfIcon color="error" sx={{ fontSize: 48, mt: 1, mb: 1 }} />;
                } else {
                  preview = <InsertDriveFileIcon color="action" sx={{ fontSize: 48, mt: 1, mb: 1 }} />;
                }
                return (
                  <Box key={belge.id} sx={{ width: 120, height: 150, border: '2px solid #1976d2', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: '#f5faff', p: 1, m: 0.5 }}>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ mt: 1, mb: 1 }}>{preview}</Box>
                      <Typography variant="body2" noWrap sx={{ textAlign: 'center', fontSize: 13, mt: 1 }}>
                        {ext === "pdf" ? "PDF Döküman" : 
                         ["jpg", "jpeg", "png"].includes(ext) ? "Resim Dosyası" : 
                         "Döküman"}
                      </Typography>
                    </a>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/evrak')} sx={{ borderRadius: 3, fontWeight: 600, minWidth: 120, mr: 2 }}>Geri Dön</Button>
          <Button variant="contained" onClick={() => onEdit ? onEdit() : navigate(cfg.editPath)} sx={{ borderRadius: 3, fontWeight: 600, minWidth: 120 }}>Düzenle</Button>
        </Box>
      </Paper>
    </Box>
  );
} 