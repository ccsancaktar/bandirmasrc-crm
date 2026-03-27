import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Yedek = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);

  if (!user || user.role !== "admin") {
    return (
      <div style={{
        color: "red",
        marginTop: 32,
        background: "#fff3f3",
        border: "1px solid #ffcccc",
        borderRadius: 8,
        padding: 24,
        maxWidth: 400,
        marginLeft: "auto",
        marginRight: "auto",
        textAlign: "center"
      }}>
        Bu sayfaya sadece admin kullanıcılar erişebilir.
      </div>
    );
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setErrors([]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    setErrors([]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        process.env.REACT_APP_API_URL + "/yedek/kursiyer-yukle",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(res.data);
      setErrors(res.data.errors || []);
    } catch (err) {
      setErrors([err.response?.data?.detail || "Yükleme sırasında hata oluştu."]);
    }
    setLoading(false);
  };

  const handleDbDownload = async () => {
    setDbLoading(true);
    setErrors([]);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
      const res = await axios.get(
        apiUrl + "/yedek/db-indir",
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bandirma.db");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrors([err.response?.data?.detail || "Veritabanı indirilemedi."]);
    }
    setDbLoading(false);
  };

  return (
    <div style={{
      maxWidth: 480,
      margin: "40px auto",
      background: "#f9f9f9",
      borderRadius: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      padding: 32
    }}>
      <h2 style={{ textAlign: "center", color: "#1976d2", marginBottom: 32 }}>Kursiyer Yedek Yükle</h2>
      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ fontWeight: 500, marginBottom: 4 }}>Excel Dosyası (.xlsx):</label>
        <input
          type="file"
          accept=".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
          required
          style={{
            padding: "8px 0",
            border: "1px solid #ccc",
            borderRadius: 4,
            background: "#fff"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "10px 0",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8
          }}
        >
          {loading ? "Yükleniyor..." : "Yükle"}
        </button>
      </form>
      {result && (
        <div style={{
          marginTop: 20,
          background: "#e8f5e9",
          border: "1px solid #b2dfdb",
          borderRadius: 6,
          padding: 12,
          color: "#388e3c"
        }}>
          <b>Başarıyla eklenen kursiyer sayısı:</b> {result.imported}
        </div>
      )}
      <div style={{
        marginTop: 40,
        paddingTop: 24,
        borderTop: "1px solid #eee"
      }}>
        <h3 style={{ color: "#1976d2", marginBottom: 16 }}>Veritabanı Yedeği Al</h3>
        <button
          onClick={handleDbDownload}
          disabled={dbLoading}
          style={{
            background: "#388e3c",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "10px 24px",
            fontWeight: 600,
            cursor: dbLoading ? "not-allowed" : "pointer"
          }}
        >
          {dbLoading ? "İndiriliyor..." : "İndir"}
        </button>
      </div>
      {errors && errors.length > 0 && (
        <div style={{
          color: "#c62828",
          background: "#fff3f3",
          border: "1px solid #ffcccc",
          borderRadius: 6,
          marginTop: 24,
          padding: 12
        }}>
          <b>Hatalar:</b>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Yedek;