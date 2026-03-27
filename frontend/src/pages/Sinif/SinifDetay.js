import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const API_URL = process.env.REACT_APP_API_URL || "";

const SinifDetay = () => {
  const location = useLocation();
  const sinifIsmi = location.state && location.state.sinif_isim;
  const { id } = useParams();
  const [kursiyerler, setKursiyerler] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKursiyerler = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/kursiyer/liste`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) throw new Error("Kursiyerler alınamadı");
        const data = await response.json();
        setKursiyerler(data);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        setKursiyerler([]);
      } finally {
        setLoading(false);
      }
    };
    fetchKursiyerler();
  }, []);

  // Sadece bu sınıfa ait kursiyerler
  const filtered = kursiyerler.filter(
    (k) => k.sinif === sinifIsmi
  );

  // Türkçe alfabetik sıralama
  const turkishSortKey = (name) => {
    // Türkçe karakterleri ASCII karşılıklarına çevir
    const turkishChars = {
      'Ç': 'C', 'ç': 'c',
      'Ğ': 'G', 'ğ': 'g', 
      'İ': 'I', 'ı': 'i',
      'Ö': 'O', 'ö': 'o',
      'Ş': 'S', 'ş': 's',
      'Ü': 'U', 'ü': 'u'
    };
    
    let converted = "";
    for (let char of name) {
      converted += turkishChars[char] || char;
    }
    
    return converted.toLowerCase();
  };

  // Filtrelenmiş kursiyerleri Türkçe alfabetik sıraya göre sırala
  const sortedKursiyerler = filtered.sort((a, b) => 
    turkishSortKey(a.aday_ismi).localeCompare(turkishSortKey(b.aday_ismi))
  );

  // Tarih formatını GG.AA.YYYY'ye çeviren fonksiyon
  const formatDateTR = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}.${month}.${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Excel çıktısı için
  const handleExcel = () => {
    if (!sortedKursiyerler.length) return;
    
    const data = sortedKursiyerler.map((k) => {
      return {
        "Ad Soyad": k.aday_ismi,
        "Telefon": k.tel_no,
        "Telefon Yakın": k.tel_yakin,
        "TC Kimlik": k.tc_kimlik,
        "Kurs Durumu": k.kurs_durumu,
        "Alacağı Eğitim": k.alacagi_egitim,
        "Devam Eğitimi": k.devam_egitimi,
        "Tutar": k.tutar,
        "Tarih 1": k.tarih_1,
        "Ödeme 1": k.odeme_1,
        "Tarih 2": k.tarih_2,
        "Ödeme 2": k.odeme_2,
        "Tarih 3": k.tarih_3,
        "Ödeme 3": k.odeme_3,
        "Tarih 4": k.tarih_4,
        "Ödeme 4": k.odeme_4,
        "Tarih 5": k.tarih_5,
        "Ödeme 5": k.odeme_5,
        "Tarih 6": k.tarih_6,
        "Ödeme 6": k.odeme_6,
        "Kalan": k.kalan,
        "Açıklama": k.aciklama,
        "Evrak Kayıt Tarihi": k.evrak_kayit_tarihi ? formatDateTR(k.evrak_kayit_tarihi) : '',
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kursiyerler");
    XLSX.writeFile(wb, `${sinifIsmi || "Sinif"}_Kursiyerler.xlsx`);
  };

  return (
    <div style={{ margin: "40px", fontSize: "1.3rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <strong>
          {sinifIsmi ? sinifIsmi : `Sınıf ${id}`}
        </strong>
        <button
          style={{
            marginLeft: 12,
            padding: "6px 18px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: filtered.length === 0 ? "not-allowed" : "pointer",
            opacity: filtered.length === 0 ? 0.6 : 1,
            boxShadow: "0 1px 4px 0 rgba(25,118,210,0.08)",
            transition: "background 0.2s",
          }}
          onClick={handleExcel}
          disabled={filtered.length === 0}
        >
          Excel Al
        </button>
      </div>
      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div>Katilimci Yok</div>
        ) : (
          <table style={{ borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Ad Soyad</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Telefon</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>TC Kimlik</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Alacağı Eğitim</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Devam Eğitimi</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Tutar</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Kalan</th>
              </tr>
            </thead>
            <tbody>
              {sortedKursiyerler.map((k) => (
                <tr key={k.id || k.tc_kimlik}>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: 8,
                      color: "#1976d2",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                    onClick={() => navigate(`/kursiyer/${k.id || k.tc_kimlik}`)}
                  >
                    {k.aday_ismi}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{k.tel_no}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{k.tc_kimlik}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{k.alacagi_egitim}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{k.devam_egitimi}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{k.tutar}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{k.kalan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SinifDetay;
