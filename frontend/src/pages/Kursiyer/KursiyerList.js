import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

// Türkçe harf sırası için özel karşılaştırma fonksiyonu
const turkishOrder = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
];
const turkishCharMap = {};
turkishOrder.forEach((harf, idx) => {
  turkishCharMap[harf] = idx;
  turkishCharMap[harf.toLowerCase()] = idx;
});
function turkishCompare(a, b) {
  const strA = (a.aday_ismi || '').trim();
  const strB = (b.aday_ismi || '').trim();
  const len = Math.max(strA.length, strB.length);
  for (let i = 0; i < len; i++) {
    const charA = strA[i] || '';
    const charB = strB[i] || '';
    if (charA === charB) continue;
    const idxA = turkishCharMap[charA] ?? -1;
    const idxB = turkishCharMap[charB] ?? -1;
    if (idxA !== idxB) return idxA - idxB;
    // Eğer harf Türkçe sıralamada yoksa unicode karşılaştır
    if (charA !== charB) return charA.localeCompare(charB, 'tr');
  }
  return 0;
}

const KursiyerList = () => {
  const [kursiyerler, setKursiyerler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [siniflar, setSiniflar] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKursiyer, setSelectedKursiyer] = useState(null);
  const [selectedSinif, setSelectedSinif] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [modalError, setModalError] = useState('');
  const [durumFiltre, setDurumFiltre] = useState({
    Beklemede: false,
    Katiliyor: false,
    Fark: false,
    Firma: false,
    SHDA: false,
    "Kursu Tamamladi!": false,
    "Özel Durum": false,
    "İptal": false,
  });
  const [egitimFiltre, setEgitimFiltre] = useState({
    SRC1: false,
    SRC2: false,
    SRC3: false,
    SRC4: false,
  });
  const [sinifiOlmayanlar, setSinifiOlmayanlar] = useState(false);
  const [arama, setArama] = useState('');
  const [aramaSonuc, setAramaSonuc] = useState(null);
  const [inaktifGizle, setInaktifGizle] = useState(true);
  const [sadeceInaktifler, setSadeceInaktifler] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Kullanıcı rolünü al

  useEffect(() => {
    const fetchKursiyerler = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        let apiUrl = '/kursiyer/liste';
        if (process.env.REACT_APP_API_URL) {
          apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/kursiyer/liste';
        }
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Kursiyerler alınamadı');
        }
        const data = await res.json();
        setKursiyerler(data);
      } catch (err) {
        setError(err.message || 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchKursiyerler();
  }, []);

  // Sınıfları çek
  useEffect(() => {
    const fetchSiniflar = async () => {
      try {
        const token = localStorage.getItem('token');
        let apiUrl = '/api/siniflar';
        if (process.env.REACT_APP_API_URL) {
          apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/api/siniflar';
        }
        const res = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Sınıflar alınamadı');
        const data = await res.json();
        setSiniflar(data);
      } catch (err) {
        // Sınıf yoksa hata gösterme
        setSiniflar([]);
      }
    };
    fetchSiniflar();
  }, []);

  // Arama işlemi
  useEffect(() => {
    const fetchArama = async () => {
      if (!arama || arama.length < 3) {
        setAramaSonuc(null);
        return;
      }
      const isNumber = /^\d+$/.test(arama);
      let type, value;
      if (isNumber) {
        type = 'tc';
        value = arama;
      } else {
        type = 'isim';
        value = arama;
      }
      try {
        const token = localStorage.getItem('token');
        let apiUrl = `/kursiyer/ara?type=${type}&value=${encodeURIComponent(value)}`;
        if (process.env.REACT_APP_API_URL) {
          apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/kursiyer/ara?type=${type}&value=${encodeURIComponent(value)}`;
        }
        const res = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Arama başarısız');
        let data = await res.json();
        // Küçük/büyük harf duyarsız arama
        if (type === 'isim' && value) {
          const valLower = value.toLocaleLowerCase('tr');
          data = data.filter(k =>
            (k.aday_ismi || '').toLocaleLowerCase('tr').includes(valLower)
          );
        }
        setAramaSonuc(data);
      } catch {
        setAramaSonuc([]);
      }
    };
    fetchArama();
  }, [arama]);

  // Sınıf ata modal aç
  const openSinifModal = (kursiyer) => {
    setSelectedKursiyer(kursiyer);
    setSelectedSinif(kursiyer.sinif || '');
    setModalError('');
    setModalOpen(true);
  };

  // Sınıf ata işlemi
  const handleSinifAta = async () => {
    if (!selectedSinif) {
      setModalError('Lütfen bir sınıf seçin.');
      return;
    }
    setAssigning(true);
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      let apiUrl = `/kursiyer/guncelle/${selectedKursiyer.id || selectedKursiyer.tc_kimlik}`;
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/kursiyer/guncelle/${selectedKursiyer.id || selectedKursiyer.tc_kimlik}`;
      }
      // Sadece sinif alanını güncelle
      const body = {
        sinif: selectedSinif
      };
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Sınıf atama başarısız');
      // Kursiyerler listesini güncelle
      setKursiyerler((prev) =>
        prev.map((k) =>
          (k.id || k.tc_kimlik) === (selectedKursiyer.id || selectedKursiyer.tc_kimlik)
            ? { ...k, sinif: selectedSinif }
            : k
        )
      );
      setModalOpen(false);
    } catch (err) {
      setModalError(err.message || 'Bir hata oluştu');
    } finally {
      setAssigning(false);
    }
  };

  // Sınıftan at işlemi
  const handleSiniftanAt = async () => {
    setAssigning(true);
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      let apiUrl = `/kursiyer/guncelle/${selectedKursiyer.id || selectedKursiyer.tc_kimlik}`;
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/kursiyer/guncelle/${selectedKursiyer.id || selectedKursiyer.tc_kimlik}`;
      }
      const body = {
        sinif: '',
        inaktif: 0
      };
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Sınıftan atma başarısız');
      setKursiyerler((prev) =>
        prev.map((k) =>
          (k.id || k.tc_kimlik) === (selectedKursiyer.id || selectedKursiyer.tc_kimlik)
            ? { ...k, sinif: '', inaktif: 0 }
            : k
        )
      );
      setModalOpen(false);
    } catch (err) {
      setModalError(err.message || 'Bir hata oluştu');
    } finally {
      setAssigning(false);
    }
  };

  // Filtre değişimi
  const handleDurumFiltreChange = (e) => {
    const name = e.target.name;
    const checked = e.target.checked;
    const updated = { ...durumFiltre, [name]: checked };
    setDurumFiltre(updated);

    // --- Otomatik Inaktifler Gizli kontrolü ---
    const allowed = ['SHDA', 'Kursu Tamamladi!', 'İptal'];
    const selected = Object.entries({ ...updated })
      .filter(([key, val]) => val)
      .map(([key]) => key);
    if (
      selected.length > 0 &&
      selected.every(k => allowed.includes(k))
    ) {
      setInaktifGizle(false); // Otomatik kapat
    }
  };

  const handleEgitimFiltreChange = (e) => {
    setEgitimFiltre({
      ...egitimFiltre,
      [e.target.name]: e.target.checked,
    });
  };

  // Filtrelenmiş kursiyerler
  const durumSeciliMi = Object.values(durumFiltre).some(Boolean);
  const egitimSeciliMi = Object.values(egitimFiltre).some(Boolean);
  const anaListe = aramaSonuc !== null ? aramaSonuc : kursiyerler;
  
  // Debug için console.log
  console.log('Filtreleme Debug:', {
    durumSeciliMi,
    egitimSeciliMi,
    durumFiltre,
    egitimFiltre,
    anaListeLength: anaListe.length,
    kursDurumlari: [...new Set(anaListe.map(k => k.kurs_durumu))],
    egitimler: [...new Set(anaListe.map(k => k.alacagi_egitim))]
  });
  
  // Önce durum ve eğitim filtrelerini uygula (inaktif filtresi hariç)
  const durumEgitimFiltreli = anaListe
    .filter((k) => {
      // Kurs durumu filtresi - case insensitive ve null/undefined kontrolü
      const kursDurumu = String(k.kurs_durumu || '').trim();
      const durumUygun = !durumSeciliMi || (durumFiltre[kursDurumu] === true);
      
      // Eğitim filtresi - case insensitive ve null/undefined kontrolü
      const alacagiEgitim = String(k.alacagi_egitim || '').trim();
      const egitimUygun =
        !egitimSeciliMi ||
        Object.entries(egitimFiltre).some(
          ([key, val]) => val === true && alacagiEgitim.toLowerCase() === key.toLowerCase()
        );
      
      // Sınıfı olmayanlar filtresi
      const sinifUygun = !sinifiOlmayanlar || !k.sinif || k.sinif.trim() === '';
      
      // Debug için her kursiyer için filtreleme sonucunu logla
      if (durumSeciliMi || egitimSeciliMi || sinifiOlmayanlar) {
        console.log('Kursiyer Filtreleme:', {
          aday_ismi: k.aday_ismi,
          kurs_durumu: kursDurumu,
          alacagi_egitim: alacagiEgitim,
          sinif: k.sinif,
          durumUygun,
          egitimUygun,
          sinifUygun,
          sonuc: durumUygun && egitimUygun && sinifUygun
        });
      }
      
      return durumUygun && egitimUygun && sinifUygun;
    });

  // Aktif ve inaktif kursiyer sayısı (durum ve eğitim filtrelerine göre, inaktif filtresi hariç)
  const aktifSayisi = durumEgitimFiltreli.filter(k => {
    const inaktif = k.inaktif;
    const isAktif = inaktif === 0 || inaktif === '0' || inaktif === false || !inaktif || inaktif === null || inaktif === undefined;
    return isAktif;
  }).length;
  const inaktifSayisi = durumEgitimFiltreli.filter(k => {
    const inaktif = k.inaktif;
    const isInaktif = inaktif === 1 || inaktif === '1' || inaktif === true;
    return isInaktif;
  }).length;
  
  // Debug için sayıları logla
  console.log('Sayı Hesaplama:', {
    toplamFiltreli: durumEgitimFiltreli.length,
    aktifSayisi,
    inaktifSayisi,
    toplamKontrol: aktifSayisi + inaktifSayisi
  });
  
  // Son olarak inaktif filtresini uygula
  const filteredKursiyerler = durumEgitimFiltreli
    .filter((k) => {
      const inaktif = k.inaktif;
      const isInaktif = inaktif === 1 || inaktif === '1' || inaktif === true;
      
      if (sadeceInaktifler) {
        // Sadece inaktifleri göster
        return isInaktif;
      } else {
        // Normal inaktif filtresi
        const inaktifUygun = !inaktifGizle || !isInaktif;
        return inaktifUygun;
      }
    })
    .sort(turkishCompare);
    
  // Debug için final sayıyı logla
  console.log('Final Filtreleme:', {
    filteredKursiyerlerLength: filteredKursiyerler.length,
    sadeceInaktifler,
    inaktifGizle
  });

  // --- YENİ: Toplam, Aktif, Inaktif sayıları (filtrelenmiş liste üzerinden) ---
  const toplamKursiyerSayisi = durumEgitimFiltreli.length;
  const toplamAktifSayisi = durumEgitimFiltreli.filter(k => (k.inaktif === 0 || k.inaktif === '0' || k.inaktif === false || !k.inaktif || k.inaktif === null || k.inaktif === undefined) && (k.arsiv === 0 || k.arsiv === '0' || !k.arsiv || k.arsiv === null || k.arsiv === undefined)).length;
  const toplamInaktifSayisi = durumEgitimFiltreli.filter(k => k.inaktif === 1 || k.inaktif === '1' || k.inaktif === true).length;

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  if (!kursiyerler.length) return <div>Kayıtlı kursiyer bulunamadı.</div>;

  // Excel indir fonksiyonu
  const handleExcelIndir = () => {
    if (!filteredKursiyerler.length) {
      alert('İndirilecek kursiyer bulunamadı.');
      return;
    }
    // Sadece ekranda görünen kolonları al
    const exportData = filteredKursiyerler.map(k => ({
      'Ad Soyad': k.aday_ismi,
      'Telefon': k.tel_no,
      'TC Kimlik': k.tc_kimlik,
      'Kurs Durumu': k.kurs_durumu,
      'Alacağı Eğitim': k.alacagi_egitim,
      'Devam Eğitimi': k.devam_egitimi,
      'Tutar': k.tutar,
      'Kalan': k.kalan,
      'Sınıf': k.sinif
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kursiyerler');
    XLSX.writeFile(wb, 'kursiyerler.xlsx');
  };

  // --- Inaktifler Gizli checkbox'unu disable et ---
  const selectedDurumlar = Object.entries(durumFiltre)
    .filter(([key, val]) => val)
    .map(([key]) => key);
  const inaktifGizleDisabled =
    selectedDurumlar.length > 0 &&
    selectedDurumlar.every(k => ['SHDA', 'Kursu Tamamladi!', 'İptal'].includes(k));

  return (
    <div>
      {/* Excel İndir Butonu */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={handleExcelIndir}
          style={{
            background: '#388e3c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 1px 4px #0001',
            transition: 'background 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#256029')}
          onMouseOut={e => (e.currentTarget.style.background = '#388e3c')}
        >
          Excel İndir
        </button>
      </div>
      {/* Kurs Durumu Filtreleri ve Arama Barı */}
      <div style={{ marginBottom: 8, display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>Kurs Durumu:</span>
          {/* Ana grup: Beklemede, Katiliyor, Fark, Özel Durum */}
          <label>
            <input
              type="checkbox"
              name="Beklemede"
              checked={durumFiltre.Beklemede}
              onChange={handleDurumFiltreChange}
            />{' '}
            Beklemede
          </label>
          <label>
            <input
              type="checkbox"
              name="Katiliyor"
              checked={durumFiltre.Katiliyor}
              onChange={handleDurumFiltreChange}
            />{' '}
            Katiliyor
          </label>
          <label>
            <input
              type="checkbox"
              name="Fark"
              checked={durumFiltre.Fark}
              onChange={handleDurumFiltreChange}
            />{' '}
            Fark
          </label>
          <label>
            <input
              type="checkbox"
              name="Firma"
              checked={durumFiltre.Firma}
              onChange={handleDurumFiltreChange}
            />{' '}
            Firma
          </label>
          <label>
            <input
              type="checkbox"
              name="Özel Durum"
              checked={durumFiltre["Özel Durum"]}
              onChange={handleDurumFiltreChange}
            />{' '}
            Özel Durum
          </label>
          {/* Ayrı grup: Tamamlayanlar, SHDA, İptal */}
          <span style={{
            display: 'inline-flex',
            gap: 10,
            alignItems: 'center',
            marginLeft: 24,
            padding: '4px 12px',
            background: '#f5f5f5',
            borderRadius: 6,
            border: '1px solid #e3e8ee',
            fontWeight: 500
          }}>
            <label>
              <input
                type="checkbox"
                name="Kursu Tamamladi!"
                checked={durumFiltre["Kursu Tamamladi!"]}
                onChange={handleDurumFiltreChange}
              />{' '}
              Tamamlayanlar
            </label>
            <label>
              <input
                type="checkbox"
                name="SHDA"
                checked={durumFiltre.SHDA}
                onChange={handleDurumFiltreChange}
              />{' '}
              SHDA
            </label>
            <label>
              <input
                type="checkbox"
                name="İptal"
                checked={durumFiltre["İptal"]}
                onChange={handleDurumFiltreChange}
              />{' '}
              İptal
            </label>
          </span>
        </div>
        <input
          type="text"
          placeholder="TC veya isim ile ara"
          value={arama}
          onChange={e => setArama(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
            minWidth: 180,
            fontSize: 13
          }}
        />
      </div>
      {/* Eğitim Filtreleri ve Inaktifleri Gizle */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>Alinan Eğitim:</span>
          <label>
            <input
              type="checkbox"
              name="SRC1"
              checked={egitimFiltre.SRC1}
              onChange={handleEgitimFiltreChange}
            />{' '}
            SRC1
          </label>
          <label>
            <input
              type="checkbox"
              name="SRC2"
              checked={egitimFiltre.SRC2}
              onChange={handleEgitimFiltreChange}
            />{' '}
            SRC2
          </label>
          <label>
            <input
              type="checkbox"
              name="SRC3"
              checked={egitimFiltre.SRC3}
              onChange={handleEgitimFiltreChange}
            />{' '}
            SRC3
          </label>
          <label>
            <input
              type="checkbox"
              name="SRC4"
              checked={egitimFiltre.SRC4}
              onChange={handleEgitimFiltreChange}
            />{' '}
            SRC4
          </label>
          <span style={{ marginLeft: 24 }}>
            <label>
              <input
                type="checkbox"
                checked={sinifiOlmayanlar}
                onChange={e => setSinifiOlmayanlar(e.target.checked)}
              />{' '}
              Sinifi Olmayanlar
            </label>
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '6px 12px',
            fontSize: 13,
            opacity: sadeceInaktifler ? 0.5 : 1
          }}>
            <input
              type="checkbox"
              checked={inaktifGizle}
              onChange={e => setInaktifGizle(e.target.checked)}
              disabled={sadeceInaktifler || inaktifGizleDisabled}
              style={{ accentColor: '#1976d2', width: 18, height: 18 }}
            />
            Inaktifler Gizli
          </label>
          <label style={{
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '6px 12px',
            fontSize: 13,
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={sadeceInaktifler}
              onChange={e => {
                setSadeceInaktifler(e.target.checked);
                if (e.target.checked) {
                  setInaktifGizle(false); // Sadece inaktifler seçilirse inaktif gizle'yi kapat
                } else {
                  setInaktifGizle(true); // Sadece inaktifler kapatılırsa inaktif gizle'yi aç
                }
              }}
              style={{ accentColor: '#1976d2', width: 18, height: 18 }}
            />
            Sadece Inaktifleri Göster
          </label>
        </div>
      </div>
      {/* --- BAŞLIK DEĞİŞTİ --- */}
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>
        Toplam Kursiyer: {toplamKursiyerSayisi} / Aktif: {toplamAktifSayisi} / Inaktif: {toplamInaktifSayisi}
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fafbfc', borderRadius: 8, boxShadow: '0 2px 8px #0001', overflow: 'hidden', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1976d2', color: '#fff', fontSize: 13 }}>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Ad Soyad</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Telefon</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>TC Kimlik</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Kurs Durumu</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Alacağı Eğitim</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Devam Eğitimi</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Tutar</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Kalan</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>Sınıf</th>
              <th style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredKursiyerler.map((k, idx) => (
              <tr
                key={k.id || k.tc_kimlik}
                style={{
                  background: idx % 2 === 0 ? '#fff' : '#f3f6fa',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                  fontSize: 13
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#e3f0fd')}
                onMouseOut={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f3f6fa')}
              >
                <td
                  style={{
                    border: '1px solid #e3e3e3',
                    padding: 8,
                    color: '#1976d2',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: 13
                  }}
                  onClick={() => navigate(`/kursiyer/${k.id || k.tc_kimlik}`)}
                >
                  {k.aday_ismi}
                </td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>{k.tel_no}</td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>{k.tc_kimlik}</td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>{k.kurs_durumu}</td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>{k.alacagi_egitim}</td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>{k.devam_egitimi}</td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>{k.tutar} ₺</td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>{k.kalan} ₺</td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>
                  {k.sinif || <span style={{ color: '#aaa' }}>-</span>}
                </td>
                <td style={{ border: '1px solid #e3e3e3', padding: 8, textAlign: 'center', fontSize: 13 }}>
                  {/* --- DEĞİŞTİ: Sadece admin rolü için butonları göster --- */}
                  {user?.role === 'admin' && (
                    <button
                      style={{
                        background: k.sinif ? '#d32f2f' : '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 10px', 
                        fontWeight: 600,
                        fontSize: 12, 
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px #0001',
                        transition: 'background 0.2s, box-shadow 0.2s'
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = k.sinif ? '#b71c1c' : '#1565c0')}
                      onMouseOut={e => (e.currentTarget.style.background = k.sinif ? '#d32f2f' : '#1976d2')}
                      onClick={() => openSinifModal(k)}
                    >
                      {k.sinif ? 'Sınıftan At' : 'Sınıf Ata'}
                    </button>
                  )}
                  <button
                    style={{
                      background: '#388e3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px', 
                      fontWeight: 600,
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8, 
                      boxShadow: '0 1px 4px #0001',
                      transition: 'background 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#256029')}
                    onMouseOut={e => (e.currentTarget.style.background = '#388e3c')}
                    onClick={() => navigate(`/kursiyer/${k.id || k.tc_kimlik}/belgeler`)}
                  >
                    Belgeler
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Sınıf Ata Modalı */}
      {/* --- DEĞİŞTİ: Modal sadece admin rolü için gösterilsin --- */}
      {modalOpen && user?.role === 'admin' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: '#0006', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, maxWidth: 400, boxShadow: '0 2px 12px #0002'
          }}>
            <h3 style={{ marginBottom: 16, color: '#1976d2' }}>
              {selectedKursiyer?.sinif ? 'Sınıftan At' : 'Sınıf Ata'}
            </h3>
            {selectedKursiyer?.sinif ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <span>
                    <b>{selectedKursiyer.aday_ismi}</b> isimli kursiyeri <b>{selectedKursiyer.sinif}</b> sınıfından çıkarmak istiyor musunuz?
                  </span>
                </div>
                {modalError && <div style={{ color: 'red', marginBottom: 8 }}>{modalError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '5px 10px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                    }}
                    disabled={assigning}
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleSiniftanAt}
                    style={{
                      background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                    }}
                    disabled={assigning}
                  >
                    Sınıftan At
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <select
                    value={selectedSinif}
                    onChange={e => setSelectedSinif(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  >
                    <option value="">Sınıf seçiniz</option>
                    {siniflar.map(s => (
                      <option key={s.id} value={s.sinif_isim}>{s.sinif_isim}</option>
                    ))}
                  </select>
                </div>
                {modalError && <div style={{ color: 'red', marginBottom: 8 }}>{modalError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '5px 10px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                    }}
                    disabled={assigning}
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleSinifAta}
                    style={{
                      background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                    }}
                    disabled={assigning}
                  >
                    Kaydet
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KursiyerList;