import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';

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
  sinav_ucreti_dahil: 'Sınav Ücreti Dahil',
  tutar: 'Tutar',
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
  iptal_tarih: 'İptal Tarihi',
};

const kursDurumuOptions = ["Beklemede", "Katiliyor", "Firma", "Fark"];
const egitimOptions = ["SRC1", "SRC2", "SRC3", "SRC4"];

// Kalan hesaplama fonksiyonu
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

// Stil sabitleri KursiyerEkle'den alındı
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

const KursiyerDuzenle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [odemeVisible, setOdemeVisible] = useState([true, false, false, false, false, false]);
  const [userRole, setUserRole] = useState(null);
  const [kursiyer, setKursiyer] = useState(null);

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
        const found = data.find(
          (k) => String(k.id || k.tc_kimlik) === String(id)
        );
        if (!found) throw new Error('Kursiyer bulunamadı');
        setForm(found);
        setKursiyer(found);

        // --- GÜNCELLENDİ: Ödeme alanı 0 veya boşsa görünmesin ---
        if (userRole !== "user") {
          const newOdemeVisible = [];
          for (let i = 0; i < odemeFields.length; i++) {
            const odemeKey = odemeFields[i].odeme;
            const tarihKey = odemeFields[i].tarih;
            const odemeVal = found[odemeKey];
            const tarihVal = found[tarihKey];
            // Sadece ödeme değeri 0, "0", 0.0, "", null, undefined ise görünmesin
            const isOdemeDolu =
              odemeVal !== undefined &&
              odemeVal !== null &&
              odemeVal !== "" &&
              odemeVal !== 0 &&
              odemeVal !== "0" &&
              odemeVal !== 0.0;
            const isTarihDolu =
              tarihVal !== undefined &&
              tarihVal !== null &&
              tarihVal !== "";
            if (isOdemeDolu || isTarihDolu) {
              newOdemeVisible[i] = true;
            } else if (i === 0) {
              newOdemeVisible[i] = true; // ilk ödeme her zaman görünür
            } else {
              newOdemeVisible[i] = false;
            }
          }
          setOdemeVisible(newOdemeVisible);
        }
        // --- SON GÜNCELLEME ---
      } catch (err) {
        setError(err.message || 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchDetay();
    // userRole değişirse tekrar çalışmalı
    // eslint-disable-next-line
  }, [id, userRole]);

  const handleChange = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      // Eğer tutar veya ödeme alanlarından biri değiştiyse kalan'ı güncelle
      if (
        ["tutar", "odeme_1", "odeme_2", "odeme_3", "odeme_4", "odeme_5", "odeme_6"].includes(key)
      ) {
        updated.kalan = calculateKalan(updated);
      }
      // Eğer bir ödeme alanı temizlenirse, ilgili tarih de otomatik silinsin
      if (
        key.startsWith('odeme_') &&
        (value === '' || value === null || value === undefined)
      ) {
        const idx = Number(key.split('_')[1]);
        updated[`tarih_${idx}`] = '';
        // Sonrakiler de otomatik silinsin (önceki mantık)
        for (let i = idx + 1; i <= 6; i++) {
          updated[`odeme_${i}`] = '';
          updated[`tarih_${i}`] = '';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    // --- EKLENDİ: İptal ise iptal_tarih zorunlu ---
    if (form.kurs_durumu === 'İptal' && !form.iptal_tarih) {
      setSaving(false);
      return;
    }
    // --- EKLENDİ: Özel Durum -> Katiliyor geçişi uyarısı ---
    if (form.kurs_durumu === 'Katiliyor' && kursiyer && kursiyer.kurs_durumu === 'Özel Durum') {
      const onay = window.confirm(
        'Kursiyer "Özel Durum"dan "Katiliyor"a geçirilecek. Bu işlem:\n\n' +
        '• Mevcut sınav notlarını silecek\n' +
        '• Alacağı eğitimi temizleyecek\n' +
        '• Devam eğitimi varsa, onu alacağı eğitim olarak ayarlayacak\n' +
        '• Devam eğitimi alanını temizleyecek\n\n' +
        'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?'
      );
      if (!onay) {
        setSaving(false);
        return;
      }
    }
    try {
      const token = localStorage.getItem('token');
      let apiUrl = `/kursiyer/guncelle/${id}`;
      if (process.env.REACT_APP_API_URL) {
        apiUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '') + `/kursiyer/guncelle/${id}`;
      }
      let formToSend;
      if (isUser) {
        // Sadece ödeme ve tarih alanlarını ve zorunlu backend id bilgisini gönder
        formToSend = { id: form.id || id };
        for (let i = 1; i <= 6; i++) {
          formToSend[`odeme_${i}`] = form[`odeme_${i}`];
          formToSend[`tarih_${i}`] = form[`tarih_${i}`];
        }
        // Kalan artık backend'de hesaplanıyor, göndermiyoruz!
        // formToSend.kalan = form.kalan;
      } else {
        const { kurs_durumu, iptal_tarih, ...rest } = form;
        formToSend = { kurs_durumu, iptal_tarih, ...rest };
      }
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formToSend),
      });
      if (!res.ok) {
        let msg = 'Güncelleme başarısız';
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            if (String(errData.detail).toLowerCase().includes('veritabanı meşgul') ||
                String(errData.detail).toLowerCase().includes('database is locked')) {
              msg = 'Veritabanı meşgul. Lütfen birkaç saniye sonra tekrar deneyin.<br/>Bu hata genellikle aynı anda birden fazla işlem yapıldığında oluşur. Lütfen sayfayı yenileyip tekrar deneyin.';
            } else {
              msg = errData.detail;
            }
          }
        } catch {}
        throw new Error(msg);
      }
      navigate(`/kursiyer/${id}`);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading || userRole === null) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  // Sadece ödeme ve ödeme tarihleri user için düzenlenebilir
  const isUser = userRole === "user";

  return (
    <div>
      <h2 style={titleStyle}>Kursiyer Düzenle</h2>
      {isUser && (
        <div style={{color:"#e53935",marginBottom:18,fontWeight:600}}>
          Sadece ödeme ve ödeme tarihlerini güncelleyebilirsiniz. Diğer alanlar düzenlenemez.
        </div>
      )}
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Move Kurs Durumu above Aday İsmi */}
        <label style={labelStyle}>
          Kurs Durumu:
          <select
            name="kurs_durumu"
            value={form.kurs_durumu || ''}
            onChange={e => handleChange('kurs_durumu', e.target.value)}
            style={inputStyle}
            disabled={isUser}
          >
            <option value="">Seçiniz</option>
            {kursDurumuOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="Özel Durum">Özel Durum</option>
            <option value="İptal">İptal</option>
          </select>
        </label>
        {form.kurs_durumu === "İptal" && (
          <label style={labelStyle}>
            İptal Tarihi:
            <input
              type="date"
              name="iptal_tarih"
              value={form.iptal_tarih || ''}
              onChange={e => handleChange('iptal_tarih', e.target.value)}
              style={inputStyle}
              disabled={isUser}
            />
            {/* Dinamik uyarı: iptal_tarih boşsa */}
            {(!form.iptal_tarih) && (
              <span style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                İptal edilen kursiyer için iptal tarihi zorunludur.
              </span>
            )}
          </label>
        )}
        <label style={labelStyle}>
          Aday İsmi:
          <input
            name="aday_ismi"
            value={form.aday_ismi || ''}
            onChange={e => handleChange('aday_ismi', e.target.value)}
            style={inputStyle}
            disabled={isUser}
          />
        </label>
        <label style={labelStyle}>
          Telefon No:
          <input
            name="tel_no"
            value={form.tel_no || ''}
            onChange={e => handleChange('tel_no', e.target.value)}
            style={inputStyle}
            disabled={isUser}
          />
        </label>
        <label style={labelStyle}>
          Yakın Telefon No:
          <input
            name="tel_yakin"
            value={form.tel_yakin || ''}
            onChange={e => handleChange('tel_yakin', e.target.value)}
            style={inputStyle}
            disabled={isUser}
          />
        </label>
        <label style={labelStyle}>
          TC Kimlik:
          <input
            name="tc_kimlik"
            value={form.tc_kimlik || ''}
            onChange={e => handleChange('tc_kimlik', e.target.value)}
            style={inputStyle}
            disabled={isUser}
            required
          />
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
                checked={!!form[field.key]}
                onChange={e => {
                  const checked = e.target.checked ? 1 : 0;
                  handleChange(field.key, checked);
                  if (!checked) handleChange(field.dateKey, '');
                }}
                style={{
                  accentColor: '#1976d2',
                  width: 18,
                  height: 18
                }}
                disabled={isUser}
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
              {form[field.key] && !form[field.dateKey] ? (
                <span style={{ color: 'red', fontSize: 13 }}>Tarih gerekli</span>
              ) : null}
              <input
                type="date"
                name={field.dateKey}
                value={form[field.dateKey] || ''}
                onChange={e => handleChange(field.dateKey, e.target.value)}
                disabled={isUser || !form[field.key]}
                style={{
                  ...inputStyle,
                  minWidth: 140,
                  maxWidth: 180,
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
              checked={!!form[sinavUcretiField.key]}
              onChange={e => {
                const checked = e.target.checked ? 1 : 0;
                handleChange(sinavUcretiField.key, checked);
              }}
              style={{
                accentColor: '#1976d2',
                width: 18,
                height: 18
              }}
              disabled={isUser}
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
            value={form.alacagi_egitim || ''}
            onChange={e => handleChange('alacagi_egitim', e.target.value)}
            style={inputStyle}
            disabled={isUser}
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
            value={form.devam_egitimi || ''}
            onChange={e => handleChange('devam_egitimi', e.target.value)}
            style={inputStyle}
            disabled={isUser}
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
              value={form.tutar == null ? '' : form.tutar}
              onChange={e => handleChange('tutar', e.target.value)}
              style={{ ...inputStyle, paddingRight: 32, width: '100%' }}
              placeholder="Fiyat"
              disabled={isUser}
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
        {odemeFields.map((f, idx) => (
          // User rolündeyse tüm ödeme alanları görünsün, admin ise eski mantık
          (isUser || odemeVisible[idx]) && (
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
                {fieldLabels[f.odeme]}:
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    name={f.odeme}
                    value={form[f.odeme] == null ? '' : form[f.odeme]}
                    onChange={e => handleChange(f.odeme, e.target.value)}
                    style={{ ...inputStyle, paddingRight: 32, width: '100%' }}
                    placeholder="Tutar"
                    disabled={false}
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
                {form[f.odeme] && !form[f.tarih] ? (
                  <span style={{ color: 'red', fontSize: 13 }}>Tarih gerekli</span>
                ) : null}
                <input
                  type="date"
                  name={f.tarih}
                  value={form[f.tarih] == null ? '' : form[f.tarih]}
                  onChange={e => handleChange(f.tarih, e.target.value)}
                  style={{
                    ...inputStyle,
                    minWidth: 140,
                    maxWidth: 180,
                    background: !form[f.odeme] ? '#f5f5f5' : '#fff',
                    textAlign: 'right'
                  }}
                  disabled={!form[f.odeme]}
                  required={!!form[f.odeme]}
                />
              </label>
              {/* Eksi butonu: sadece ödeme 2 ve sonrası için, sadece admin için */}
              {idx > 0 && !isUser && (
                <button
                  type="button"
                  onClick={() => {
                    setOdemeVisible(prev => {
                      const updated = [...prev];
                      for (let i = idx; i < odemeFields.length; i++) {
                        updated[i] = false;
                      }
                      return updated;
                    });
                    setForm(fm => {
                      const newForm = { ...fm };
                      for (let i = idx + 1; i <= 6; i++) {
                        newForm[`odeme_${i}`] = '';
                        newForm[`tarih_${i}`] = '';
                      }
                      newForm.kalan = calculateKalan(newForm);
                      return newForm;
                    });
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
                ><FaMinus /></button>
              )}
              {/* Artı butonu: sadece admin için, user için asla gösterilmez */}
              {!isUser && idx < 5 &&
                odemeVisible[idx] &&
                !odemeVisible[idx + 1] &&
                odemeVisible.slice(idx + 1).every(v => !v) && (
                  <button
                    type="button"
                    style={{
                      ...buttonStyle,
                      background: '#43a047',
                      marginTop: 0,
                      fontSize: 16,
                      padding: '8px 0',
                      boxShadow: '0 1px 4px #43a04733',
                      width: 40,
                      height: 40,
                      minWidth: 0
                    }}
                    onClick={() => setOdemeVisible(prev => {
                      const updated = [...prev];
                      updated[idx + 1] = true;
                      return updated;
                    })}
                    title="Ödeme ekle"
                  ><FaPlus /></button>
                )}
            </div>
          )
        ))}
        <label style={labelStyle}>
          Kalan:
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="number"
              name="kalan"
              value={form.kalan == null ? '' : form.kalan}
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
            value={form.aciklama || ''}
            onChange={e => handleChange('aciklama', e.target.value)}
            style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            disabled={isUser}
          />
        </label>
        <label style={labelStyle}>
          Evrak Kayıt Tarihi:
          <input
            type="date"
            name="evrak_kayit_tarihi"
            value={form.evrak_kayit_tarihi || ''}
            onChange={e => handleChange('evrak_kayit_tarihi', e.target.value)}
            style={inputStyle}
            disabled={isUser}
          />
        </label>
        {/* --- EKLENDİ: Inaktif checkbox --- */}
        <label style={{
          ...labelStyle,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600
        }}>
          <input
            type="checkbox"
            name="inaktif"
            checked={form.inaktif === 1 || form.inaktif === '1' || form.inaktif === true}
            onChange={e => handleChange('inaktif', e.target.checked ? 1 : 0)}
            disabled={isUser}
            style={{ width: 18, height: 18, accentColor: '#e53935' }}
          />
          <span style={{ color: (form.inaktif === 1 || form.inaktif === '1' || form.inaktif === true) ? '#e53935' : '#333' }}>İnaktif</span>
        </label>
        {/* --- SON EKLENDİ --- */}
        <div style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'center',
          gap: 16
        }}>
          <button
            type="button"
            onClick={() => navigate(`/kursiyer/${id}`)}
            style={{
              ...buttonStyle,
              background: '#eee',
              color: '#333',
              boxShadow: 'none'
            }}
            disabled={saving}
          >
            Vazgeç
          </button>
          <button
            type="submit"
            style={buttonStyle}
            disabled={saving || !form.tc_kimlik || form.tc_kimlik.trim() === ''}
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

export default KursiyerDuzenle;