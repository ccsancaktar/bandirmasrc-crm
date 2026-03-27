import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const initialState = {
  kurs_durumu: '',
  aday_ismi: '',
  tel_no: '',
  tel_yakin: '',
  tc_kimlik: '',
  ogrenim_belgesi: 0,
  adres_belgesi: 0,
  adli_sicil: 0,
  ehliyet: 0,
  kimlik_belgesi: 0,
  fotograf: 0,
  basvuru_formu: 0,
  e_src_kaydi: 0,
  sinav_ucreti_dahil: 0,
  alacagi_egitim: '',
  devam_egitimi: '',
  odeme_durumu: '', // Bu alan formda gösterilmeyecek, API'ye ödenecek tutar olarak gönderilecek
  tutar: '',
  tarih_1: '',
  odeme_1: '',
  tarih_2: '',
  odeme_2: '',
  tarih_3: '',
  odeme_3: '',
  tarih_4: '',
  odeme_4: '',
  tarih_5: '',
  odeme_5: '',
  tarih_6: '',
  odeme_6: '',
  kalan: '',
  aciklama: '',
  evrak_kayit_tarihi: '',
  inaktif: 0,
  ogrenim_tarih: '',
  adres_tarih: '',
  sicil_tarih: '',
  ehliyet_tarih: '',
  kimlik_tarih: '',
  foto_tarih: '',
  basvuru_tarih: '',
  src_tarih: '',
};

const formStyle = {
  maxWidth: 600,
  margin: '32px auto',
  padding: 32,
  border: 'none',
  borderRadius: 14,
  background: '#fafbfc',
  boxShadow: '0 4px 16px #0002',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  fontWeight: 500,
  gap: 4,
  fontSize: 16,
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontWeight: 500,
  fontSize: 15,
};

const inputStyle = {
  padding: '8px 12px',
  border: '1px solid #bbb',
  borderRadius: 6,
  fontSize: 15,
  background: '#fff',
  transition: 'border 0.2s',
};

const buttonStyle = {
  marginTop: 18,
  padding: '12px 0',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: 18,
  cursor: 'pointer',
  boxShadow: '0 2px 8px #1976d233',
  letterSpacing: 1,
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: 28,
  color: '#1976d2',
  fontWeight: 800,
  letterSpacing: 1,
  fontSize: 28,
};

const egitimOptions = ["SRC1", "SRC2", "SRC3", "SRC4"];
const kursDurumuOptions = ["Beklemede", "Katiliyor", "Fark", "Özel Durum", "Firma"];

const evrakFields = [
  { key: 'ogrenim_belgesi', label: 'Öğrenim Belgesi', dateKey: 'ogrenim_tarih', dateLabel: 'Tarihi' },
  { key: 'adres_belgesi', label: 'Adres Belgesi', dateKey: 'adres_tarih', dateLabel: 'Tarihi' },
  { key: 'adli_sicil', label: 'Adli Sicil', dateKey: 'sicil_tarih', dateLabel: 'Tarihi' },
  { key: 'ehliyet', label: 'Ehliyet', dateKey: 'ehliyet_tarih', dateLabel: 'Tarihi' },
  { key: 'kimlik_belgesi', label: 'Kimlik Belgesi', dateKey: 'kimlik_tarih', dateLabel: 'Tarihi' },
  { key: 'fotograf', label: 'Fotoğraf', dateKey: 'foto_tarih', dateLabel: 'Tarihi' },
  { key: 'basvuru_formu', label: 'Başvuru Formu', dateKey: 'basvuru_tarih', dateLabel: 'Tarihi' },
  { key: 'e_src_kaydi', label: 'E-SRC Kaydı', dateKey: 'src_tarih', dateLabel: 'Tarihi' },
];

const sinavUcretiField = { key: 'sinav_ucreti_dahil', label: 'Sınav Ücreti Dahil' };

const odemeFields = [
  { odeme: "odeme_1", tarih: "tarih_1", label: "Ödeme 1" },
  { odeme: "odeme_2", tarih: "tarih_2", label: "Ödeme 2" },
  { odeme: "odeme_3", tarih: "tarih_3", label: "Ödeme 3" },
  { odeme: "odeme_4", tarih: "tarih_4", label: "Ödeme 4" },
  { odeme: "odeme_5", tarih: "tarih_5", label: "Ödeme 5" },
  { odeme: "odeme_6", tarih: "tarih_6", label: "Ödeme 6" },
];

const KursiyerEkle = () => {
  const [form, setForm] = useState(initialState);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [evrakError, setEvrakError] = useState({});
  const [odemeError, setOdemeError] = useState({});
  // Ödeme alanı görünürlüğü için state
  const [visiblePayments, setVisiblePayments] = useState(1);
  // Excel yükleme için state
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelResult, setExcelResult] = useState(null);

  // Otomatik kalan hesaplama
  const calculateKalan = (formData) => {
    const odemeFields = [
      "odeme_1", "odeme_2", "odeme_3", "odeme_4", "odeme_5", "odeme_6"
    ];
    const toplamOdeme = odemeFields.reduce(
      (sum, key) => sum + (parseFloat(formData[key]) || 0), 0
    );
    const tutar = parseFloat(formData.tutar) || 0;
    return (tutar - toplamOdeme).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    let updatedForm;
    if (
      [
        'ogrenim_belgesi',
        'adres_belgesi',
        'adli_sicil',
        'ehliyet',
        'kimlik_belgesi',
        'fotograf',
        'basvuru_formu',
        'e_src_kaydi',
        'sinav_ucreti_dahil',
        'inaktif',
      ].includes(name)
    ) {
      updatedForm = { ...form, [name]: checked ? 1 : 0 };
      // Eğer checkbox kapatıldıysa ilgili tarih alanını temizle
      const evrak = evrakFields.find(f => f.key === name);
      if (evrak && !checked) {
        updatedForm[evrak.dateKey] = '';
      }
    } else {
      updatedForm = { ...form, [name]: value };
    }

    // Kalan otomatik güncelle
    if (
      ["tutar", "odeme_1", "odeme_2", "odeme_3", "odeme_4", "odeme_5", "odeme_6"].includes(name)
    ) {
      updatedForm.kalan = calculateKalan(updatedForm);
    }
    setForm(updatedForm);

    // Evrak tarih zorunluluğu için hata temizle
    if (evrakFields.some(f => f.dateKey === name || f.key === name)) {
      setEvrakError(prev => ({ ...prev, [name]: false }));
    }
    // Ödeme tarih zorunluluğu için hata temizle
    if (odemeFields.some(f => f.odeme === name || f.tarih === name)) {
      setOdemeError(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Evraklar için validasyon: işaretli ise tarih zorunlu
    let hasError = false;
    let newEvrakError = {};
    evrakFields.forEach(field => {
      if (form[field.key]) {
        if (!form[field.dateKey]) {
          hasError = true;
          newEvrakError[field.dateKey] = true;
        }
      }
    });
    setEvrakError(newEvrakError);

    // Ödeme için validasyon: ödeme girildiyse tarih zorunlu
    let newOdemeError = {};
    odemeFields.forEach(f => {
      if (form[f.odeme] && !form[f.tarih]) {
        hasError = true;
        newOdemeError[f.tarih] = true;
      }
    });
    setOdemeError(newOdemeError);

    if (hasError) {
      alert('Lütfen işaretli evraklar ve girilen ödemeler için tarih seçiniz.');
      return;
    }

    setLoading(true);
    const dataToSend = { ...form, odeme_durumu: form.tutar };
    try {
      const token = localStorage.getItem('token');
      // API URL güvenli şekilde oluşturuluyor
      let apiUrl = '/kursiyer/ekle';
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/kursiyer/ekle';
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(dataToSend),
      });

      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        // Sunucu JSON dışında bir şey döndürdü
        const text = await res.text();
        console.error('Sunucu beklenmeyen bir yanıt verdi:', text);
        // Sunucu HTML döndüyse, hata mesajını daha kullanıcı dostu yap
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Sunucu ile bağlantı kurulamadı veya oturumunuz sona ermiş olabilir. Lütfen tekrar giriş yapın.');
        }
        throw new Error('Sunucu beklenmeyen bir yanıt verdi. (İçerik tipi: ' + contentType + ')');
      }

      if (!res.ok) {
        console.error('Kursiyer ekleme başarısız:', result);
        throw new Error(result.detail || 'Kayıt başarısız');
      }
      console.log('Kursiyer başarıyla eklendi:', result);
      alert('Başarı ile kayıt edildi!');
      // --- Değiştirildi: Sadece id ile yönlendir ---
      if (result.id) {
        navigate(`/kursiyer/${result.id}`);
      } else {
        alert('Kursiyer eklendi fakat id alınamadı.');
        navigate('/dashboard');
      }
      // --- SON ---
    } catch (err) {
      console.error('Kursiyer ekleme hatası:', err);
      alert(err.message || 'Kayıt sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Otomatik ödeme alanı azaltma (2 ve sonrası boşsa)
  React.useEffect(() => {
    // Sadece ödeme 2 ve sonrası için kontrol et
    let lastFilled = 0;
    for (let i = 0; i < odemeFields.length; i++) {
      if (form[odemeFields[i].odeme] && form[odemeFields[i].odeme] !== '') {
        lastFilled = i + 1;
      }
    }
    // En az 1 alan açık kalmalı
    const newVisible = Math.max(1, lastFilled + 1);
    if (newVisible < visiblePayments) {
      setVisiblePayments(newVisible);
    }
    // eslint-disable-next-line
  }, [form.odeme_2, form.odeme_3, form.odeme_4, form.odeme_5, form.odeme_6]);

  useEffect(() => {
    // Kullanıcı rolünü kontrol et
    const token = localStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
    fetch(`${apiUrl}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.role !== 'admin') {
          setUserRole('user');
          setTimeout(() => {
            navigate('/');
          }, 1200);
        } else {
          setUserRole('admin');
        }
      })
      .catch(() => {
        setUserRole('user');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      });
  }, [navigate]);

  // Excel dosyası yükleme handler
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelLoading(true);
    setExcelResult(null);
    try {
      const token = localStorage.getItem('token');
      let apiUrl = '/yedek/kursiyer-yukle';
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/yedek/kursiyer-yukle';
      }
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const result = await res.json();
      setExcelResult(result);
      if (res.ok) {
        alert(`Yükleme tamamlandı. Eklenen satır: ${result.imported}`);
      } else {
        alert('Yükleme sırasında hata oluştu.');
      }
    } catch (err) {
      setExcelResult({ errors: [err.message || 'Yükleme hatası'] });
      alert('Yükleme sırasında hata oluştu.');
    } finally {
      setExcelLoading(false);
      // Dosya inputunu sıfırla
      e.target.value = '';
    }
  };

  if (userRole === 'user') {
    return <div style={{color:"red",margin:"32px"}}>Bu sayfaya yetkiniz yok. Ana sayfaya yönlendiriliyorsunuz...</div>;
  }
  if (userRole === null) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      {/* Excel yükleme alanı */}
      <div style={{
        maxWidth: 600,
        margin: '32px auto 0',
        padding: 18,
        border: '1px solid #e3e8ee',
        borderRadius: 10,
        background: '#f5fafd',
        boxShadow: '0 2px 8px #0001',
        marginBottom: 24
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#1976d2' }}>
          Excel ile Toplu Kursiyer Yükle
        </div>
        <input
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleExcelUpload}
          disabled={excelLoading}
          style={{ marginBottom: 8 }}
        />
        {excelLoading && <div style={{ color: '#1976d2', fontWeight: 500 }}>Yükleniyor...</div>}
        {excelResult && (
          <div style={{ marginTop: 8 }}>
            <div>
              <b>Eklenen satır:</b> {excelResult.imported || 0}
            </div>
            {excelResult.errors && excelResult.errors.length > 0 && (
              <div style={{ color: 'red', marginTop: 6 }}>
                <b>Hatalar:</b>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {excelResult.errors.map((err, i) => (
                    <li key={i} style={{ fontSize: 14 }}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
          <b>Not:</b> Excel sütun başlıkları <u>kursiyer</u> tablosu ile aynı olmalıdır.<br />
          <span style={{ color: '#888' }}>
            Eksik olan tarih alanları (ogrenim_tarih, adres_tarih, sicil_tarih, ehliyet_tarih, kimlik_tarih, foto_tarih, basvuru_tarih, src_tarih) boş bırakılabilir.
          </span>
        </div>
      </div>
      <h2 style={titleStyle}>Kursiyer Ekle</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Move Kurs Durumu above Aday İsmi */}
        <label style={labelStyle}>
          Kurs Durumu:
          <select
            name="kurs_durumu"
            value={form.kurs_durumu}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Seçiniz</option>
            {kursDurumuOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Aday İsmi:
          <input name="aday_ismi" value={form.aday_ismi} onChange={handleChange} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Telefon No:
          <input name="tel_no" value={form.tel_no} onChange={handleChange} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Yakın Telefon No:
          <input name="tel_yakin" value={form.tel_yakin} onChange={handleChange} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          TC Kimlik:
          <input name="tc_kimlik" value={form.tc_kimlik} onChange={handleChange} style={inputStyle} required />
          {/* TC Kimlik boşsa uyarı göster */}
          {(!form.tc_kimlik || form.tc_kimlik.trim() === '') && (
            <span style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
              TC Kimlik alanı zorunludur.
            </span>
          )}
        </label>
        {/* Evraklar ve tarihleri aynı satırda */}
        {evrakFields.map(field => (
          <div key={field.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              background: '#fafdff',
              borderRadius: 8,
              padding: '10px 8px',
              marginBottom: 2,
              border: '1px solid #e3e8ee',
              boxShadow: '0 1px 4px #0001',
              justifyContent: 'space-between'
            }}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                name={field.key}
                checked={!!form[field.key]}
                onChange={handleChange}
                style={{
                  accentColor: '#1976d2',
                  width: 18,
                  height: 18
                }}
              />
              <span style={{
                color: !!form[field.key] ? '#1976d2' : '#888'
              }}>{field.label}</span>
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 400,
              marginLeft: 'auto',
              justifyContent: 'flex-end'
            }}>
              {/* "Tarih gerekli" solunda göster */}
              {!form[field.dateKey] && form[field.key] ? (
                <span style={{ color: 'red', fontSize: 13 }}>Tarih gerekli</span>
              ) : null}
              <input
                type="date"
                name={field.dateKey}
                value={form[field.dateKey]}
                onChange={handleChange}
                disabled={!form[field.key]}
                style={{
                  ...inputStyle,
                  minWidth: 140,
                  maxWidth: 180,
                  borderColor: evrakError[field.dateKey] ? 'red' : '#bbb',
                  background: !form[field.key] ? '#f5f5f5' : '#fff',
                  textAlign: 'right'
                }}
                required={!!form[field.key]}
              />
            </label>
          </div>
        ))}
        {/* Sınav Ücreti Dahil Checkbox */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: '#fafdff',
          borderRadius: 8,
          padding: '10px 8px',
          marginBottom: 2,
          border: '1px solid #e3e8ee',
          boxShadow: '0 1px 4px #0001',
          justifyContent: 'space-between'
        }}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              name={sinavUcretiField.key}
              checked={!!form[sinavUcretiField.key]}
              onChange={handleChange}
              style={{
                accentColor: '#1976d2',
                width: 18,
                height: 18
              }}
            />
            <span style={{
              color: !!form[sinavUcretiField.key] ? '#1976d2' : '#888'
            }}>{sinavUcretiField.label}</span>
          </label>
        </div>
        <label style={labelStyle}>
          Alacağı Eğitim:
          <select
            name="alacagi_egitim"
            value={form.alacagi_egitim}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Seçiniz</option>
            {egitimOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Devam Eğitimi:
          <select
            name="devam_egitimi"
            value={form.devam_egitimi}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Seçiniz</option>
            {egitimOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Ödenecek Tutar:
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="number"
              name="tutar"
              value={form.tutar}
              onChange={handleChange}
              style={{ ...inputStyle, paddingRight: 32, width: '100%' }}
              placeholder="Fiyat"
            />
            <span style={{
              position: 'absolute',
              right: 10,
              color: '#888',
              fontWeight: 600,
              pointerEvents: 'none'
            }}>₺</span>
          </div>
        </label>
        {/* Ödeme ve tarihleri aynı satırda */}
        {odemeFields.slice(0, visiblePayments).map((f, idx) => (
          <div key={f.odeme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              background: '#fafdff',
              borderRadius: 8,
              padding: '10px 8px',
              marginBottom: 2,
              border: '1px solid #e3e8ee',
              boxShadow: '0 1px 4px #0001',
              justifyContent: 'space-between'
            }}>
            <label style={{ ...labelStyle, flex: 1, margin: 0 }}>
              {f.label}:
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  name={f.odeme}
                  value={form[f.odeme]}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingRight: 32, width: '100%' }}
                  placeholder="Tutar"
                />
                <span style={{
                  position: 'absolute',
                  right: 10,
                  color: '#888',
                  fontWeight: 600,
                  pointerEvents: 'none'
                }}>₺</span>
              </div>
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 400,
              flex: 1,
              margin: 0,
              marginLeft: 'auto',
              justifyContent: 'flex-end'
            }}>
              {/* "Tarih gerekli" solunda göster */}
              {!form[f.tarih] && form[f.odeme] ? (
                <span style={{ color: 'red', fontSize: 13 }}>Tarih gerekli</span>
              ) : null}
              <input
                type="date"
                name={f.tarih}
                value={form[f.tarih]}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  minWidth: 140,
                  maxWidth: 180,
                  borderColor: odemeError[f.tarih] ? 'red' : '#bbb',
                  background: !form[f.odeme] ? '#f5f5f5' : '#fff',
                  textAlign: 'right'
                }}
                disabled={!form[f.odeme]}
                required={!!form[f.odeme]}
              />
            </label>
            {/* Eksi butonu: sadece ödeme 2 ve sonrası için */}
            {idx > 0 && (
              <button
                type="button"
                onClick={() => {
                  // Ödeme 2 ve sonrası silindiğinde, ilgili alanları temizle ve görünürlüğü azalt
                  const newForm = { ...form };
                  for (let i = idx; i < odemeFields.length; i++) {
                    newForm[odemeFields[i].odeme] = '';
                    newForm[odemeFields[i].tarih] = '';
                  }
                  setForm(newForm);
                  setVisiblePayments(idx);
                }}
                style={{
                  marginLeft: 10,
                  background: 'none',
                  border: 'none',
                  color: '#e53935',
                  fontSize: 26,
                  fontWeight: 700,
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  height: 32,
                  width: 32,
                  justifyContent: 'center'
                }}
                title="Bu ödemeyi kaldır"
              >−</button>
            )}
          </div>
        ))}
        {/* Ödeme ekle butonu */}
        {visiblePayments < odemeFields.length && (
          <button
            type="button"
            style={{
              ...buttonStyle,
              background: '#43a047',
              marginTop: 0,
              fontSize: 16,
              padding: '8px 0',
              boxShadow: '0 1px 4px #43a04733'
            }}
            onClick={() => setVisiblePayments(v => v + 1)}
          >
            Ödeme ekle
          </button>
        )}
        <label style={labelStyle}>
          Kalan:
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="number"
              name="kalan"
              value={form.kalan}
              readOnly
              style={{ ...inputStyle, background: '#f5f5f5', paddingRight: 32, width: '100%' }}
            />
            <span style={{
              position: 'absolute',
              right: 10,
              color: '#888',
              fontWeight: 600,
              pointerEvents: 'none'
            }}>₺</span>
          </div>
        </label>
        <label style={labelStyle}>
          Açıklama:
          <textarea
            name="aciklama"
            value={form.aciklama}
            onChange={handleChange}
            style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
          />
        </label>
        <label style={labelStyle}>
          Evrak Kayıt Tarihi:
          <input type="date" name="evrak_kayit_tarihi" value={form.evrak_kayit_tarihi} onChange={handleChange} style={inputStyle} />
        </label>
        {/* <label style={checkboxLabelStyle}>
          <input type="checkbox" name="inaktif" checked={form.inaktif === 1 || form.inaktif === '1' || form.inaktif === true} onChange={handleChange} />
          İnaktif
        </label> */}
        <button type="submit" style={buttonStyle} disabled={loading || !form.tc_kimlik || form.tc_kimlik.trim() === ''}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default KursiyerEkle;