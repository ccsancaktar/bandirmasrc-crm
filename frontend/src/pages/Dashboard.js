import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, CircularProgress, IconButton } from '@mui/material';
import { Home, PersonAdd, Settings, ExitToApp, Group, ListAlt, Assignment, History, Menu as MenuIcon, Assessment, Description } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // --- YENİ: Kullanıcı yüklenene kadar loading göster ---
  const token = localStorage.getItem('token');
  if (token && !user) {
    // Kullanıcı yükleniyor
    return (
      <Box sx={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  // --- SON YENİ ---

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout && logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { text: 'Anasayfa', icon: <Home />, path: '/' },
    // Sadece admin için "Kursiyer Ekle" göster
    ...(user && user.role === 'admin'
      ? [{ text: 'Kursiyer Ekle', icon: <PersonAdd />, path: '/kursiyer-ekle' }]
      : []),
    { text: 'Sınıf Listesi', icon: <ListAlt />, path: '/sinif-listesi' },
    { text: 'Sınav Listesi', icon: <Assignment />, path: '/sinav-listesi' },
    { text: 'Raporlar', icon: <Assessment />, path: '/rapor' },
    { text: 'Evrak Takip', icon: <Description />, path: '/evrak' },
    // Sadece admin için göster
    ...(user && user.role === 'admin'
      ? [
          { text: 'Kullanıcılar', icon: <Group />, path: '/kullanicilar' },
          { text: 'Yedek', icon: <ListAlt />, path: '/yedek' },
          { text: 'Log Kayıtları', icon: <History />, path: '/log-kayit' }
        ]
      : []),
    { text: 'Kullanıcı Ayarları', icon: <Settings />, path: '/ayarlar' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            {/* Menu Button */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen((prev) => !prev)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => {
                navigate('/');
                if (drawerOpen) setDrawerOpen(false);
              }}
            >
              Bandırma SRC Kursu
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* This Toolbar is for spacing below the AppBar */}
        {/* ...main content, no search bar here... */}
        <Outlet />
      </Box>

      {/* Sidebar - Temporary Drawer from top */}
      <Drawer
        anchor="top"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: '100vw',
            boxSizing: 'border-box',
            backgroundColor: '#1976d2',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: '80vh',
          },
        }}
      >
        <div>
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem 
                  button 
                  key={item.text}
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
              <ListItem 
                button 
                onClick={() => {
                  handleLogout();
                  setDrawerOpen(false);
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText primary="Çıkış Yap" />
              </ListItem>
            </List>
          </Box>
        </div>
        {/* İmza en alta */}
        <Box sx={{ textAlign: 'center', py: 2, fontSize: 13, opacity: 0.7 }}>
          Created by C. Sancak
        </Box>
      </Drawer>
    </Box>
  );
};

export default Dashboard;