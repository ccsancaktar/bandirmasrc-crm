import React, { useEffect, useState } from 'react';

const styles = {
  container: {
    maxWidth: 400,
    margin: '40px auto',
    padding: 24,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    fontFamily: 'sans-serif',
  },
  header: {
    marginBottom: 16,
    color: '#2d3748',
    borderBottom: '1px solid #eee',
    paddingBottom: 8,
  },
  info: {
    marginBottom: 8,
    color: '#444',
  },
  label: {
    display: 'block',
    marginBottom: 4,
    fontWeight: 500,
    color: '#555',
  },
  input: {
    width: '100%',
    padding: 8,
    marginBottom: 12,
    border: '1px solid #ccc',
    borderRadius: 4,
    fontSize: 15,
  },
  button: {
    background: '#3182ce',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '10px 18px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 15,
    marginTop: 8,
  },
  message: {
    marginTop: 14,
    padding: 10,
    borderRadius: 4,
    background: '#f7fafc',
    color: '#2d3748',
    border: '1px solid #e2e8f0',
    fontSize: 14,
  },
  hr: {
    margin: '18px 0',
    border: 0,
    borderTop: '1px solid #eee',
  }
};

const UserSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    fetch(`${apiUrl}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [token]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password !== password2) {
      setMessage('Parolalar eşleşmiyor.');
      return;
    }
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    const res = await fetch(`${apiUrl}/users/change-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ new_password: password }),
    });
    if (res.ok) {
      setMessage('Parola başarıyla değiştirildi.');
      setPassword('');
      setPassword2('');
    } else {
      const data = await res.json();
      setMessage(data.detail || 'Parola değiştirilemedi.');
    }
  };

  if (loading) return <div style={styles.container}>Yükleniyor...</div>;
  if (!user) return <div style={styles.container}>Kullanıcı bilgileri alınamadı.</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Kullanıcı Ayarları</h2>
      <div style={styles.info}>
        <strong>Kullanıcı Adı:</strong> {user.username}
      </div>
      <div style={styles.info}>
        <strong>Rol:</strong> {user.role}
      </div>
      <hr style={styles.hr} />
      <h3 style={{...styles.header, fontSize: 18, borderBottom: 'none', marginBottom: 10}}>Parola Değiştir</h3>
      <form onSubmit={handlePasswordChange}>
        <div>
          <label style={styles.label}>Yeni Parola:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Yeni Parola (Tekrar):</label>
          <input
            type="password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>Parolayı Değiştir</button>
      </form>
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
};

export default UserSettings;
