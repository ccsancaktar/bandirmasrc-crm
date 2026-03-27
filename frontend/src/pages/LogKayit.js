import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, CircularProgress, Link, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LogKayit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/loglar`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs(res.data);
    } catch (err) {
      setLogs([]);
    }
    setLoading(false);
  };

  const handleAdayClick = async (aday_ismi) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/kursiyer/ara?type=isim&value=${encodeURIComponent(aday_ismi)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const kursiyerler = res.data;
      if (kursiyerler.length > 0) {
        navigate(`/kursiyer/${kursiyerler[0].id}`);
      } else {
        alert('Kursiyer bulunamadı.');
      }
    } catch (err) {
      alert('Kursiyer detayına gidilemedi.');
    }
  };

  const handleLoglariTemizle = async () => {
    if (!window.confirm("Tüm kayitlari silmek istediginize emin misiniz?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/loglar/temizle`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchLogs();
    } catch (err) {
      alert('Loglar silinemedi.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Sistem Log Kayıtları
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleLoglariTemizle}
        >
          Logları Temizle
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>İşlem Yapılan</TableCell>
                <TableCell>Yapılan İşlem</TableCell>
                <TableCell>İşlem Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, idx) => (
                <TableRow key={idx}>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    {log.aday_ismi === "Sistem" ? (
                      <span style={{ fontWeight: 500, color: '#666' }}>{log.aday_ismi}</span>
                    ) : (
                      <Link
                        component="button"
                        underline="hover"
                        color="primary"
                        onClick={() => handleAdayClick(log.aday_ismi)}
                        sx={{ cursor: 'pointer', fontWeight: 500 }}
                      >
                        {log.aday_ismi}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>{log.degisiklik}</TableCell>
                  <TableCell>{log.tarih}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default LogKayit;
