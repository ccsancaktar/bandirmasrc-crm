import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = React.useCallback(async () => {
    try {
      // Call logout endpoint to log the activity
      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
      await axios.post(`${apiUrl}/logout`);
    } catch (error) {
      // Ignore errors during logout
      console.log('Logout endpoint error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // fetchUser fonksiyonunu useEffect'ten önce tanımlayın
  const fetchUser = useCallback(async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
      const response = await axios.get(`${apiUrl}/kullanici/ayarlar`);
      setUser(response.data);
    } catch (error) {
      logout(true); // force redirect to login
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
      // Sadece login sayfasında değilsek yönlendir
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true, state: { from: location } });
      }
    }
    // eslint-disable-next-line
  }, [token]);

  const login = async (username, password) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
      const response = await fetch(`${apiUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });

      if (response.status === 401) {
        return { success: false, message: 'Giriş Başarısız' };
      }

      if (!response.ok) {
        return { success: false, message: 'Giriş Başarısız' };
      }

      const data = await response.json();
      const { access_token } = data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      setLoading(false); // Yönlendirme öncesi loading'i kapat
      navigate('/dashboard', { replace: true });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: 'Giriş Başarısız'
      };
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};