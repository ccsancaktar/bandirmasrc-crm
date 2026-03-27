import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Kullanicilar = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    fetch(`${apiUrl}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data);
        if (data.role !== 'admin') {
          navigate('/');
        }
      });
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    fetch(`${apiUrl}/kullanici/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Kullanıcılar alınamadı');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Kullanıcılar alınamadı');
        setLoading(false);
      });
  }, [token]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    const res = await fetch(`${apiUrl}/kullanici/${userId}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert('Kullanıcı silinemedi.');
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Yükleniyor...</div>;
  if (error) return <div style={{ padding: 32 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Kullanıcılar</h2>
        <button
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '6px 16px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 16,
          }}
          onClick={() => navigate('/kullanici-ekle')}
        >
          Kullanıcı Ekle
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f7fafc' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Kullanıcı Adı</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Rol</th>
            <th style={{ textAlign: 'left', padding: 8 }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{u.username}</td>
              <td style={{ padding: 8 }}>{u.role}</td>
              <td style={{ padding: 8 }}>
                <button
                  style={{
                    background: '#e53e3e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => handleDelete(u.id)}
                  disabled={currentUser && currentUser.id === u.id}
                  title={currentUser && currentUser.id === u.id ? "Kendi hesabınızı silemezsiniz" : ""}
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Kullanicilar;
