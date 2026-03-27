import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const fieldLabels = {
  aday_ismi: 'Ad Soyad',
  tel_no: 'Telefon',
  tel_yakin: 'Yakın Telefon',
  tc_kimlik: 'TC Kimlik',
  kurs_durumu: 'Kurs Durumu',
  alacagi_egitim: 'Alacağı Eğitim',
  devam_egitimi: 'Devam Eğitimi',
  ogrenim_belgesi: 'Öğrenim Belgesi',
  adres_belgesi: 'Adres Belgesi',
  adli_sicil: 'Adli Sicil',
  ehliyet: 'Ehliyet',
  kimlik_belgesi: 'Kimlik Belgesi',
  fotograf: 'Fotoğraf',
  basvuru_formu: 'Başvuru Formu',
  e_src_kaydi: 'E-SRC Kaydı',
  tutar: 'Tutar',
  odeme_durumu: 'Ödeme Durumu',
  tarih_1: 'Tarih 1',
  odeme_1: 'Ödeme 1',
  tarih_2: 'Tarih 2',
  odeme_2: 'Ödeme 2',
  tarih_3: 'Tarih 3',
  odeme_3: 'Ödeme 3',
  tarih_4: 'Tarih 4',
  odeme_4: 'Ödeme 4',
  tarih_5: 'Tarih 5',
  odeme_5: 'Ödeme 5',
  tarih_6: 'Tarih 6',
  odeme_6: 'Ödeme 6',
  kalan: 'Kalan',
  aciklama: 'Açıklama',
  evrak_kayit_tarihi: 'Evrak Kayıt Tarihi',
  inaktif: 'İnaktif',
  ogrenim_tarih: 'Öğrenim Belgesi Tarihi',
  adres_tarih: 'Adres Belgesi Tarihi',
  sicil_tarih: 'Adli Sicil Tarihi',
  ehliyet_tarih: 'Ehliyet Tarihi',
  kimlik_tarih: 'Kimlik Belgesi Tarihi',
  foto_tarih: 'Fotoğraf Tarihi',
  basvuru_tarih: 'Başvuru Formu Tarihi',
  src_tarih: 'E-SRC Kayıt Tarihi',
};

const extraDateFields = [
  "ogrenim_tarih",
  "adres_tarih",
  "sicil_tarih",
  "ehliyet_tarih",
  "kimlik_tarih",
  "foto_tarih",
  "basvuru_tarih",
  "src_tarih"
];

const allFields = [
  "aday_ismi",
  "tel_no",
  "tel_yakin",
  "tc_kimlik",
  "kurs_durumu",
  "alacagi_egitim",
  "devam_egitimi",
  "ogrenim_belgesi",
  "adres_belgesi",
  "adli_sicil",
  "ehliyet",
  "kimlik_belgesi",
  "fotograf",
  "basvuru_formu",
  "e_src_kaydi",
  "tutar",
  "odeme_durumu",
  "tarih_1",
  "odeme_1",
  "tarih_2",
  "odeme_2",
  "tarih_3",
  "odeme_3",
  "tarih_4",
  "odeme_4",
  "tarih_5",
  "odeme_5",
  "tarih_6",
  "odeme_6",
  "kalan",
  "aciklama",
  "evrak_kayit_tarihi",
  "inaktif",
  // Ekstra tarih alanları
  "ogrenim_tarih",
  "adres_tarih",
  "sicil_tarih",
  "ehliyet_tarih",
  "kimlik_tarih",
  "foto_tarih",
  "basvuru_tarih",
  "src_tarih"
];

// Evrak alanları ve tarihleri eşleştir
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

const KursiyerDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kursiyer, setKursiyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Profil fotoğrafı için state
  const [profilFoto, setProfilFoto] = useState(null);
  // TC Kimlik kopyalama bildirimi için state
  const [copied, setCopied] = useState(false);
  const [kursiyerList, setKursiyerList] = useState([]);
  // --- Eklendi: Sınav kaydı var mı? ---
  const [hasSinav, setHasSinav] = useState(false);

  useEffect(() => {
    const fetchDetay = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        let apiUrl = `/kursiyer/liste`;
        if (process.env.REACT_APP_API_URL) {
          apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/kursiyer/liste';
        }
        const res = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Kursiyer bilgisi alınamadı');
        const data = await res.json();
        setKursiyerList(data); // --- Eklendi: tüm kursiyerler state'e al ---
        // id ile eşleşen kursiyeri bul
        const found = data.find(
          (k) => String(k.id || k.tc_kimlik) === String(id)
        );
        setKursiyer(found || null);

        // Profil fotoğrafı çek
        if (found) {
          let belgeApi = `/api/belge/${found.id || found.tc_kimlik}`;
          if (process.env.REACT_APP_API_URL) {
            belgeApi = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/api/belge/${found.id || found.tc_kimlik}`;
          }
          const belgeRes = await fetch(belgeApi, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (belgeRes.ok) {
            const belge = await belgeRes.json();
            if (belge && belge.foto) {
              let fotoUrl = belge.foto;
              // Eğer yol http ile başlamıyorsa backend'in uploads köküne göre tam yol oluştur
              if (!/^https?:\/\//.test(fotoUrl)) {
                // encodeURIComponent ile boşluk ve Türkçe karakterleri encode et
                let baseUrl = process.env.REACT_APP_API_URL
                  ? process.env.REACT_APP_API_URL.replace(/\/$/, '')
                  : '';
                // Eğer yol uploads/ ile başlıyorsa başına / ekle
                if (fotoUrl.startsWith('uploads/')) {
                  fotoUrl = fotoUrl.replace(/\\/g, '/');
                  fotoUrl = baseUrl + '/' + encodeURI(fotoUrl);
                } else if (fotoUrl.startsWith('/uploads/')) {
                  fotoUrl = fotoUrl.replace(/\\/g, '/');
                  fotoUrl = baseUrl + encodeURI(fotoUrl);
                } else {
                  fotoUrl = baseUrl + '/uploads/' + encodeURI(fotoUrl.replace(/\\/g, '/'));
                }
              }
              setProfilFoto(fotoUrl);
            } else {
              setProfilFoto('/uploads/profil.jpg');
            }
          } else {
            setProfilFoto('/uploads/profil.jpg');
          }
        }
        // --- Sınav kaydı kontrolü ---
        if (found && (found.id || found.tc_kimlik)) {
          let sinavApi = `/api/sinav/${found.id || found.tc_kimlik}`;
          if (process.env.REACT_APP_API_URL) {
            sinavApi = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/api/sinav/${found.id || found.tc_kimlik}`;
          }
          const sinavRes = await fetch(sinavApi, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (sinavRes.ok) {
            const sinavData = await sinavRes.json();
            // Eğer sınav kaydı varsa (boş obje değilse)
            setHasSinav(sinavData && Object.keys(sinavData).length > 0);
          } else {
            setHasSinav(false);
          }
        } else {
          setHasSinav(false);
        }
      } catch (err) {
        setError(err.message || 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchDetay();
    // eslint-disable-next-line
  }, [id]);

  // Yardımcı fonksiyon: Tarihi "Gün/Ay/Yıl" olarak göster
  function formatDateTR(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const gun = String(d.getDate()).padStart(2, '0');
    const ay = String(d.getMonth() + 1).padStart(2, '0');
    const yil = d.getFullYear();
    return `${gun}/${ay}/${yil}`;
  }

  // --- Eklendi: Önceki/sonraki kursiyer bulma ---
  let prevId = null, nextId = null;
  if (kursiyerList && kursiyer && kursiyer.aday_ismi) {
    // Sırala: Türkçe alfabetik
    const sorted = [...kursiyerList].sort((a, b) =>
      (a.aday_ismi || '').localeCompare(b.aday_ismi || '', 'tr', { sensitivity: 'base' })
    );
    const idx = sorted.findIndex(k => String(k.id || k.tc_kimlik) === String(id));
    if (idx > 0) prevId = sorted[idx - 1].id || sorted[idx - 1].tc_kimlik;
    if (idx < sorted.length - 1) nextId = sorted[idx + 1].id || sorted[idx + 1].tc_kimlik;
  }

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!kursiyer) return <div>Kursiyer bulunamadı.</div>;

  return (
    <>
      {/* Geri Dön butonu: kutunun tamamen dışında, sayfanın üstünde */}
      <div style={{ maxWidth: 650, margin: '32px auto 0 auto' }}>
        <button
          style={{
            background: '#666',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 22px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #1976d233',
            marginBottom: 12
          }}
          onClick={() => navigate(-1)}
        >
          ← Geri Dön
        </button>
      </div>
      <div style={{
        maxWidth: 650,
        margin: '0 auto',
        background: '#fafbfc',
        padding: 32,
        borderRadius: 14,
        boxShadow: '0 4px 16px #0002'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Sinav Bilgileri butonu: daha önce sinif atanmışsa (sınav kaydı varsa) göster */}
            {hasSinav && (
              <button
                style={{
                  background: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 22px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #1976d233'
                }}
                onClick={() => navigate(`/kursiyer/${id}/sinav`)}
              >
                Sınav Bilgileri
              </button>
            )}
            <button
              style={{
                background: '#43a047',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 22px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #1976d233'
              }}
              onClick={() => navigate(`/kursiyer/${id}/belgeler`)}
            >
              Belgeleri Gör
            </button>
            <button
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 22px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #1976d233'
              }}
              onClick={() => navigate(`/kursiyer/${id}/duzenle`)}
            >
              Kursiyeri Güncelle
            </button>
          </div>
        </div>
        {/* Profil ve bilgiler */}
        {/* Aşağıdaki 4 alanı kaldırıyoruz: Ad Soyad, Telefon, Yakın Telefon, TC Kimlik */}
        {/* <div style={...}>
          ...solAlanlar.map...
        </div> */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 180,
          minHeight: 180,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 8px #0001',
          height: 'auto',
          marginBottom: 32
        }}>
          <img
            src={profilFoto || '/uploads/profil.jpg'}
            alt="Profil Fotoğrafı"
            style={{
              width: 160,
              height: 160,
              objectFit: 'cover',
              borderRadius: 10,
              border: '2px solid #e3e8ee',
              background: '#f5f5f5'
            }}
            onError={e => { e.target.onerror = null; e.target.src = '/uploads/profil.jpg'; }}
          />
        </div>
        <table style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          background: '#fff',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 1px 4px #0001'
        }}>
          <tbody>
            {/* İnaktif uyarısı: Ad Soyad satırının hemen üstünde */}
            {(kursiyer.inaktif === 1 || kursiyer.inaktif === '1' || kursiyer.inaktif === true) && (
              <tr>
                <td colSpan={2} style={{
                  textAlign: 'center',
                  color: '#e53935',
                  fontWeight: 700,
                  fontSize: 18,
                  padding: '14px 8px',
                  background: '#fff3f3'
                }}>
                  Bu kullanıcı inaktif!
                </td>
              </tr>
            )}
            {/* TC Kimlikten sonra evraklar ve tarihleri yanyana göster */}
            {allFields.map((key, idx) => {
              if (key === 'tc_kimlik') {
                const value = kursiyer[key] ?? '';
                return (
                  <React.Fragment key={key}>
                    <tr style={{
                      background: '#f5f8fa',
                      borderBottom: '1px solid #e3e8ee'
                    }}>
                      <td style={{
                        fontWeight: 600,
                        padding: '10px 8px',
                        border: 'none',
                        width: 180,
                        color: '#1976d2',
                        fontSize: 16
                      }}>
                        {fieldLabels[key] || key}
                      </td>
                      <td style={{
                        padding: '10px 8px',
                        border: 'none',
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}>
                        <span>{value}</span>
                        {/* Kopyalama ikonu ve bildirimi */}
                        {value && (
                          <>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(value);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1200);
                              }}
                              title="Kopyala"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                marginLeft: 4,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {/* Basit bir kopyala SVG ikonu */}
                              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                <rect x="6" y="6" width="10" height="12" rx="2" stroke="#1976d2" strokeWidth="1.5" fill="#e3f2fd"/>
                                <rect x="2.75" y="2.75" width="10.5" height="12.5" rx="2" stroke="#1976d2" strokeWidth="1.5" fill="white"/>
                              </svg>
                            </button>
                            {copied && (
                              <span style={{
                                marginLeft: 6,
                                color: '#43a047',
                                fontWeight: 500,
                                fontSize: 14,
                                background: '#e8f5e9',
                                borderRadius: 4,
                                padding: '2px 8px'
                              }}>
                                Kopyalandı!
                              </span>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                    {/* Evraklar ve tarihleri yan yana */}
                    {evrakFields.map(field => (
                      <tr key={field.key}
                        style={{
                          background: '#fafdff',
                          borderBottom: '1px solid #e3e8ee',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#e3f2fd'}
                        onMouseOut={e => e.currentTarget.style.background = '#fafdff'}
                      >
                        <td style={{
                          fontWeight: 600,
                          padding: '10px 8px',
                          border: 'none',
                          width: 180,
                          color: '#1565c0',
                          fontSize: 15
                        }}>
                          {field.label}
                        </td>
                        <td style={{
                          padding: '10px 8px',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 18
                        }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 500,
                            minWidth: 120
                          }}>
                            <input
                              type="checkbox"
                              checked={!!kursiyer[field.key]}
                              readOnly
                              style={{
                                accentColor: '#1976d2',
                                width: 18,
                                height: 18
                              }}
                            />
                            <span style={{
                              color: !!kursiyer[field.key] ? '#1976d2' : '#888'
                            }}>{field.label}</span>
                          </label>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontWeight: 400
                          }}>
                            <span style={{ minWidth: 70, color: '#555' }}>{field.dateLabel}:</span>
                            <span style={{
                              minWidth: 140,
                              maxWidth: 180,
                              color: kursiyer[field.dateKey] ? '#222' : '#888',
                              fontSize: 15,
                              fontWeight: kursiyer[field.dateKey] ? 500 : 400,
                              background: kursiyer[field.dateKey] ? '#e3f2fd' : 'none',
                              borderRadius: 4,
                              padding: kursiyer[field.dateKey] ? '2px 8px' : 0
                            }}>
                              {kursiyer[field.dateKey]
                                ? formatDateTR(kursiyer[field.dateKey])
                                : 'Tarih Belirtilmemiş'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              }
              // Evrak ve tarih alanlarını tekrar göstermemek için atla
              if (
                evrakFields.some(f => f.key === key || f.dateKey === key) ||
                key === 'id' || key === 'odeme_durumu' || key === 'inaktif'
              ) {
                return null;
              }
              // Diğer alanlar için eski gösterim
              const value = kursiyer[key] ?? '';
              // Checkbox gösterimi
              if (
                [
                  'ogrenim_belgesi',
                  'adres_belgesi',
                  'adli_sicil',
                  'ehliyet',
                  'kimlik_belgesi',
                  'fotograf',
                  'basvuru_formu',
                  'e_src_kaydi'
                ].includes(key)
              ) {
                return (
                  <tr key={key} style={{ background: '#fafdff', borderBottom: '1px solid #e3e8ee' }}>
                    <td style={{
                      fontWeight: 600,
                      padding: '10px 8px',
                      border: 'none',
                      width: 180,
                      color: '#1565c0',
                      fontSize: 15
                    }}>
                      {fieldLabels[key] || key}
                    </td>
                    <td style={{ padding: '10px 8px', border: 'none' }}>
                      <input type="checkbox" checked={!!value} readOnly style={{ accentColor: '#1976d2', width: 18, height: 18 }} />
                    </td>
                  </tr>
                );
              }
              // Ekstra tarih alanları için özel gösterim
              if (extraDateFields.includes(key)) {
                return (
                  <tr key={key} style={{ background: '#fafdff', borderBottom: '1px solid #e3e8ee' }}>
                    <td style={{
                      fontWeight: 600,
                      padding: '10px 8px',
                      border: 'none',
                      width: 180,
                      color: '#1565c0',
                      fontSize: 15
                    }}>
                      {fieldLabels[key] || key}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      border: 'none',
                      color: kursiyer[key] ? '#222' : '#888',
                      fontWeight: kursiyer[key] ? 500 : 400
                    }}>
                      {kursiyer[key] ? formatDateTR(kursiyer[key]) : 'Tarih Belirtilmemiş'}
                    </td>
                  </tr>
                );
              }
              // Evrak Kayıt Tarihi için özel gösterim
              if (key === "evrak_kayit_tarihi") {
                const value = kursiyer[key] ?? '';
                return (
                  <tr key={key} style={{ background: '#fafdff', borderBottom: '1px solid #e3e8ee' }}>
                    <td style={{
                      fontWeight: 600,
                      padding: '10px 8px',
                      border: 'none',
                      width: 180,
                      color: '#1565c0',
                      fontSize: 15
                    }}>
                      {fieldLabels[key] || key}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      border: 'none',
                      color: value ? '#222' : '#888',
                      fontWeight: value ? 500 : 400
                    }}>
                      {value ? formatDateTR(value) : 'Tarih Belirtilmemiş'}
                    </td>
                  </tr>
                );
              }
              // Ödeme ve ödeme tarihlerini aynı satırda göster
              if (
                /^tarih_\d+$/.test(key) &&
                allFields.includes(`odeme_${key.split('_')[1]}`)
              ) {
                const odemeNo = key.split('_')[1];
                const tarihValue = kursiyer[key] ?? '';
                const odemeValue = kursiyer[`odeme_${odemeNo}`] ?? '';
                // Sadece bir kez göster, odeme_X sırasında atla
                if (key !== `tarih_${odemeNo}`) return null;
                // Eğer hem tutar hem tarih boşsa satırı gösterme
                if (!tarihValue && !odemeValue) return null;
                return (
                  <tr key={`odeme_row_${odemeNo}`} style={{ background: '#fafdff', borderBottom: '1px solid #e8e8ee' }}>
                    <td style={{
                      fontWeight: 600,
                      padding: '10px 8px',
                      border: 'none',
                      width: 180,
                      color: '#1976d2',
                      fontSize: 15
                    }}>
                      {`Ödeme ${odemeNo}`}
                    </td>
                    <td style={{ padding: '10px 8px', border: 'none', fontSize: 15 }}>
                      <span style={{ marginRight: 32 }}>
                        <span style={{ color: '#555', fontWeight: 500 }}>Tutar:</span>{' '}
                        <span style={{ color: odemeValue ? '#222' : '#888', fontWeight: odemeValue ? 500 : 400 }}>
                          {odemeValue ? `${odemeValue} ₺` : 'Belirtilmemiş'}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: '#555', fontWeight: 500 }}>Tarih:</span>{' '}
                        <span style={{ color: tarihValue ? '#222' : '#888', fontWeight: tarihValue ? 500 : 400 }}>
                          {tarihValue ? formatDateTR(tarihValue) : 'Belirtilmemiş'}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              }
              // odeme_X alanlarını ayrıca göstermemek için atla
              if (/^odeme_\d+$/.test(key)) {
                return null;
              }
              // Kurs Durumu alanını gösteren yerde:
              // Eğer kursiyer.kurs_durumu === 'İptal' ve kursiyer.iptal_tarih varsa, 'Kurs Durumu: İptal (GG/AA/YY)' olarak göster.
              // Diğer durumlarda sadece kurs_durumu göster.
              if (key === 'kurs_durumu') {
                const kursDurumuValue = kursiyer[key] ?? '';
                const iptalTarihValue = kursiyer['iptal_tarih'] ?? '';
                if (iptalTarihValue) {
                  return (
                    <tr key={key} style={{ background: '#fafdff', borderBottom: '1px solid #e3e8ee' }}>
                      <td style={{
                        fontWeight: 600,
                        padding: '10px 8px',
                        border: 'none',
                        width: 180,
                        color: '#1565c0',
                        fontSize: 15
                      }}>
                        {fieldLabels[key] || key}
                      </td>
                      <td style={{
                        padding: '2px 8px',
                        border: 'none',
                        color: '#222',
                        fontWeight: 500,
                        background: '#e3f2fd',
                        borderRadius: 4
                      }}>
                        İptal ({formatDateTR(iptalTarihValue)})
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={key} style={{ background: '#fafdff', borderBottom: '1px solid #e3e8ee' }}>
                    <td style={{
                      fontWeight: 600,
                      padding: '10px 8px',
                      border: 'none',
                      width: 180,
                      color: '#1565c0',
                      fontSize: 15
                    }}>
                      {fieldLabels[key] || key}
                    </td>
                    <td style={{
                      padding: '10px 8px',
                      border: 'none',
                      color: '#222',
                      fontWeight: 500,
                      background: '#e3f2fd',
                      borderRadius: 4
                    }}>
                      {kursDurumuValue}
                    </td>
                  </tr>
                );
              }
              // Diğer alanlar için eski gösterim
              return (
                <tr key={key} style={{ background: idx % 2 === 0 ? '#fafdff' : '#f5f8fa', borderBottom: '1px solid #e3e8ee' }}>
                  <td style={{
                    fontWeight: 600,
                    padding: '10px 8px',
                    border: 'none',
                    width: 180,
                    color: '#1976d2',
                    fontSize: 15
                  }}>
                    {fieldLabels[key] || key}
                  </td>
                  <td style={{ padding: '10px 8px', border: 'none', fontSize: 15 }}>
                    {typeof value === 'number' && (key.includes('tutar') || key.includes('odeme') || key === 'kalan')
                      ? `${value} ₺`
                      : value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* --- Eklendi: Alt kısma önceki/sonraki okları --- */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 32,
          gap: 40
        }}>
          <button
            disabled={!prevId}
            onClick={() => prevId && navigate(`/kursiyer/${prevId}`)}
            style={{
              background: prevId ? '#1976d2' : '#e3e8ee',
              color: prevId ? '#fff' : '#888',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: 18,
              cursor: prevId ? 'pointer' : 'not-allowed',
              boxShadow: prevId ? '0 2px 8px #1976d233' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {/* Sol ok SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 6L9 12L15 18" stroke={prevId ? "#fff" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Önceki
          </button>
          <button
            disabled={!nextId}
            onClick={() => nextId && navigate(`/kursiyer/${nextId}`)}
            style={{
              background: nextId ? '#1976d2' : '#e3e8ee',
              color: nextId ? '#fff' : '#888',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: 18,
              cursor: nextId ? 'pointer' : 'not-allowed',
              boxShadow: nextId ? '0 2px 8px #1976d233' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Sonraki
            {/* Sağ ok SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke={nextId ? "#fff" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default KursiyerDetay;