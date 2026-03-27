import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KullaniciEkle = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcı rolünü kontrol et
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    fetch(`${apiUrl}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.role !== 'admin') {
          setIsAdmin(false);
          setTimeout(() => {
            navigate('/');
          }, 1200);
        } else {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        setIsAdmin(false);
        setTimeout(() => {
          navigate('/');
        }, 1200);
      });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin === false) {
      setMessage("Bu işlemi yapmaya yetkiniz yok.");
      return;
    }
    setMessage('');
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    const res = await fetch(`${apiUrl}/kullanici/ekle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Kullanıcı başarıyla eklendi.');
      setUsername('');
      setPassword('');
      setRole('user');
    } else {
      setMessage(data.detail || 'Kullanıcı eklenemedi.');
    }
  };

  if (isAdmin === false) return <div style={{color:"red",margin:"32px"}}>Bu sayfaya yetkiniz yok. Ana sayfaya yönlendiriliyorsunuz...</div>;
  if (isAdmin === null) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>Kullanıcı Ekle</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kullanıcı Adı:</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Şifre:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Rol:</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Ekle</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

export default KullaniciEkle;