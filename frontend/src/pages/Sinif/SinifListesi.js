import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // AuthContext'ten user al

const API_URL = process.env.REACT_APP_API_URL || "";

const SinifListesi = () => {
  const [sinifAdi, setSinifAdi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [siniflar, setSiniflar] = useState([]);
  const [listeLoading, setListeLoading] = useState(false);
  const [kursiyerler, setKursiyerler] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelResult, setExcelResult] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // user bilgisini al

  const fetchSiniflar = async () => {
    setListeLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      // DÜZELTİLDİ: /api/sinif -> /api/siniflar
      const response = await fetch(`${API_URL}/api/siniflar`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        throw new Error("Sınıf listesi alınamadı.");
      }
      const data = await response.json();
      setSiniflar(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setListeLoading(false);
    }
  };

  // Kursiyerleri çek
  const fetchKursiyerler = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/kursiyer/liste`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        throw new Error("Kursiyer listesi alınamadı.");
      }
      const data = await response.json();
      setKursiyerler(data);
    } catch (err) {
      // Kursiyer yoksa hata gösterme
      setKursiyerler([]);
    }
  };

  useEffect(() => {
    fetchSiniflar();
    fetchKursiyerler();
    // eslint-disable-next-line
  }, []);

  const handleSinifAc = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/sinif`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          sinif_isim: sinifAdi,
          kursiyer_sayi: 0,
          kursiyer_list: [],
        }),
      });

      const contentType = response.headers.get("content-type");
      let data = null;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          "Sunucudan beklenmeyen cevap alındı: " +
            (text.length < 200 ? text : text.slice(0, 200) + "...")
        );
      }

      if (!response.ok) {
        throw new Error(data.detail || "Sınıf açılamadı.");
      }
      setSinifAdi("");
      fetchSiniflar();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSinifSil = async (id) => {
    if (!window.confirm("Bu sınıfı silmek istediğinize emin misiniz?")) return;
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/sinif/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Sınıf silinemedi.");
      }
      fetchSiniflar();
    } catch (err) {
      setError(err.message);
    }
  };

  // Excel yükleme fonksiyonu
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelLoading(true);
    setExcelResult(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/api/siniflar/yukle`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Excel yüklenemedi.");
      }
      setExcelResult(data);
      fetchSiniflar();
    } catch (err) {
      setError(err.message);
    } finally {
      setExcelLoading(false);
      e.target.value = ""; // Aynı dosya tekrar seçilebilsin
    }
  };

  return (
    <div>
      {/* Excel yükleme alanı (sadece admin) */}
      {user && user.role === "admin" && (
        <div style={{ marginBottom: 24 }}>
          <label>
            <b>Sınıf Excel Yükle (.xlsx):</b>
            <input
              type="file"
              accept=".xlsx"
              style={{ marginLeft: 12 }}
              onChange={handleExcelUpload}
              disabled={excelLoading}
            />
          </label>
          {excelLoading && <span style={{ marginLeft: 12 }}>Yükleniyor...</span>}
          {excelResult && (
            <div style={{ color: "green", marginTop: 8 }}>
              {excelResult.imported} kayıt eklendi.
              {excelResult.errors && excelResult.errors.length > 0 && (
                <div style={{ color: "red", marginTop: 4 }}>
                  <b>Hatalar:</b>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {excelResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Sadece admin ise sınıf açma formunu göster */}
      {user && user.role === "admin" && (
        <>
          <h2>Sınıf Aç</h2>
          <form onSubmit={handleSinifAc}>
            <label>
              Sınıf Adı:
              <input
                type="text"
                value={sinifAdi}
                onChange={(e) => setSinifAdi(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Açılıyor..." : "Sınıf Aç"}
            </button>
          </form>
        </>
      )}
      {user && user.role === "user" && (
        <div style={{color:"#e53935",marginBottom:18,fontWeight:600}}>
          Sınıf ekleme/silme yetkiniz yok. Sadece sınıf listesini ve detaylarını görüntüleyebilirsiniz.
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <h2>Mevcut Sınıflar</h2>
      {listeLoading ? (
        <div>Yükleniyor...</div>
      ) : (
        <table
          style={{
            minWidth: "700px",
            borderCollapse: "collapse",
            marginTop: "20px",
            boxShadow: "0 2px 8px #eee",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Sınıf Adı</th>
              <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Kursiyer Sayısı</th>
              {/* Sadece admin için işlem sütunu */}
              {user && user.role === "admin" && (
                <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>İşlem</th>
              )}
            </tr>
          </thead>
          <tbody>
            {siniflar.length === 0 ? (
              <tr>
                <td colSpan={user && user.role === "admin" ? 3 : 2} style={{ textAlign: "center", padding: "16px" }}>Kayıtlı sınıf yok.</td>
              </tr>
            ) : (
              siniflar.map((sinif) => {
                const kursiyerSayisi = kursiyerler.filter(
                  (k) => k.sinif === sinif.sinif_isim
                ).length;
                return (
                  <tr key={sinif.id}>
                    <td
                      style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center",
                        color: "#1976d2",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => navigate(`/sinif/${sinif.id}`, { state: { sinif_isim: sinif.sinif_isim } })}
                    >
                      {sinif.sinif_isim}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                      {kursiyerSayisi}
                    </td>
                    {/* Sadece admin için sil butonu */}
                    {user && user.role === "admin" && (
                      <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                        <button
                          style={{
                            color: "white",
                            background: "red",
                            border: "none",
                            borderRadius: "4px",
                            padding: "6px 14px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleSinifSil(sinif.id)}
                        >
                          Sil
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SinifListesi;