import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { useAuth } from '../../context/AuthContext';

const BELGE_TIPLERI = [
  { key: 'foto', label: 'Fotoğraf' },
  { key: 'adli_sicil', label: 'Adli Sicil' },
  { key: 'ogrenim_belgesi', label: 'Öğrenim Belgesi' },
  { key: 'adres_belgesi', label: 'Adres Belgesi' },
  { key: 'ehliyet', label: 'Ehliyet' },
  { key: 'kimlik_belgesi', label: 'Kimlik Belgesi' },
  { key: 'basvuru_formu', label: 'Başvuru Formu' },
];

// Ortak yeniden boyutlandırıcı fonksiyon (her belge için)
function resizeImageToFixedSize(file, width = 394, height = 512) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          // Dosya adını büyük harfe çevir
          const ext = file.name.split('.').pop() || 'jpg';
          const filename = (file.name.replace(/\.[^/.]+$/, "") + "_resized." + ext).toUpperCase();
          const resizedFile = new File([blob], filename, { type: blob.type });
          resolve(resizedFile);
        }, file.type.startsWith('image/') ? file.type : 'image/jpeg', 0.95);
      };
      img.onerror = () => reject(new Error('Resim yüklenemedi'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}

const KursiyerBelge = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kursiyer, setKursiyer] = useState(null);
  const [belgeler, setBelgeler] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputs = useRef({});

  // Kırpma modalı için state'ler
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [pendingBelgeKey, setPendingBelgeKey] = useState(null);
  const [pendingFileType, setPendingFileType] = useState(null);
  const [pendingFileName, setPendingFileName] = useState(null);
  const { user } = useAuth(); // kullanıcı rolü alınır

  useEffect(() => {
    const fetchKursiyer = async () => {
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
        const found = data.find(k => String(k.id || k.tc_kimlik) === String(id));
        setKursiyer(found || null);
      } catch (err) {
        setError(err.message || 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchKursiyer();
  }, [id]);

  useEffect(() => {
    if (!kursiyer) return;
    const fetchBelgeler = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        let apiUrl = `/api/belge/${kursiyer.id || kursiyer.tc_kimlik}`;
        if (process.env.REACT_APP_API_URL) {
          apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/api/belge/${kursiyer.id || kursiyer.tc_kimlik}`;
        }
        const res = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setBelgeler(null);
        } else {
          const data = await res.json();
          setBelgeler(data);
        }
      } catch {
        setBelgeler(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBelgeler();
  }, [kursiyer]);

  // Kırpılacak belge tipleri
  const CROP_KEYS = ['foto'];

  const handleFileChange = async (e, belgeKey) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    // Sadece foto için kırpma modalı aç
    if (CROP_KEYS.includes(belgeKey) && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
        setCropModalOpen(true);
        setPendingBelgeKey(belgeKey);
        setPendingFileType(file.type);
        setPendingFileName(file.name);
      };
      reader.readAsDataURL(file);
      // input'u sıfırla
      if (fileInputs.current[belgeKey]) fileInputs.current[belgeKey].value = '';
      return;
    }
    // Ogrenim Belgesi ve Adli Sicil için otomatik 394x512 resize
    if (
      (belgeKey === 'ogrenim_belgesi' || belgeKey === 'adli_sicil') &&
      file.type.startsWith('image/')
    ) {
      const resized = await resizeImageToFixedSize(file, 394, 512);
      await uploadFileDirect(resized, belgeKey);
      if (fileInputs.current[belgeKey]) fileInputs.current[belgeKey].value = '';
      return;
    }
    // Diğer belgeler için eski davranış
    await uploadFileDirect(file, belgeKey);
    if (fileInputs.current[belgeKey]) fileInputs.current[belgeKey].value = '';
  };

  const uploadFileDirect = async (file, belgeKey) => {
    setYukleniyor(true);
    setUploadError('');
    try {
      // --- Dosya uzantısı kontrolü ---
      const ext = file.name.split('.').pop().toUpperCase();
      const allowedExts = ['JPEG', 'JPG', 'PNG', 'PDF'];
      if (!allowedExts.includes(ext)) {
        setUploadError('Yalnızca jpeg, jpg, png veya pdf dosyaları yüklenebilir.');
        setYukleniyor(false);
        return;
      }
      const token = localStorage.getItem('token');
      let apiUrl = `/api/belge/yukle/${kursiyer.id || kursiyer.tc_kimlik}`;
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/api/belge/yukle/${kursiyer.id || kursiyer.tc_kimlik}`;
      }
      let uploadFile = file;
      if (file.type.startsWith('image/') && CROP_KEYS.includes(belgeKey)) {
        uploadFile = await resizeImageToFixedSize(file, 394, 512);
      }
      // Dosya adını büyük harfe çevir
      const upperName = file.name.replace(/\.[^/.]+$/, "").toUpperCase() + (ext ? '.' + ext : '');
      const finalFile = new File([uploadFile], upperName, { type: uploadFile.type });
      const formData = new FormData();
      formData.append('belge_tipi', belgeKey);
      formData.append('file', finalFile);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Yükleme başarısız');
      }
      const belgeData = await res.json();
      setBelgeler(belgeData);
    } catch (err) {
      setUploadError(err.message || 'Yükleme başarısız');
    } finally {
      setYukleniyor(false);
    }
  };

  // Kırpma işlemi tamamlandığında çağrılır
  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // handleCropSave fonksiyonu aşağıdaki gibi sadeleştirildi:
  const handleCropSave = async () => {
    setCropModalOpen(false);
    setYukleniyor(true);
    try {
      // Kırpılmış resmi canvas ile oluştur
      const croppedBlob = await getCroppedImageFromModal(
        cropImageSrc,
        croppedAreaPixels,
        394,
        512,
        pendingFileType
      );
      const ext = pendingFileName.split('.').pop() || 'jpg';
      const upperName = pendingFileName.replace(/\.[^/.]+$/, "").toUpperCase() + (ext ? '.' + ext.toUpperCase() : '');
      const croppedFile = new File([croppedBlob], upperName, { type: pendingFileType });
      await uploadFileDirect(croppedFile, pendingBelgeKey);
    } catch (err) {
      setUploadError('Kırpma veya yükleme başarısız');
    } finally {
      setYukleniyor(false);
      setCropImageSrc(null);
      setPendingBelgeKey(null);
      setPendingFileType(null);
      setPendingFileName(null);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setCropImageSrc(null);
    setPendingBelgeKey(null);
    setPendingFileType(null);
    setPendingFileName(null);
  };

  const handleDeleteFile = async (belgeKey) => {
    if (!window.confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      let apiUrl = `/api/belge/sil/${kursiyer.id || kursiyer.tc_kimlik}`;
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/api/belge/sil/${kursiyer.id || kursiyer.tc_kimlik}`;
      }
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ belge_tipi: belgeKey }),
      });
      if (!res.ok) throw new Error('Belge silinemedi');
      const belgeData = await res.json();
      setBelgeler(belgeData);
    } catch (err) {
      setUploadError(err.message || 'Silme başarısız');
    }
  };

  const downloadZip = async (kursiyer, belgeler, setUploadError) => {
    if (!kursiyer || !belgeler) return;
    try {
      const token = localStorage.getItem('token');
      let apiUrl = `/api/belge/indir-zip/${kursiyer.id || kursiyer.tc_kimlik}`;
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/api/belge/indir-zip/${kursiyer.id || kursiyer.tc_kimlik}`;
      }
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Dosyalar indirilemedi');
      const blob = await res.blob();
      // Klasör adı: "Cihan Sancako - SRC1" gibi
      const folderName = `${kursiyer.aday_ismi || ''} - ${(kursiyer.alacagi_egitim || '').toUpperCase()}`.replace(/[/\\?%*:|"<>]/g, '-').trim();
      const fileName = `${folderName}.zip`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 200);
    } catch (err) {
      setUploadError(err.message || 'İndirme başarısız');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!kursiyer) return <div>Kursiyer bulunamadı.</div>;

  const belgeYok = !belgeler || BELGE_TIPLERI.every(b => !belgeler[b.key]);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{kursiyer.aday_ismi} - Belgeler</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button
          style={{
            background: '#666',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14
          }}
          onClick={() => navigate(`/kursiyer/${id}`)}
        >
          ← Geri Dön
        </button>
        {user && user.role === 'admin' && (
          <button
            style={{
              background: '#388e3c',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 18px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 15
            }}
            onClick={() => downloadZip(kursiyer, belgeler, setUploadError)}
            disabled={!belgeler}
          >
            Dosyaları indir
          </button>
        )}
      </div>
      {belgeYok && (
        <div style={{ color: '#d32f2f', marginBottom: 16 }}>
          {kursiyer.aday_ismi} için bir belge yüklenmedi
        </div>
      )}
      {uploadError && <div style={{ color: 'red', marginBottom: 8 }}>{uploadError}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {BELGE_TIPLERI.map(({ key, label }) => {
          const belgeVar = belgeler && belgeler[key];
          return (
            <div key={key} style={{
              width: 140, height: 180, border: '2px solid #1976d2', borderRadius: 8,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
              background: '#f5faff', position: 'relative', paddingTop: 8
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
              {belgeVar ? (
                <div style={{ marginBottom: 8, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(() => {
                    const belgeUrl = process.env.REACT_APP_API_URL
                      ? process.env.REACT_APP_API_URL.replace(/\/$/, '') + '/' + belgeler[key]
                      : '/' + belgeler[key];
                    return (
                      <a href={belgeUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={belgeUrl}
                          alt={label}
                          style={{
                            width: 70,
                            height: 70,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #bbb',
                            background: '#fff',
                            boxShadow: '0 1px 4px #0001'
                          }}
                        />
                      </a>
                    );
                  })()}
                </div>
              ) : (
                <span style={{ color: '#aaa', marginBottom: 8, fontSize: 13, minHeight: 80, display: 'flex', alignItems: 'center' }}>Yüklenmedi</span>
              )}
              {user && user.role === 'admin' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    ref={el => fileInputs.current[key] = el}
                    onChange={e => handleFileChange(e, key)}
                    disabled={yukleniyor}
                  />
                  <button
                    style={{
                      background: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '6px 10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                    onClick={() => fileInputs.current[key]?.click()}
                    disabled={yukleniyor}
                  >
                    {belgeVar ? 'Değiştir' : 'Yükle'}
                  </button>
                  {belgeVar && (
                    <button
                      style={{
                        background: '#d32f2f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 14
                      }}
                      onClick={() => handleDeleteFile(key)}
                      disabled={yukleniyor}
                    >
                      Sil
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kırpma Modalı */}
      <Dialog open={cropModalOpen} onClose={handleCropCancel} maxWidth="xs" fullWidth>
        <DialogContent style={{ position: 'relative', height: 400, background: '#222' }}>
          {cropImageSrc && (
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={394 / 512}
              cropShape="rect"
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              minZoom={1}
              maxZoom={3}
              restrictPosition={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <div style={{ flex: 1, padding: '0 16px' }}>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onChange={(e, z) => setZoom(z)}
              aria-labelledby="Zoom"
            />
          </div>
          <Button onClick={handleCropCancel} color="secondary" variant="outlined">Vazgeç</Button>
          <Button onClick={handleCropSave} color="primary" variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Kırpma modalı için yardımcı fonksiyon (getCroppedImg yerine):
async function getCroppedImageFromModal(imageSrc, crop, width, height, fileType = 'image/jpeg') {
  // createImage fonksiyonu:
  function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  }
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, width, height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) reject(new Error('Canvas boş'));
      resolve(blob);
    }, fileType, 0.95);
  });
}

export default KursiyerBelge;
