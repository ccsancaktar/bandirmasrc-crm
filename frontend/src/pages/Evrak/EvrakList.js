import React, { useEffect, useState, useCallback } from 'react';
import GelenEvrakEkle from './Gelen/GelenEvrakEkle';
import GidenEvrakEkle from './Giden/GidenEvrakEkle';
import { Box, Button, Paper, Tabs, Tab, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';

// Tarih formatını GG/AA/YYYY olarak düzenleyen yardımcı fonksiyon
const formatTarih = (tarihString) => {
  if (!tarihString) return '';
  
  try {
    const tarih = new Date(tarihString);
    if (isNaN(tarih.getTime())) return tarihString; // Geçersiz tarih ise orijinal string'i döndür
    
    const gun = tarih.getDate().toString().padStart(2, '0');
    const ay = (tarih.getMonth() + 1).toString().padStart(2, '0');
    const yil = tarih.getFullYear();
    
    return `${gun}/${ay}/${yil}`;
  } catch (error) {
    return tarihString; // Hata durumunda orijinal string'i döndür
  }
};

export default function EvrakList() {
  const [tab, setTab] = useState('giden');
  const [gelenEvraklar, setGelenEvraklar] = useState([]);
  const [gidenEvraklar, setGidenEvraklar] = useState([]);
  const [showEkle, setShowEkle] = useState(false);
  // Modal ile ilgili state'ler kaldırıldı
  // const [selectedId, setSelectedId] = useState(null);
  // const [showDetay, setShowDetay] = useState(false);
  // const [showDuzenle, setShowDuzenle] = useState(false);

  const { user } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
  const navigate = useNavigate();

  const fetchGelen = useCallback(() => {
    fetch(`${API_URL}/gelen-evrak`)
      .then(res => res.json())
      .then(setGelenEvraklar);
  }, [API_URL]);

  const fetchGiden = useCallback(() => {
    fetch(`${API_URL}/giden-evrak`)
      .then(res => res.json())
      .then(setGidenEvraklar);
  }, [API_URL]);

  useEffect(() => {
    if (tab === 'gelen') fetchGelen();
    if (tab === 'giden') fetchGiden();
  }, [tab, fetchGelen, fetchGiden]);

  const handleEkleSuccess = () => {
    setShowEkle(false);
    if (tab === 'gelen') fetchGelen();
    if (tab === 'giden') fetchGiden();
  };

  // Tablo satırına tıklanınca detay sayfasına yönlendir
  const handleDetay = (id) => {
    if (tab === 'giden') {
      navigate(`/evrak/giden/detay/${id}`);
    } else {
      navigate(`/evrak/detay/${id}`);
    }
  };

  // handleDuzenle ve handleDuzenleSuccess kaldırıldı

  // Excel indirme fonksiyonu
  const handleExcelDownload = async () => {
    let data = [];
    if (tab === 'giden') {
      data = gidenEvraklar;
    } else {
      data = gelenEvraklar;
    }
    if (!data.length) return;
    // Sadece görünen alanları al
    const exportData = data.map(ev =>
      tab === 'giden'
        ? {
            'Sıra No': ev.sira_no,
            'Nereye': ev.nereye,
            'Evrak Tarihi': formatTarih(ev.evrak_tarih),
            'Evrak No': ev.evrak_no,
            'Cinsi': ev.evrak_cinsi,
            'Eki': ev.evrak_eki,
            'Özeti': ev.evrak_ozet,
          }
        : {
            'Sıra No': ev.sira_no,
            'Kimden': ev.kimden,
            'Evrak Tarihi': formatTarih(ev.evrak_tarih),
            'Evrak No': ev.evrak_no,
            'Cinsi': ev.evrak_cinsi,
            'Eki': ev.evrak_eki,
            'Özeti': ev.evrak_ozet,
          }
    );
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tab === 'giden' ? 'Giden Evrak' : 'Gelen Evrak');
    XLSX.writeFile(wb, tab === 'giden' ? 'giden_evraklar.xlsx' : 'gelen_evraklar.xlsx');
  };

  // Silme işlemi
  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    setDeleteLoading(true);
    try {
      const endpoint = tab === 'giden' ? `/giden-evrak/${deleteDialog.id}` : `/gelen-evrak/${deleteDialog.id}`;
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Silme başarısız');
      setDeleteDialog({ open: false, id: null });
      if (tab === 'giden') fetchGiden();
      else fetchGelen();
    } catch (err) {
      alert('Silme işlemi başarısız: ' + (err.message || ''));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ borderRadius: '12px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>Evrak Takip</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="success" onClick={handleExcelDownload} sx={{ borderRadius: 2, fontWeight: 600 }}>
              {tab === 'giden' ? 'Giden Evrak Excel Al' : 'Gelen Evrak Excel Al'}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowEkle(true)} sx={{ borderRadius: 2, fontWeight: 600 }}>Evrak Ekle</Button>
          </Box>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab value="giden" label="Giden Evrak" />
          <Tab value="gelen" label="Gelen Evrak" />
        </Tabs>
        {tab === 'giden' && (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sıra No</TableCell>
                  <TableCell>Nereye</TableCell>
                  <TableCell>Evrak Tarihi</TableCell>
                  <TableCell>Evrak No</TableCell>
                  <TableCell>Cinsi</TableCell>
                  <TableCell>Eki</TableCell>
                  <TableCell>Özeti</TableCell>
                  {user?.role === 'admin' && <TableCell></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {gidenEvraklar.map(ev => (
                  <TableRow key={ev.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleDetay(ev.id)}>
                    <TableCell>{ev.sira_no}</TableCell>
                    <TableCell>{ev.nereye}</TableCell>
                    <TableCell>{formatTarih(ev.evrak_tarih)}</TableCell>
                    <TableCell>
                      <Link to={`/evrak/giden/detay/${ev.id}`} onClick={e => e.stopPropagation()}>{ev.evrak_no}</Link>
                    </TableCell>
                    <TableCell>{ev.evrak_cinsi}</TableCell>
                    <TableCell>{ev.evrak_eki}</TableCell>
                    <TableCell>{ev.evrak_ozet}</TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        <Button color="error" onClick={e => { e.stopPropagation(); setDeleteDialog({ open: true, id: ev.id }); }}>
                          <DeleteIcon />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === 'gelen' && (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sıra No</TableCell>
                  <TableCell>Kimden</TableCell>
                  <TableCell>Evrak Tarihi</TableCell>
                  <TableCell>Evrak No</TableCell>
                  <TableCell>Cinsi</TableCell>
                  <TableCell>Eki</TableCell>
                  <TableCell>Özeti</TableCell>
                  {user?.role === 'admin' && <TableCell></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {gelenEvraklar.map(ev => (
                  <TableRow key={ev.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleDetay(ev.id)}>
                    <TableCell>{ev.sira_no}</TableCell>
                    <TableCell>{ev.kimden}</TableCell>
                    <TableCell>{formatTarih(ev.evrak_tarih)}</TableCell>
                    <TableCell>
                      <Link to={`/evrak/detay/${ev.id}`} onClick={e => e.stopPropagation()}>{ev.evrak_no}</Link>
                    </TableCell>
                    <TableCell>{ev.evrak_cinsi}</TableCell>
                    <TableCell>{ev.evrak_eki}</TableCell>
                    <TableCell>{ev.evrak_ozet}</TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        <Button color="error" onClick={e => { e.stopPropagation(); setDeleteDialog({ open: true, id: ev.id }); }}>
                          <DeleteIcon />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* Modal for Evrak Ekle */}
      <Dialog open={showEkle} onClose={() => setShowEkle(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{tab === 'giden' ? 'Giden Evrak Ekle' : 'Gelen Evrak Ekle'}</DialogTitle>
        <DialogContent>
          {tab === 'giden' ? (
            <GidenEvrakEkle onSuccess={handleEkleSuccess} />
          ) : (
            <GelenEvrakEkle onSuccess={handleEkleSuccess} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEkle(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      {/* Silme onay dialogu */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Evrak Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu evrağı ve varsa tüm ekli belgeleri kalıcı olarak silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} disabled={deleteLoading}>Vazgeç</Button>
          <Button color="error" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Evrak Detay ve Düzenle modalları kaldırıldı */}
    </Box>
  );
} 