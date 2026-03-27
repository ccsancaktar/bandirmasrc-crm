import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const FILTRELER = [
  { key: "yazilidan_kalanlar", label: "Yazılıdan Kalanlar" },
  { key: "yazilidan_gecenler", label: "Yazılıdan Geçenler" },
  { key: "kursu_tamamlayanlar", label: "Kursu Tamamlayanlar" },
  { key: "sinav_listesi", label: "Sınav Listesi" },
];

export default function KursiyerSinavListesi() {
  const [filtre, setFiltre] = useState("yazilidan_kalanlar");
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filtre) return;
    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/sinavlar/filtreli?filtre=${filtre}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => setListe(res.data))
      .finally(() => setLoading(false));
  }, [filtre]);

  const handleExcel = () => {
    if (!liste.length) return;
    const ws = XLSX.utils.json_to_sheet(liste);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Liste");
    XLSX.writeFile(
      wb,
      `${FILTRELER.find((f) => f.key === filtre)?.label || "SinavListesi"}.xlsx`
    );
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "32px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)",
        padding: 32,
        minHeight: 600,
      }}
    >
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 24, color: "#1976d2" }}>
        Kursiyer Sınav Listesi
      </h2>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {FILTRELER.map((f) => (
          <label
            key={f.key}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f5f7fa",
              borderRadius: 6,
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: filtre === f.key ? 600 : 400,
              border: filtre === f.key ? "2px solid #1976d2" : "1px solid #e0e0e0",
              color: filtre === f.key ? "#1976d2" : "#222",
              transition: "all 0.2s",
              fontSize: 13, // font küçültüldü
            }}
          >
            <input
              type="radio"
              name="sinavFiltre"
              value={f.key}
              checked={filtre === f.key}
              onChange={() => setFiltre(f.key)}
              style={{ marginRight: 8, accentColor: "#1976d2" }}
            />
            {f.label}
          </label>
        ))}
        <button
          style={{
            marginLeft: 24,
            padding: "8px 22px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 15,
            cursor: loading || liste.length === 0 ? "not-allowed" : "pointer",
            opacity: loading || liste.length === 0 ? 0.6 : 1,
            boxShadow: "0 1px 4px 0 rgba(25,118,210,0.08)",
            transition: "background 0.2s",
          }}
          onClick={handleExcel}
          disabled={loading || liste.length === 0}
        >
          Excel Al
        </button>
      </div>
      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #e0e0e0" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fafbfc",
            fontSize: 15,
          }}
        >
          <thead>
            <tr style={{ background: "#e3eafc" }}>
              <th style={thStyle}>Adı Soyadı</th>
              <th style={thStyle}>Telefon</th>
              <th style={thStyle}>TC Kimlik</th>
              <th style={thStyle}>Alacağı Eğitim</th>
              <th style={thStyle}>Sınıf</th>
              <th style={thStyle}>Durum</th>
              <th style={thStyle}>Yazılı 1</th>
              <th style={thStyle}>Yazılı 2</th>
              <th style={thStyle}>Yazılı 3</th>
              <th style={thStyle}>Yazılı 4</th>
              <th style={thStyle}>Uygulama 1</th>
              <th style={thStyle}>Uygulama 2</th>
              <th style={thStyle}>Uygulama 3</th>
              <th style={thStyle}>Uygulama 4</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={14} style={tdCenterStyle}>
                  Yükleniyor...
                </td>
              </tr>
            ) : liste.length === 0 ? (
              <tr>
                <td colSpan={14} style={tdCenterStyle}>
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              liste.map((k, i) => {
                // Sinav Ücreti Dahil durumu kontrolü
                const sinavUcretiDahil = k.sinav_ucreti_dahil === 1;
                const hicSinavGirilmemis = !k.sinav_1 && !k.sinav_2 && !k.sinav_3 && !k.sinav_4 && 
                                          !k.uygulama_1 && !k.uygulama_2 && !k.uygulama_3 && !k.uygulama_4;
                
                // Durum metni ve stili
                let durumText = "";
                let durumStyle = { ...tdStyle };
                
                if (sinavUcretiDahil && hicSinavGirilmemis) {
                  durumText = "SINAV ÜCRETİ DAHİL";
                  durumStyle = { 
                    ...tdStyle, 
                    fontWeight: 700, 
                    color: "#d32f2f", 
                    background: "#ffebee",
                    borderRadius: "4px",
                    padding: "6px 8px"
                  };
                } else if (sinavUcretiDahil) {
                  durumText = "Ücret Dahil";
                  durumStyle = { ...tdStyle, color: "#1976d2", fontWeight: 600 };
                } else {
                  durumText = "Ücret Dahil Değil";
                  durumStyle = { ...tdStyle, color: "#666" };
                }
                
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f5f7fa" }}>
                    <td style={tdStyle}>{k.aday_ismi}</td>
                    <td style={tdStyle}>{k.tel_no}</td>
                    <td style={tdStyle}>{k.tc_kimlik}</td>
                    <td style={tdStyle}>{k.alacagi_egitim}</td>
                    <td style={tdStyle}>{k.sinif}</td>
                    <td style={durumStyle}>{durumText}</td>
                    <td style={tdStyle}>{k.sinav_1}</td>
                    <td style={tdStyle}>{k.sinav_2}</td>
                    <td style={tdStyle}>{k.sinav_3}</td>
                    <td style={tdStyle}>{k.sinav_4}</td>
                    <td style={tdStyle}>{k.uygulama_1}</td>
                    <td style={tdStyle}>{k.uygulama_2}</td>
                    <td style={tdStyle}>{k.uygulama_3}</td>
                    <td style={tdStyle}>{k.uygulama_4}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Tablo başlık ve hücre stilleri
const thStyle = {
  padding: "10px 8px",
  borderBottom: "2px solid #cfd8dc",
  fontWeight: 700,
  color: "#1976d2",
  textAlign: "center",
  background: "#e3eafc",
};

const tdStyle = {
  padding: "8px 6px",
  borderBottom: "1px solid #e0e0e0",
  textAlign: "center",
};

const tdCenterStyle = {
  ...tdStyle,
  textAlign: "center",
  color: "#888",
  fontStyle: "italic",
};
