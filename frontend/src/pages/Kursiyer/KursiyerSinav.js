import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const yaziliSinavSayisi = 4;
const uygulamaSinavSayisi = 4;
const devamSinavSayisi = 4;
const devamUygulamaSinavSayisi = 4;

const KursiyerSinav = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kursiyer, setKursiyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState(null);

  // Form state
  const [yazili, setYazili] = useState(Array(yaziliSinavSayisi).fill(''));
  const [uygulama, setUygulama] = useState(Array(uygulamaSinavSayisi).fill(''));
  // Tarih state'leri eklendi
  const [yaziliTarih, setYaziliTarih] = useState(Array(yaziliSinavSayisi).fill(''));
  const [uygulamaTarih, setUygulamaTarih] = useState(Array(uygulamaSinavSayisi).fill(''));
  // Devam eğitimi için state
  const [devamYazili, setDevamYazili] = useState(Array(devamSinavSayisi).fill(''));
  const [devamUygulama, setDevamUygulama] = useState(Array(devamUygulamaSinavSayisi).fill(''));
  // Devam tarih state'leri
  const [devamYaziliTarih, setDevamYaziliTarih] = useState(Array(devamSinavSayisi).fill(''));
  const [devamUygulamaTarih, setDevamUygulamaTarih] = useState(Array(devamUygulamaSinavSayisi).fill(''));

  // Kursiyer ve sınav verisini çek
  useEffect(() => {
    const fetchData = async () => {
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
        const found = data.find((k) => String(k.id || k.tc_kimlik) === String(id));
        setKursiyer(found || null);

        // Sınav verisi çek
        let sinavUrl = `/api/sinav/${id}`;
        if (process.env.REACT_APP_API_URL) {
          sinavUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/api/sinav/${id}`;
        }
        const sres = await fetch(sinavUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!sres.ok) throw new Error('Sınav bilgisi alınamadı');
        const sinavData = await sres.json();
        // setSinav(sinavData || null);

        // Formu doldur
        if (sinavData) {
          setYazili([
            sinavData.sinav_1 ?? '',
            sinavData.sinav_2 ?? '',
            sinavData.sinav_3 ?? '',
            sinavData.sinav_4 ?? ''
          ]);
          setYaziliTarih([
            sinavData.sinav_1_tarih ?? '',
            sinavData.sinav_2_tarih ?? '',
            sinavData.sinav_3_tarih ?? '',
            sinavData.sinav_4_tarih ?? ''
          ]);
          setUygulama([
            sinavData.uygulama_1 ?? '',
            sinavData.uygulama_2 ?? '',
            sinavData.uygulama_3 ?? '',
            sinavData.uygulama_4 ?? ''
          ]);
          setUygulamaTarih([
            sinavData.uygulama_1_tarih ?? '',
            sinavData.uygulama_2_tarih ?? '',
            sinavData.uygulama_3_tarih ?? '',
            sinavData.uygulama_4_tarih ?? ''
          ]);
          // Devam eğitimi notları
          setDevamYazili([
            sinavData.devam_sinav_1 ?? '',
            sinavData.devam_sinav_2 ?? '',
            sinavData.devam_sinav_3 ?? '',
            sinavData.devam_sinav_4 ?? ''
          ]);
          setDevamYaziliTarih([
            sinavData.devam_sinav_1_tarih ?? '',
            sinavData.devam_sinav_2_tarih ?? '',
            sinavData.devam_sinav_3_tarih ?? '',
            sinavData.devam_sinav_4_tarih ?? ''
          ]);
          setDevamUygulama([
            sinavData.devam_uygulama_1 ?? '',
            sinavData.devam_uygulama_2 ?? '',
            sinavData.devam_uygulama_3 ?? '',
            sinavData.devam_uygulama_4 ?? ''
          ]);
          setDevamUygulamaTarih([
            sinavData.devam_uygulama_1_tarih ?? '',
            sinavData.devam_uygulama_2_tarih ?? '',
            sinavData.devam_uygulama_3_tarih ?? '',
            sinavData.devam_uygulama_4_tarih ?? ''
          ]);
        }
      } catch (err) {
        setError(err.message || 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Kullanıcı rolünü çek
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem('token');
        let apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
        const res = await fetch(`${apiUrl}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUserRole(data.role);
      } catch {
        setUserRole(null);
      }
    };
    fetchRole();
  }, []);

  // Yazılı sınavlardan herhangi biri >= 70 ise uygulama sınavı aktif olur
  const yaziliGecti = yazili.some((n) => Number(n) >= 70);

  // Uygulama sınavı sonucu "Geçti" ise kursiyer inaktif yapılacak
  const uygulamaGecti = uygulama.some((v) => v === 'Geçti');

  // Devam eğitimi var mı?
  const devamEgitimiVar = kursiyer && kursiyer.devam_egitimi && String(kursiyer.devam_egitimi).trim() !== '';

  // Devam yazılı sınavlardan herhangi biri >= 70 ise devam uygulama sınavı aktif olur
  const devamYaziliGecti = devamYazili.some((n) => Number(n) >= 70);

  // Form gönder
  const handleSave = async (e) => {
    e.preventDefault();
    if (userRole === "user") {
      setError("Sınav ekleme/güncelleme yetkiniz yok.");
      return;
    }
    // --- Tarih zorunluluğu kontrolü ---
    for (let i = 0; i < yazili.length; i++) {
      if (yazili[i] !== '' && !yaziliTarih[i]) {
        setError(`${i + 1}. Yazılı sınav için tarih giriniz.`);
        return;
      }
    }
    for (let i = 0; i < uygulama.length; i++) {
      if (uygulama[i] !== '' && !uygulamaTarih[i]) {
        setError(`${i + 1}. Uygulama sınavı için tarih giriniz.`);
        return;
      }
    }
    for (let i = 0; i < devamYazili.length; i++) {
      if (devamYazili[i] !== '' && !devamYaziliTarih[i]) {
        setError(`Devam ${i + 1}. Yazılı sınav için tarih giriniz.`);
        return;
      }
      // Eğer tarih girilmiş ama not girilmemişse hata ver
      if (devamYaziliTarih[i] && devamYazili[i] === '') {
        setError(`Devam ${i + 1}. Yazılı sınav için not giriniz.`);
        return;
      }
    }
    for (let i = 0; i < devamUygulama.length; i++) {
      if (devamUygulama[i] !== '' && !devamUygulamaTarih[i]) {
        setError(`Devam ${i + 1}. Uygulama sınavı için tarih giriniz.`);
        return;
      }
      // Eğer tarih girilmiş ama not girilmemişse hata ver
      if (devamUygulamaTarih[i] && devamUygulama[i] === '') {
        setError(`Devam ${i + 1}. Uygulama sınavı için not giriniz.`);
        return;
      }
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      let apiUrl = `/api/sinav/${id}`;
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/api/sinav/${id}`;
      }
      const body = {
        alacagi_egitim: kursiyer.alacagi_egitim,
        sinav_1: yazili[0] !== '' ? Math.min(Number(yazili[0]), 100) : null,
        sinav_1_tarih: yaziliTarih[0] ? yaziliTarih[0] : null,
        sinav_2: yazili[1] !== '' ? Math.min(Number(yazili[1]), 100) : null,
        sinav_2_tarih: yaziliTarih[1] ? yaziliTarih[1] : null,
        sinav_3: yazili[2] !== '' ? Math.min(Number(yazili[2]), 100) : null,
        sinav_3_tarih: yaziliTarih[2] ? yaziliTarih[2] : null,
        sinav_4: yazili[3] !== '' ? Math.min(Number(yazili[3]), 100) : null,
        sinav_4_tarih: yaziliTarih[3] ? yaziliTarih[3] : null,
        uygulama_1: uygulama[0] || "",
        uygulama_1_tarih: uygulamaTarih[0] ? uygulamaTarih[0] : null,
        uygulama_2: uygulama[1] || "",
        uygulama_2_tarih: uygulamaTarih[1] ? uygulamaTarih[1] : null,
        uygulama_3: uygulama[2] || "",
        uygulama_3_tarih: uygulamaTarih[2] ? uygulamaTarih[2] : null,
        uygulama_4: uygulama[3] || "",
        uygulama_4_tarih: uygulamaTarih[3] ? uygulamaTarih[3] : null,
        // Devam eğitimi alanları
        ...(devamEgitimiVar && {
          devam_egitimi: kursiyer.devam_egitimi,
          devam_sinav_1: devamYazili[0] !== '' ? Math.min(Number(devamYazili[0]), 100) : null,
          devam_sinav_1_tarih: devamYaziliTarih[0] ? devamYaziliTarih[0] : null,
          devam_sinav_2: devamYazili[1] !== '' ? Math.min(Number(devamYazili[1]), 100) : null,
          devam_sinav_2_tarih: devamYaziliTarih[1] ? devamYaziliTarih[1] : null,
          devam_sinav_3: devamYazili[2] !== '' ? Math.min(Number(devamYazili[2]), 100) : null,
          devam_sinav_3_tarih: devamYaziliTarih[2] ? devamYaziliTarih[2] : null,
          devam_sinav_4: devamYazili[3] !== '' ? Math.min(Number(devamYazili[3]), 100) : null,
          devam_sinav_4_tarih: devamYaziliTarih[3] ? devamYaziliTarih[3] : null,
          devam_uygulama_1: devamUygulama[0] || "",
          devam_uygulama_1_tarih: devamUygulamaTarih[0] ? devamUygulamaTarih[0] : null,
          devam_uygulama_2: devamUygulama[1] || "",
          devam_uygulama_2_tarih: devamUygulamaTarih[1] ? devamUygulamaTarih[1] : null,
          devam_uygulama_3: devamUygulama[2] || "",
          devam_uygulama_3_tarih: devamUygulamaTarih[2] ? devamUygulamaTarih[2] : null,
          devam_uygulama_4: devamUygulama[3] || "",
          devam_uygulama_4_tarih: devamUygulamaTarih[3] ? devamUygulamaTarih[3] : null,
        })
      };

      // --- KURS DURUMU GÜNCELLEME KURALI ---
      // Eğer uygulama_1-4'ün hepsi boşsa veya en az biri "Kaldı" ise kurs_durumu "Katiliyor" olmalı
      let kursDurumuGuncelle = false;
      let yeniKursDurumu = kursiyer.kurs_durumu;

      const uygulamaHepsiBos = uygulama.every(u => !u || u === "");
      const uygulamaBirKaldi = uygulama.some(u => u === "Kaldı");

      // "Fark" olarak kayıtlıysa ve bu koşullar oluşursa mutlaka "Katiliyor" yapılmalı
      if (
        (kursiyer.kurs_durumu === "Fark" || kursiyer.kurs_durumu !== "Katiliyor") &&
        (uygulamaHepsiBos || uygulamaBirKaldi)
      ) {
        kursDurumuGuncelle = true;
        yeniKursDurumu = "Katiliyor";
      }

      // NOT: Devam eğitimi notları artık ana eğitim uygulama sınavlarından bağımsız
      // Bu kısım kaldırıldı çünkü devam eğitimi notları ayrı bir süreç

      // KURS DURUMU GÜNCELLEME: "Fark" ise ve uygulama sınavlarının hiçbiri "Geçti" değilse "Katiliyor" yap
      if (
        kursiyer.kurs_durumu === "Fark" &&
        !uygulama.some(u => u === "Geçti")
      ) {
        kursDurumuGuncelle = true;
        yeniKursDurumu = "Katiliyor";
      }

      // Ayrıca: "Fark" ise ve uygulama sınavlarından herhangi biri boş veya "Kaldı" ise de "Katiliyor" yap
      if (
        kursiyer.kurs_durumu === "Fark" &&
        uygulama.some(u => !u || u === "Kaldı")
      ) {
        kursDurumuGuncelle = true;
        yeniKursDurumu = "Katiliyor";
      }

      // Önce sınav bilgisini kaydet
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Kayıt başarısız');

      if (kursDurumuGuncelle) {
        let kursiyerApi = `/kursiyer/${id}`;
        if (process.env.REACT_APP_API_URL) {
          kursiyerApi = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/kursiyer/${id}`;
        }
        await fetch(kursiyerApi, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ kurs_durumu: yeniKursDurumu })
        });
      }

      setSuccess('Sınav bilgileri kaydedildi.');
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const containerStyle = {
    maxWidth: 700,
    margin: '40px auto',
    background: 'linear-gradient(135deg, #f8fafc 60%, #e3eafc 100%)',
    padding: 40,
    borderRadius: 18,
    boxShadow: '0 8px 32px #0001, 0 1.5px 4px #1976d222',
    border: '1px solid #e3eafc',
    transition: 'box-shadow 0.2s',
  };

  const infoBoxStyle = {
    marginBottom: 24,
    background: '#f1f8fe',
    borderRadius: 10,
    padding: '18px 22px',
    fontSize: 17,
    boxShadow: '0 1px 4px #1976d211',
    border: '1px solid #e3eafc',
  };

  const labelStyle = {
    fontWeight: 500,
    fontSize: 16,
    marginBottom: 6,
    display: 'block',
    color: '#1976d2',
  };

  // Küçük fontlu label ve sonuç için ek stiller
  const smallLabelStyle = {
    fontWeight: 500,
    fontSize: 13,
    color: '#1976d2',
    minWidth: 70,
    textAlign: 'center',
    display: 'inline-block'
  };

  const smallUygulamaLabelStyle = {
    fontWeight: 500,
    fontSize: 13,
    color: '#1976d2',
    minWidth: 90,
    textAlign: 'center',
    display: 'inline-block'
  };

  const smallResultStyle = (success) => ({
    color: success ? '#43a047' : '#e53935',
    fontWeight: 600,
    fontSize: 12,
    marginLeft: 8,
    letterSpacing: 0.2,
    textAlign: 'center',
    minWidth: 70,
    display: 'inline-block'
  });

  const inputStyle = {
    width: 80,
    padding: '8px 10px',
    borderRadius: 6,
    border: '1.5px solid #b0bec5',
    fontSize: 16,
    textAlign: 'center',
    background: '#fff',
    transition: 'border 0.2s',
    outline: 'none',
  };

  const selectStyle = {
    width: 110,
    padding: '8px 10px',
    borderRadius: 6,
    border: '1.5px solid #b0bec5',
    fontSize: 16,
    background: '#fff',
    textAlign: 'center',
    transition: 'border 0.2s',
    outline: 'none',
  };

  const buttonStyle = (primary, disabled) => ({
    background: primary ? '#1976d2' : '#888',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontWeight: 700,
    fontSize: 17,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: primary ? '0 2px 8px #1976d233' : '0 1px 4px #8882',
    transition: 'background 0.2s, box-shadow 0.2s',
    marginTop: 0,
  });

  const flexRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  };

  const fieldColStyle = {
    minWidth: 180,
    flex: 1,
    background: '#f8fafc',
    borderRadius: 8,
    padding: '12px 10px 18px 10px',
    boxShadow: '0 1px 4px #1976d111',
    border: '1px solid #e3eafc',
    marginBottom: 8,
  };

  const warningStyle = {
    color: "#e53935",
    marginBottom: 18,
    fontWeight: 600,
    background: "#fff3f3",
    border: "1px solid #ffcdd2",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 16,
    textAlign: "center"
  };

  const infoTextStyle = {
    color: '#888',
    fontSize: 15,
    marginTop: 14,
    textAlign: 'center',
    fontStyle: 'italic'
  };

  const successTextStyle = {
    color: '#43a047',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 17,
  };

  const errorTextStyle = {
    color: '#e53935',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 17,
  };

  if (loading || userRole === null) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!kursiyer) return <div>Kursiyer bulunamadı.</div>;

  return (
    <div style={containerStyle}>
      {/* Sınav Bilgileri başlığı kaldırıldı */}
      {userRole === "user" && (
        <div style={warningStyle}>
          Sınav ekleme/güncelleme yetkiniz yok. Sadece görüntüleyebilirsiniz.
        </div>
      )}
      <div style={infoBoxStyle}>
        <div style={{
          fontWeight: 700,
          fontSize: 22,
          color: '#1976d2',
          textAlign: 'center',
          letterSpacing: 0.5,
          padding: '6px 0'
        }}>
          {kursiyer.aday_ismi}
        </div>
      </div>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ ...labelStyle, fontSize: 18, marginBottom: 16, textAlign: 'center', color: '#1565c0' }}>
            {kursiyer.alacagi_egitim ? String(kursiyer.alacagi_egitim).toUpperCase() : ""} Sınavı
          </div>
          <div style={flexRowStyle}>
            {/* Yazılı Sınavlar */}
            <div style={fieldColStyle}>
              <div style={{ ...labelStyle, marginBottom: 10, textAlign: 'center', fontWeight: 700 }}>Yazılı</div>
              {[...Array(yaziliSinavSayisi)].map((_, i) => (
                <div key={i} style={{ marginTop: 12 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    justifyContent: 'space-between',
                  }}>
                    <label style={{ fontWeight: 500, flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span style={smallLabelStyle}>{i + 1}. Yazılı:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={yazili[i]}
                        disabled={userRole === "user" || (yaziliGecti && yazili.findIndex(n => Number(n) >= 70) < i)}
                        onChange={e => {
                          let val = e.target.value;
                          if (val !== '' && Number(val) > 100) val = '100';
                          if (val !== '' && Number(val) < 0) val = '0';
                          const arr = [...yazili];
                          arr[i] = val;
                          setYazili(arr);
                          // Not silinirse tarihi de sil
                          if (val === '') {
                            const tarihArr = [...yaziliTarih];
                            tarihArr[i] = '';
                            setYaziliTarih(tarihArr);
                          }
                        }}
                        style={inputStyle}
                      />
                    </label>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      {yazili[i] !== '' && (
                        <span style={smallResultStyle(Number(yazili[i]) >= 70)}>
                          {Number(yazili[i]) >= 70
                            ? 'Başarılı'
                            : 'Başarısız'}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Tarih inputu */}
                  <div style={{ marginTop: 4, marginLeft: 70 }}>
                    <input
                      type="date"
                      value={yaziliTarih[i]}
                      disabled={userRole === "user" || yazili[i] === ''}
                      required={yazili[i] !== ''}
                      onChange={e => {
                        const arr = [...yaziliTarih];
                        arr[i] = e.target.value;
                        setYaziliTarih(arr);
                      }}
                      style={{ ...inputStyle, width: 150, fontSize: 14 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Uygulama Sınavları */}
            <div style={fieldColStyle}>
              <div style={{ ...labelStyle, marginBottom: 10, textAlign: 'center', fontWeight: 700 }}>Uygulama</div>
              {[...Array(uygulamaSinavSayisi)].map((_, i) => (
                <div key={i} style={{ marginTop: 12 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    justifyContent: 'space-between',
                  }}>
                    <label style={{ fontWeight: 500, flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span style={smallUygulamaLabelStyle}>{i + 1}. Uygulama:</span>
                      <select
                        value={uygulama[i]}
                        disabled={userRole === "user" || !yaziliGecti || (uygulamaGecti && uygulama.findIndex(v => v === 'Geçti') < i)}
                        onChange={e => {
                          const arr = [...uygulama];
                          arr[i] = e.target.value;
                          setUygulama(arr);
                          // Not silinirse tarihi de sil
                          if (e.target.value === '' || (uygulama[i] === 'Geçti' && e.target.value !== 'Geçti')) {
                            const tarihArr = [...uygulamaTarih];
                            tarihArr[i] = '';
                            setUygulamaTarih(tarihArr);
                          }
                        }}
                        style={selectStyle}
                      >
                        <option value="">Seçiniz</option>
                        <option value="Geçti">Geçti</option>
                        <option value="Kaldı">Kaldı</option>
                        <option value="Muaf">Muaf</option>
                        <option value="Girmedi">Girmedi</option>
                      </select>
                    </label>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      {uygulama[i] === 'Geçti' && (
                        <span style={smallResultStyle(true)}>Başarılı</span>
                      )}
                      {uygulama[i] === 'Kaldı' && (
                        <span style={smallResultStyle(false)}>Başarısız</span>
                      )}
                    </div>
                  </div>
                  {/* Tarih inputu */}
                  <div style={{ marginTop: 4, marginLeft: 90 }}>
                    <input
                      type="date"
                      value={uygulamaTarih[i]}
                      disabled={userRole === "user" || uygulama[i] === ''}
                      required={uygulama[i] !== ''}
                      onChange={e => {
                        const arr = [...uygulamaTarih];
                        arr[i] = e.target.value;
                        setUygulamaTarih(arr);
                      }}
                      style={{ ...inputStyle, width: 150, fontSize: 14 }}
                    />
                  </div>
                </div>
              ))}
              {!yaziliGecti && (
                <div style={infoTextStyle}>
                  Önce yazılı sınavdan 70 ve üzeri alınmalı.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Devam Eğitimi Alanları */}
        {devamEgitimiVar && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ ...labelStyle, fontSize: 18, marginBottom: 16, textAlign: 'center', color: '#1565c0' }}>
              {kursiyer.devam_egitimi ? String(kursiyer.devam_egitimi).toUpperCase() : ""} Sınavı
            </div>
            {/* Uyarı mesajı ekle */}
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 16,
              color: '#856404',
              fontSize: 14,
              textAlign: 'center'
            }}>
              <strong>Önemli:</strong> Devam eğitimi notları için önce not girin, sonra tarih girin. 
              Sadece tarih girip not girmeye çalışırsanız, tarih otomatik olarak temizlenir.
            </div>
            <div style={flexRowStyle}>
              {/* Devam Yazılı Sınavlar */}
              <div style={fieldColStyle}>
                <div style={{ ...labelStyle, marginBottom: 10, textAlign: 'center', fontWeight: 700 }}>Yazılı</div>
                {[...Array(devamSinavSayisi)].map((_, i) => (
                  <div key={i} style={{ marginTop: 12 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      justifyContent: 'space-between',
                    }}>
                      <label style={{ fontWeight: 500, flex: 1, display: 'flex', alignItems: 'center' }}>
                        <span style={smallLabelStyle}>{i + 1}. Yazılı:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={devamYazili[i]}
                          disabled={userRole === "user"}
                          onChange={e => {
                            let val = e.target.value;
                            if (val !== '' && Number(val) > 100) val = '100';
                            if (val !== '' && Number(val) < 0) val = '0';
                            const arr = [...devamYazili];
                            arr[i] = val;
                            setDevamYazili(arr);
                            if (val === '') {
                              const tarihArr = [...devamYaziliTarih];
                              tarihArr[i] = '';
                              setDevamYaziliTarih(tarihArr);
                            }
                          }}
                          style={inputStyle}
                        />
                      </label>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        {devamYazili[i] !== '' && (
                          <span style={smallResultStyle(Number(devamYazili[i]) >= 70)}>
                            {Number(devamYazili[i]) >= 70
                              ? 'Başarılı'
                              : 'Başarısız'}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Tarih inputu */}
                    <div style={{ marginTop: 4, marginLeft: 70 }}>
                      <input
                        type="date"
                        value={devamYaziliTarih[i]}
                        disabled={userRole === "user" || devamYazili[i] === ''}
                        required={devamYazili[i] !== ''}
                        onChange={e => {
                          const arr = [...devamYaziliTarih];
                          arr[i] = e.target.value;
                          setDevamYaziliTarih(arr);
                        }}
                        style={{ ...inputStyle, width: 150, fontSize: 14 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Devam Uygulama Sınavları */}
              <div style={fieldColStyle}>
                <div style={{ ...labelStyle, marginBottom: 10, textAlign: 'center', fontWeight: 700 }}>Uygulama</div>
                {[...Array(devamUygulamaSinavSayisi)].map((_, i) => (
                  <div key={i} style={{ marginTop: 12 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      justifyContent: 'space-between',
                    }}>
                      <label style={{ fontWeight: 500, flex: 1, display: 'flex', alignItems: 'center' }}>
                        <span style={smallUygulamaLabelStyle}>{i + 1}. Uygulama:</span>
                        <select
                          value={devamUygulama[i]}
                          disabled={userRole === "user"}
                          onChange={e => {
                            const arr = [...devamUygulama];
                            arr[i] = e.target.value;
                            setDevamUygulama(arr);
                            if (e.target.value === '') {
                              const tarihArr = [...devamUygulamaTarih];
                              tarihArr[i] = '';
                              setDevamUygulamaTarih(tarihArr);
                            }
                          }}
                          style={selectStyle}
                        >
                          <option value="">Seçiniz</option>
                          <option value="Geçti">Geçti</option>
                          <option value="Kaldı">Kaldı</option>
                          <option value="Muaf">Muaf</option>
                          <option value="Girmedi">Girmedi</option>
                        </select>
                      </label>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        {devamUygulama[i] === 'Geçti' && (
                          <span style={smallResultStyle(true)}>Başarılı</span>
                        )}
                        {devamUygulama[i] === 'Kaldı' && (
                          <span style={smallResultStyle(false)}>Başarısız</span>
                        )}
                      </div>
                    </div>
                    {/* Tarih inputu */}
                    <div style={{ marginTop: 4, marginLeft: 90 }}>
                      <input
                        type="date"
                        value={devamUygulamaTarih[i]}
                        disabled={userRole === "user" || devamUygulama[i] === ''}
                        required={devamUygulama[i] !== ''}
                        onChange={e => {
                          const arr = [...devamUygulamaTarih];
                          arr[i] = e.target.value;
                          setDevamUygulamaTarih(arr);
                        }}
                        style={{ ...inputStyle, width: 150, fontSize: 14 }}
                      />
                    </div>
                  </div>
                ))}
                {!devamYaziliGecti && (
                  <div style={infoTextStyle}>
                    Önce devam yazılı sınavdan 70 ve üzeri alınmalı.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Butonlar yan yana */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 24, marginTop: 18, justifyContent: 'center' }}>
          <button
            type="submit"
            disabled={saving || userRole === "user"}
            style={buttonStyle(true, saving || userRole === "user")}
          >
            Kaydet
          </button>
          <button
            type="button"
            style={buttonStyle(false, false)}
            onClick={() => navigate(-1)}
          >
            Geri Dön
          </button>
        </div>
        {success && <div style={successTextStyle}>{success}</div>}
        {error && <div style={errorTextStyle}>{error}</div>}
      </form>
    </div>
  );
};

export default KursiyerSinav;