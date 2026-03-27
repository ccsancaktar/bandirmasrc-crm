import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const Rapor = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tamamlayanlar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Kursu Tamamlayan Kullanicilar state
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [tamamlayanlarListe, setTamamlayanlarListe] = useState([]);

  // Eksik Evragi Olanlar state
  const [eksikEvrakListe, setEksikEvrakListe] = useState([]);

  // Katilanlar ve Farklar state
  const [katilanlarListe, setKatilanlarListe] = useState([]);
  const [farklarListe, setFarklarListe] = useState([]);

  // Muhasebe state
  const [muhasebeListe, setMuhasebeListe] = useState([]);

  // Kursu Tamamlayan Kullanicilar raporu
  const getTamamlayanlarRaporu = async () => {
    if (!baslangicTarihi || !bitisTarihi) {
      setError('Başlangıç ve bitiş tarihi seçiniz.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/rapor/tamamlayanlar`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            baslangic_tarihi: baslangicTarihi,
            bitis_tarihi: bitisTarihi
          }
        }
      );
      setTamamlayanlarListe(response.data);
      setSuccess(`${response.data.length} kursiyer bulundu.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Rapor alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Eksik Evragi Olanlar raporu
  const getEksikEvrakRaporu = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/rapor/eksik-evrak`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEksikEvrakListe(response.data);
      setSuccess(`${response.data.length} kursiyer bulundu.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Rapor alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Katilanlar raporu
  const getKatilanlarRaporu = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/rapor/katilanlar`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setKatilanlarListe(response.data);
      setSuccess(`${response.data.length} kursiyer bulundu.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Rapor alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Farklar raporu
  const getFarklarRaporu = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/rapor/farklar`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFarklarListe(response.data);
      setSuccess(`${response.data.length} kursiyer bulundu.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Rapor alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Muhasebe raporu
  const getMuhasebeRaporu = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/rapor/muhasebe`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMuhasebeListe(response.data);
      setSuccess(`${response.data.length} kursiyer bulundu.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Rapor alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Excel export
  const exportToExcel = (data, filename) => {
    if (!data.length) {
      setError('Dışa aktarılacak veri bulunamadı.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapor");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    setSuccess('Excel dosyası başarıyla indirildi.');
  };

  // Navigate to kursiyer detail
  const handleKursiyerClick = (kursiyerId) => {
    navigate(`/kursiyer/${kursiyerId}`);
  };

  // Tablo stilleri
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const thStyle = {
    backgroundColor: '#1976d2',
    color: 'white',
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px'
  };

  const tdStyle = {
    padding: '10px 8px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px'
  };

  const trStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
  });

  const containerStyle = {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  };

  const tabStyle = (active) => ({
    padding: '12px 24px',
    marginRight: '8px',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    backgroundColor: active ? '#1976d2' : '#e0e0e0',
    color: active ? 'white' : '#333',
    cursor: 'pointer',
    fontWeight: active ? '600' : '400',
    fontSize: '16px'
  });

  const buttonStyle = {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginRight: '10px'
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginRight: '10px'
  };

  const clickableNameStyle = {
    color: '#1976d2',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '500'
  };

  // Katilanlar Excel
  const exportKatilanlarExcel = () => {
    if (!katilanlarListe.length) return setError('Dışa aktarılacak veri bulunamadı.');
    const data = katilanlarListe.map(k => ({
      'Ad Soyad': k.aday_ismi,
      'TC Kimlik': k.tc_kimlik,
      'Telefon': k.tel_no,
      'Sınıf': k.sinif,
      'En Son Sınav': k.last_exam ? `${k.last_exam.tip} (${k.last_exam.tarih}): ${k.last_exam.deger}` : '-'
    }));
    exportToExcel(data, 'Katilan_Kursiyerler');
  };

  // Farklar Excel
  const exportFarklarExcel = () => {
    if (!farklarListe.length) return setError('Dışa aktarılacak veri bulunamadı.');
    const data = farklarListe.map(k => ({
      'Ad Soyad': k.aday_ismi,
      'TC Kimlik': k.tc_kimlik,
      'Telefon': k.tel_no,
      'Sınıf': k.sinif,
      'Alacağı Eğitim': k.alacagi_egitim,
      'Devam Eğitimi': k.devam_egitimi
    }));
    exportToExcel(data, 'Fark_Kursiyerler');
  };

  // Muhasebe Excel
  const exportMuhasebeExcel = () => {
    if (!muhasebeListe.length) return setError('Dışa aktarılacak veri bulunamadı.');
    const data = muhasebeListe.map(k => ({
      'Ad Soyad': k.aday_ismi,
      'TC Kimlik': k.tc_kimlik,
      'Telefon': k.tel_no,
      'Sınıf': k.sinif,
      'Alacağı Eğitim': k.alacagi_egitim,
      'Devam Eğitimi': k.devam_egitimi,
      'Toplam Tutar': k.tutar,
      'Kalan Borç': k.kalan,
      'Ödeme Durumu': k.odeme_durumu
    }));
    exportToExcel(data, 'Muhasebe_Raporu');
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '30px' }}>
        Raporlama Sistemi
      </h1>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button
          style={tabStyle(activeTab === 'tamamlayanlar')}
          onClick={() => setActiveTab('tamamlayanlar')}
        >
          Kursu Tamamlayan Kullanicilar
        </button>
        <button
          style={tabStyle(activeTab === 'eksik-evrak')}
          onClick={() => setActiveTab('eksik-evrak')}
        >
          Beklemede Olanlar (Eksik Evrak/Ödeme)
        </button>
        <button
          style={tabStyle(activeTab === 'katilanlar')}
          onClick={() => setActiveTab('katilanlar')}
        >
          Katılanlar
        </button>
        <button
          style={tabStyle(activeTab === 'farklar')}
          onClick={() => setActiveTab('farklar')}
        >
          Fark Olanlar
        </button>
        <button
          style={tabStyle(activeTab === 'muhasebe')}
          onClick={() => setActiveTab('muhasebe')}
        >
          Muhasebe
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      {/* Kursu Tamamlayan Kullanicilar Tab */}
      {activeTab === 'tamamlayanlar' && (
        <div style={cardStyle}>
          <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>
            Kursu Tamamlayan Kullanicilar
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: '500' }}>
              Başlangıç Tarihi:
            </label>
            <input
              type="date"
              value={baslangicTarihi}
              onChange={(e) => setBaslangicTarihi(e.target.value)}
              style={inputStyle}
            />
            
            <label style={{ marginRight: '10px', marginLeft: '20px', fontWeight: '500' }}>
              Bitiş Tarihi:
            </label>
            <input
              type="date"
              value={bitisTarihi}
              onChange={(e) => setBitisTarihi(e.target.value)}
              style={inputStyle}
            />
            
            <button
              onClick={getTamamlayanlarRaporu}
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'Yükleniyor...' : 'Rapor Al'}
            </button>
            
            {tamamlayanlarListe.length > 0 && (
              <button
                onClick={() => exportToExcel(tamamlayanlarListe, 'Kursu_Tamamlayan_Kullanicilar')}
                style={{ ...buttonStyle, backgroundColor: '#28a745' }}
              >
                Excel İndir
              </button>
            )}
          </div>

          {tamamlayanlarListe.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Aday İsmi</th>
                  <th style={thStyle}>TC Kimlik</th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle}>Sınıf</th>
                  <th style={thStyle}>Aldığı Eğitim</th>
                  <th style={thStyle}>Devam Eğitimi</th>
                </tr>
              </thead>
              <tbody>
                {tamamlayanlarListe.map((kursiyer, index) => (
                  <tr key={index} style={trStyle(index)}>
                    <td style={tdStyle}>
                      <span 
                        style={clickableNameStyle}
                        onClick={() => handleKursiyerClick(kursiyer.id || kursiyer.tc_kimlik)}
                        title="Kursiyer detayını görüntüle"
                      >
                        {kursiyer.aday_ismi}
                      </span>
                    </td>
                    <td style={tdStyle}>{kursiyer.tc_kimlik}</td>
                    <td style={tdStyle}>{kursiyer.tel_no}</td>
                    <td style={tdStyle}>{kursiyer.sinif}</td>
                                         <td style={tdStyle}>{kursiyer.alacagi_egitim}</td>
                     <td style={tdStyle}>{kursiyer.devam_egitimi || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Katilanlar Tab */}
      {activeTab === 'katilanlar' && (
        <div style={cardStyle}>
          <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>
            Katılan Kursiyerler
          </h2>
          <button onClick={getKatilanlarRaporu} style={buttonStyle} disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Rapor Al'}
          </button>
          {katilanlarListe.length > 0 && (
            <button onClick={exportKatilanlarExcel} style={{ ...buttonStyle, backgroundColor: '#28a745' }}>
              Excel İndir
            </button>
          )}
          {katilanlarListe.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Ad Soyad</th>
                  <th style={thStyle}>TC Kimlik</th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle}>Sınıf</th>
                  <th style={thStyle}>En Son Sınav</th>
                </tr>
              </thead>
              <tbody>
                {katilanlarListe.map((k, idx) => (
                  <tr key={idx} style={trStyle(idx)}>
                    <td style={tdStyle}>
                      <span
                        style={clickableNameStyle}
                        onClick={() => handleKursiyerClick(k.id || k.tc_kimlik)}
                        title="Kursiyer detayını görüntüle"
                      >
                        {k.aday_ismi}
                      </span>
                    </td>
                    <td style={tdStyle}>{k.tc_kimlik}</td>
                    <td style={tdStyle}>{k.tel_no}</td>
                    <td style={tdStyle}>{k.sinif}</td>
                    <td style={tdStyle}>{k.last_exam ? `${k.last_exam.tip} (${k.last_exam.tarih}): ${k.last_exam.deger}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Farklar Tab */}
      {activeTab === 'farklar' && (
        <div style={cardStyle}>
          <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>
            Fark Olan Kursiyerler
          </h2>
          <button onClick={getFarklarRaporu} style={buttonStyle} disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Rapor Al'}
          </button>
          {farklarListe.length > 0 && (
            <button onClick={exportFarklarExcel} style={{ ...buttonStyle, backgroundColor: '#28a745' }}>
              Excel İndir
            </button>
          )}
          {farklarListe.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Ad Soyad</th>
                  <th style={thStyle}>TC Kimlik</th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle}>Sınıf</th>
                  <th style={thStyle}>Alacağı Eğitim</th>
                  <th style={thStyle}>Devam Eğitimi</th>
                </tr>
              </thead>
              <tbody>
                {farklarListe.map((k, idx) => (
                  <tr key={idx} style={trStyle(idx)}>
                    <td style={tdStyle}>
                      <span
                        style={clickableNameStyle}
                        onClick={() => handleKursiyerClick(k.id || k.tc_kimlik)}
                        title="Kursiyer detayını görüntüle"
                      >
                        {k.aday_ismi}
                      </span>
                    </td>
                    <td style={tdStyle}>{k.tc_kimlik}</td>
                    <td style={tdStyle}>{k.tel_no}</td>
                    <td style={tdStyle}>{k.sinif}</td>
                    <td style={tdStyle}>{k.alacagi_egitim}</td>
                    <td style={tdStyle}>{k.devam_egitimi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Beklemede Olanlar Tab */}
      {activeTab === 'eksik-evrak' && (
        <div style={cardStyle}>
          <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>
            Beklemede Olanlar (Eksik Evrak/Ödeme)
          </h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
            Bu rapor, "Beklemede" durumunda olan kursiyerleri listeler. Evrak veya ödeme eksikse ilgili sütunda gösterilir, eksik yoksa "TAM" yazar.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={getEksikEvrakRaporu}
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'Yükleniyor...' : 'Rapor Al'}
            </button>
            {eksikEvrakListe.length > 0 && (
              <button
                onClick={() => exportToExcel(eksikEvrakListe.map(k => ({
                  'Ad Soyad': k.aday_ismi,
                  'TC Kimlik': k.tc_kimlik,
                  'Telefon': k.tel_no,
                  'Sınıf': k.sinif,
                  'Alacağı Eğitim': k.alacagi_egitim,
                  'Eksik Evraklar': getEksikEvrakText(k),
                  'Eksik Ödeme': getEksikOdemeText(k),
                  'Ödeme 1': k.odeme1 || '-',
                  'Tarih 1': k.tarih1 || '-',
                  'Ödeme 2': k.odeme2 || '-',
                  'Tarih 2': k.tarih2 || '-',
                  'Ödeme 3': k.odeme3 || '-',
                  'Tarih 3': k.tarih3 || '-',
                  'Ödeme 4': k.odeme4 || '-',
                  'Tarih 4': k.tarih4 || '-',
                  'Ödeme 5': k.odeme5 || '-',
                  'Tarih 5': k.tarih5 || '-',
                  'Ödeme 6': k.odeme6 || '-',
                  'Tarih 6': k.tarih6 || '-',
                  'Kalan': k.kalan || '-'
                })), 'Beklemede_Olanlar')}
                style={{ ...buttonStyle, backgroundColor: '#28a745' }}
              >
                Excel İndir
              </button>
            )}
          </div>
          {eksikEvrakListe.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Ad Soyad</th>
                  <th style={thStyle}>TC Kimlik</th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle}>Sınıf</th>
                  <th style={thStyle}>Alacağı Eğitim</th>
                  <th style={thStyle}>Eksik Evraklar</th>
                  <th style={thStyle}>Eksik Ödeme</th>
                </tr>
              </thead>
              <tbody>
                {eksikEvrakListe.map((k, idx) => (
                  <tr key={idx} style={trStyle(idx)}>
                    <td style={tdStyle}>
                      <span
                        style={clickableNameStyle}
                        onClick={() => handleKursiyerClick(k.id || k.tc_kimlik)}
                        title="Kursiyer detayını görüntüle"
                      >
                        {k.aday_ismi}
                      </span>
                    </td>
                    <td style={tdStyle}>{k.tc_kimlik}</td>
                    <td style={tdStyle}>{k.tel_no}</td>
                    <td style={tdStyle}>{k.sinif}</td>
                    <td style={tdStyle}>{k.alacagi_egitim}</td>
                    <td style={tdStyle}>{getEksikEvrakText(k)}</td>
                    <td style={tdStyle}>{getEksikOdemeText(k)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Muhasebe Tab */}
      {activeTab === 'muhasebe' && (
        <div style={cardStyle}>
          <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>
            Muhasebe Raporu
          </h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
            Bu rapor, kalan borcu olan (kalan {'>'} 0) tüm kursiyerleri listeler. Borç miktarına göre azalan sırada gösterilir.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={getMuhasebeRaporu}
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'Yükleniyor...' : 'Rapor Al'}
            </button>
            {muhasebeListe.length > 0 && (
              <button
                onClick={exportMuhasebeExcel}
                style={{ ...buttonStyle, backgroundColor: '#28a745' }}
              >
                Excel İndir
              </button>
            )}
          </div>
          {muhasebeListe.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Ad Soyad</th>
                  <th style={thStyle}>TC Kimlik</th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle}>Sınıf</th>
                  <th style={thStyle}>Alacağı Eğitim</th>
                  <th style={thStyle}>Devam Eğitimi</th>
                  <th style={thStyle}>Toplam Tutar</th>
                  <th style={thStyle}>Kalan Borç</th>
                  <th style={thStyle}>Ödeme Durumu</th>
                </tr>
              </thead>
              <tbody>
                {muhasebeListe.map((k, idx) => (
                  <tr key={idx} style={trStyle(idx)}>
                    <td style={tdStyle}>
                      <span
                        style={clickableNameStyle}
                        onClick={() => handleKursiyerClick(k.id || k.tc_kimlik)}
                        title="Kursiyer detayını görüntüle"
                      >
                        {k.aday_ismi}
                      </span>
                    </td>
                    <td style={tdStyle}>{k.tc_kimlik}</td>
                    <td style={tdStyle}>{k.tel_no}</td>
                    <td style={tdStyle}>{k.sinif}</td>
                    <td style={tdStyle}>{k.alacagi_egitim}</td>
                    <td style={tdStyle}>{k.devam_egitimi || '-'}</td>
                    <td style={tdStyle}>{k.tutar ? `${k.tutar} ₺` : '-'}</td>
                    <td style={tdStyle}>
                      <span style={{ 
                        color: '#d32f2f', 
                        fontWeight: '600',
                        fontSize: '15px'
                      }}>
                        {k.kalan ? `${k.kalan} ₺` : '-'}
                      </span>
                    </td>
                    <td style={tdStyle}>{k.odeme_durumu || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Rapor;

// Yardımcı fonksiyonlar
function getEksikEvrakText(k) {
  const evraklar = [
    { key: 'ogrenim_belgesi', label: 'Öğrenim Belgesi' },
    { key: 'adres_belgesi', label: 'Adres Belgesi' },
    { key: 'adli_sicil', label: 'Adli Sicil' },
    { key: 'ehliyet', label: 'Ehliyet' },
    { key: 'kimlik_belgesi', label: 'Kimlik Belgesi' },
    { key: 'fotograf', label: 'Fotoğraf' },
    { key: 'basvuru_formu', label: 'Başvuru Formu' },
    { key: 'e_src_kaydi', label: 'E-SRC Kaydı' },
  ];
  const eksik = evraklar.filter(e => k[e.key] !== 1).map(e => e.label);
  return eksik.length === 0 ? 'TAM' : eksik.join(', ');
}
function getEksikOdemeText(k) {
  return (k.kalan && Number(k.kalan) > 0) ? `${k.kalan} ₺` : 'TAM';
}
