import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography,
  CircularProgress,
  Alert 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Kullanıcı adı ve şifreyi trimle
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    try {
      const result = await login(trimmedUsername, trimmedPassword);
      if (result.success) {
        navigate(from, { replace: true });
        window.location.reload(); // Başarılı girişte sayfayı yenile
      } else {
        setError(result.message || 'Kullanıcı adı veya şifre hatalı ya da kullanıcı bulunamadı.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#1976d2', // Buton rengi ile aynı arka plan
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="xs" sx={{ p: 0 }}>
        <Box sx={{ 
          mt: 0,
          p: 4,
          background: '#fff',
          borderRadius: 3,
          boxShadow: '0 4px 24px #0003',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          minWidth: 320
        }}>
          <Typography component="h1" variant="h5" sx={{ color: '#1976d2', fontWeight: 700, mb: 2 }}>
            Bandırma SRC Kursu
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Kullanıcı Adı"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ background: '#f3f6fa', borderRadius: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Şifre"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ background: '#f3f6fa', borderRadius: 1 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, fontWeight: 600, fontSize: 16, py: 1.2, background: '#1976d2' }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </Box>
        </Box>
      </Container>
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100vw',
          py: 1,
          background: 'transparent',
          textAlign: 'center',
          zIndex: 9999,
          color: '#fff',
          fontWeight: 400,
          letterSpacing: 1,
          fontSize: 15
        }}
      >
        Created by C. Sancak
      </Box>
    </Box>
  );
};

export default Login;