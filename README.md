# BANDIRMA SRC - CRM Sistemi

Bandırma SRC (Sertifikasyon ve Rehberlik Merkezi) için geliştirilmiş kapsamlı CRM (Customer Relationship Management) sistemi. Kursiyer yönetimi, sınav takibi, evrak yönetimi ve raporlama özelliklerini içeren web tabanlı platform.

---

## 🎯 Proje Özeti

Bandırma SRC-CRM, eğitim kurumları için tasarlanmış modern ve kapsamlı bir yönetim sistemidir. Kursiyerlerin kayıt işlemlerinden sınav sonuçlarına, evrak takibinden finansal raporlara kadar tüm süreçleri dijitalleştirir.

---

## 🏗️ Mimari

### Stack Teknolojileri

**Backend:**
- **Framework:** FastAPI (Python)
- **Veritabanı:** SQLite3
- **Kimlik Doğrulama:** JWT (JSON Web Token)
- **Şifreleme:** Bcrypt
- **CORS:** Tüm origin'lere açık (production'da sınırlandırılmalı)

**Frontend:**
- **Framework:** React.js
- **State Management:** Context API (AuthContext)
- **HTTP Client:** Fetch API
- **Routing:** React Router
- **Styling:** CSS3

**Deployment:**
- Backend: Python çalışma ortamı
- Frontend: Node.js build sistem

---

## 🚀 Ana Özellikler

### 1. **Kullanıcı Yönetimi & Kimlik Doğrulama**

#### Endpoints:
- `POST /token` - Kullanıcı girişi (JWT token oluşturma)
- `POST /kullanici/ekle` - Yeni kullanıcı ekleme (Admin)
- `GET /kullanici/` - Tüm kullanıcıları listele (Admin)
- `DELETE /kullanici/{user_id}/` - Kullanıcı silme (Admin)
- `GET /users/me/` - Mevcut kullanıcı bilgisi
- `POST /logout` - Oturum kapatma
- `POST /kullanici/sifre-degistir` - Şifre değiştirme
- `POST /users/change-password/` - Şifre değiştirme (Yeni format)

#### Özellikler:
- ✅ Role-based Access Control (Admin, User)
- ✅ JWT token ile kimlik doğrulama
- ✅ Bcrypt şifre hashleme
- ✅ Token süresi yönetimi (90 dakika)
- ✅ OAuth2 entegrasyonu
- ✅ Kullanıcı şifre değişikliği

#### Sayfalar (Frontend):
- `Login.js` - Giriş sayfası
- `UserSettings.js` - Kullanıcı ayarları
- `Kullanicilar.js` - Kullanıcı listesi (Admin)
- `KullaniciEkle.js` - Yeni kullanıcı ekleme (Admin)

---

### 2. **Kursiyer Yönetimi**

#### Endpoints:
- `POST /kursiyer/ekle` - Yeni kursiyer ekleme
- `GET /kursiyer/liste` - Tüm kursiyerleri listele
- `PUT /kursiyer/guncelle/{kid}` - Kursiyer bilgisi güncelleme
- `PATCH /kursiyer/{kid}` - Kısmi güncelleme
- `GET /kursiyer/ara` - İsim veya TC ile arama

#### Kursiyer Bilgileri (İçerir):
```
Temel Bilgiler:
- Adı, TC Kimlik No, Telefon, Acil Tel
- Eğitim Türü (alacağı_egitim), Kurs Durumu
- Tarih/İnaktif/Arşiv durumları

Evrak Takibi:
- Öğrenim Belgesi, Adres Belgesi, Adlı Sicil
- Ehliyet, Kimlik Belgesi, Fotoğraf
- Başvuru Formu, E-SRC Kaydı
- Sınav Ücreti Dahil Durumu
- Her evrak için tarih kaydı

Finansal:
- Toplam Tutar, Ödeme Durumu
- 6 kademeli ödeme planı (Tarih + Tutar)
- Kalan tutarı otomatik hesaplama
- User'lar tarafından güncellenen kalan tutar

Notlar:
- Açıklama alanı
- Devam eğitimi durumu
```

#### Kursiyer Durumları:
- `Beklemede` - Başvuru aşamasında
- `Özel Durum` - Özel durum açısından
- `Katiliyor` - Aktif olarak kursa katılan
- `İptal` - İptal edilen kursiyer
- `Tamamlayan` - Kursu tamamlayan

#### Sayfalar (Frontend):
- `KursiyerList.js` - Kursiyer listesi
- `KursiyerEkle.js` - Yeni kursiyer ekleme
- `KursiyerDetay.js` - Kursiyer detayları
- `KursiyerDuzenle.js` - Kursiyer bilgisi düzenleme
- `arama.js` - Arama komponenti

---

### 3. **Belge (Evrak) Yönetimi**

#### Endpoints:
- `POST /api/belge/yukle/{kursiyer_id}` - Belge yükleme
- `GET /api/belge/{kursiyer_id}` - Kursiyer belgelerini getir
- `DELETE /api/belge/sil/{kursiyer_id}` - Belge silme
- `GET /api/belge/indir-zip/{kursiyer_id}` - Tüm belgeleri ZIP olarak indir

#### Özellikler:
- ✅ Çoklu belge tipi desteği (Fotoğraf, Öğrenim Belgesi, Adres Belgesi, vb.)
- ✅ Dosya validasyonu (JPEG, JPG, PNG, PDF)
- ✅ Otomatik klasör organizasyonu (Kursiyer İsmi - Eğitim Tipi)
- ✅ DPI düzeltme (görseller için)
- ✅ ZIP indirme
- ✅ Tarih takibi (Her belgenin yükleme tarihi)

#### Desteklenen Belge Tipleri:
- Fotoğraf (FOTO)
- Öğrenim Belgesi
- Adres Belgesi
- Adlı Sicil
- Ehliyet
- Kimlik Belgesi
- Başvuru Formu

#### Sayfalar (Frontend):
- `KursiyerBelge.js` - Belge yönetimi ve yükleme

---

### 4. **Sınıf Yönetimi**

#### Endpoints:
- `POST /api/sinif` - Yeni sınıf oluşturma (Admin)
- `GET /api/siniflar` - Tüm sınıfları listele
- `DELETE /api/sinif/{sinif_id}` - Sınıf silme (Admin)
- `POST /api/siniflar/yukle` - Excel'den sınıf yükleme (Admin)

#### Sınıf Bilgileri:
- Sınıf İsmi
- Kursiyer Sayısı
- Kursiyer Listesi

#### Sayfalar (Frontend):
- `SinifListesi.js` - Sınıf listesi
- `SinifDetay.js` - Sınıf detayları
- `SinifDuzenle.js` - Sınıf düzenleme

---

### 5. **Sınav Yönetimi**

#### Endpoints:
- `POST /api/sinav/{kursiyer_id}` - Sınav bilgisi kaydetme
- `GET /api/sinav/{kursiyer_id}` - Kursiyer sınav bilgisi getir
- `GET /api/sinavlar/filtreli` - Filtrelenmiş sınav listesi

#### Sınav Türleri ve Puanları:
```
Ana Eğitim (Maksimum 100 puan):
- 4 Yazılı Sınav (0-100 puan)
- 4 Uygulama Sınav (0-100 puan)
- Her sınav için tarih kaydı

Devam Eğitimi (Opsiyonal):
- 4 Yazılı Sınav (0-100 puan)
- 4 Uygulama Sınav (0-100 puan)
- Her sınav için tarih kaydı
- Not girilmezse otomatik tarih temizliği
```

#### Filtreler:
- `yazilidan_kalanlar` - Yazılı sınavdan kalan kursiyerler
- `yazilidan_gecenler` - Yazılı sınavdan geçen kursiyerler
- `kursu_tamamlayanlar` - Kursu tamamlayan kursiyerler
- `sinav_listesi` - Tüm sınav listesi

#### Sayfalar (Frontend):
- `KursiyerSinav.js` - Sınav bilgisi giriş
- `KursiyerSinavListesi.js` - Sınav listesi ve filtreleme

---

### 6. **Evrak Takip Sistemi (Gelen/Giden)**

#### Gelen Evrak Endpoints:
- `GET /gelen-evrak` - Tüm gelen evrakları listele
- `GET /gelen-evrak/{evrak_id}` - Gelen evrak detayı
- `POST /gelen-evrak` - Yeni gelen evrak oluşturma
- `PUT /gelen-evrak/{evrak_id}` - Gelen evrak güncelleme
- `DELETE /gelen-evrak/{evrak_id}` - Gelen evrak silme
- `DELETE /gelen-evrak/{evrak_id}/belge/{belge_id}` - Belge silme
- `PUT /gelen-evrak/{evrak_id}/belge/{belge_id}` - Belge güncelleme

#### Giden Evrak Endpoints:
- `GET /giden-evrak` - Tüm giden evrakları listele
- `GET /giden-evrak/{evrak_id}` - Giden evrak detayı
- `POST /giden-evrak` - Yeni giden evrak oluşturma
- `PUT /giden-evrak/{evrak_id}` - Giden evrak güncelleme
- `DELETE /giden-evrak/{evrak_id}` - Giden evrak silme
- `DELETE /giden-evrak/{evrak_id}/belge/{belge_id}` - Belge silme
- `PUT /giden-evrak/{evrak_id}/belge/{belge_id}` - Belge güncelleme

#### Evrak Bilgileri:
```
Evrak Özellikleri:
- Sıra No
- Kimden/Nereye
- Evrak Tarihi
- Evrak No
- Evrak Cinsi
- Evrak Eki (Belge Sayısı)
- Evrak Özeti
- Belgeler (Dosya Yönetimi)
```

#### Sayfalar (Frontend):
- `EvrakList.js` - Evrak listesi
- `EvrakDetay.js` - Evrak detayları
- `GelenEvrakEkle.js` - Gelen evrak ekleme
- `GelenEvrakDuzenle.js` - Gelen evrak düzenleme
- `GelenEvrakDetay.js` - Gelen evrak detayları
- `GidenEvrakEkle.js` - Giden evrak ekleme
- `GidenEvrakDuzenle.js` - Giden evrak düzenleme
- `GidenEvrakDetay.js` - Giden evrak detayları

---

### 7. **Raporlama Sistemi**

#### Rapor Endpoints:
- `GET /api/rapor/tamamlayanlar` - Tarih aralığında kursu tamamlayan kursiyerler
- `GET /api/rapor/eksik-evrak` - Eksik evrak olan kursiyerler
- `GET /api/rapor/katilanlar` - Katılan kursiyerlerin raporu
- `GET /api/rapor/farklar` - Kursiyerler arasındaki farkların raporu
- `GET /api/rapor/beklemede-tam-olanlar` - Beklemede ve tamamlayanlar raporu
- `GET /api/rapor/muhasebe` - Muhasebe raporu (Finansal özet)

#### Rapor Özellikleri:
- ✅ Tarih aralığı filtrelemesi
- ✅ Kursiyer adı, TC, telefon gibi bilgiler
- ✅ Finansal sorgulamalar
- ✅ Excel ve diğer formatlarda export

#### Sayfalar (Frontend):
- `Rapor.js` - Rapor yönetim paneli

---

### 8. **Yedekleme & İçeri Aktarma**

#### Endpoints:
- `POST /yedek/kursiyer-yukle` - Excel'den kursiyer yükleme
- `GET /yedek/db-indir` - Veritabanı yedekleme (Download)

#### Özellikler:
- ✅ Excel (XLSX) dosyasından toplu veri içeri aktarma
- ✅ Hata raporlaması (Kaç kayıt başarılı, kaç hata)
- ✅ Veritabanı yedekleme
- ✅ Backup ve restore işlemleri

#### Sayfalar (Frontend):
- `Yedek.js` - Yedek ve içeri aktarma yönetimi

---

### 9. **Aktivite Günlüğü (Log Sistem)**

#### Endpoints:
- `GET /api/loglar` - Sistem günlüğü getir
- `DELETE /api/loglar/temizle` - Günlüğü temizle (Admin)

#### Kaydedilen Aktiviteler:
- Kullanıcı girişi
- Şifre değişikliği
- Kursiyer ekleme/güncelleme
- Belge yükleme
- Sınav bilgisi kaydı
- Evrak işlemleri

#### Günlük Bilgileri:
- Kullanıcı adı
- Kursiyer adı
- Yapılan değişiklik
- Tarih ve saat (İstanbul saati)

#### Sayfalar (Frontend):
- `LogKayit.js` - Aktivite günlüğü görüntüleme

---

## 📊 Veri Modelleri

### Kullanıcı (kullanici tablosu)
```
- id: INT PRIMARY KEY
- kullanici_adi: TEXT
- sifre_hash: TEXT
- rol: TEXT (admin/user)
```

### Kursiyer (kursiyer tablosu)
```
- id: INT PRIMARY KEY
- aday_ismi: TEXT
- tc_kimlik: TEXT
- tel_no: TEXT
- alacagi_egitim: TEXT
- kurs_durumu: TEXT
- [evrak alanları: ogrenim_belgesi, adres_belgesi, ...]
- [ödeme alanları: tutar, odeme_1-6, kalan, ...]
- [tarih alanları: evrak tarih bilgileri]
- inaktif: INT
- arsiv: INT
```

### Belge (belge tablosu)
```
- id: INT PRIMARY KEY
- kursiyer_id: INT
- [belge tipleri: foto, ogrenim_belgesi, ...]
```

### Sınav (sinav tablosu)
```
- id: INT PRIMARY KEY
- kursiyer_id: INT
- [ana eğitim sınavları: sinav_1-4, uygulama_1-4]
- [devam eğitimi sınavları: devam_sinav_1-4, devam_uygulama_1-4]
- [tarih alanları: sinav_1_tarih, ...]
```

### Sınıf (sinif tablosu)
```
- id: INT PRIMARY KEY
- sinif_isim: TEXT
- kursiyer_sayi: INT
```

### Gelen Evrak
```
- id: INT PRIMARY KEY
- sira_no: INT
- kimden: TEXT
- evrak_tarih: TEXT
- evrak_no: TEXT
- evrak_cinsi: TEXT
- evrak_eki: INT
- belgeler: FOREIGN KEY (gelen_evrak_belge)
```

### Giden Evrak
```
- id: INT PRIMARY KEY
- sira_no: INT
- nereye: TEXT
- evrak_tarih: TEXT
- evrak_no: TEXT
- evrak_cinsi: TEXT
- evrak_eki: INT
- belgeler: FOREIGN KEY (giden_evrak_belge)
```

### Log
```
- id: INT PRIMARY KEY
- user: TEXT
- aday_ismi: TEXT
- degisiklik: TEXT
- tarih: TEXT
```

---

## 🔒 Güvenlik Özellikleri

✅ **JWT Token Kimlik Doğrulaması**
- 90 dakikalık token süresi
- Otomatik token yenileme
- Token süresi sonunda otomatik logout

✅ **Rol Tabanlı Erişim Kontrolü (RBAC)**
- Admin: Tüm işlemlere erişim
- User: Sınırlı erişim (Kursiyer güncelleme, sınav giriş, vb.)

✅ **Şifre Güvenliği**
- Bcrypt hash (salt ile)
- Token bazlı oturum

✅ **CORS Güvenliği**
- Production'da spesifik domainler için ayarlanmalı

---

## 🛠️ Teknoloji Detayları

### Backend Kütüphaneleri
```
FastAPI - Web framework
Pydantic - Veri validasyonu
JWT - Token yönetimi
Bcrypt - Şifre hashleme
SQLite3 - Veritabanı
Pillow - Görüntü işleme
Openpyxl - Excel dosya işleme
Pytz - Timezon yönetimi
CORS - Cross-origin requests
```

### Frontend Bağımlılıkları (package.json'dan)
```
React - UI framework
React Router - Routing
Context API - State management
Fetch API - HTTP requests
CSS3 - Styling
```

---

## 📱 Arayüz Yapısı

### Main Components

```
App.js (Ana Uygulama)
├── AuthContext (Kimlik doğrulama)
├── PrivateRoute (Korunan rotalar)
├── Login.js (Giriş sayfası)
└── Dashboard
    ├── Kursiyer Yönetimi
    │   ├── Liste
    │   ├── Detay
    │   ├── Ekle
    │   ├── Düzenle
    │   ├── Belge
    │   └── Sınav
    ├── Sınıf Yönetimi
    │   ├── Liste
    │   ├── Detay
    │   └── Düzenle
    ├── Evrak Yönetimi
    │   ├── Gelen Evrak
    │   │   ├── Liste
    │   │   ├── Ekle
    │   │   ├── Düzenle
    │   │   └── Detay
    │   └── Giden Evrak
    │       ├── Liste
    │       ├── Ekle
    │       ├── Düzenle
    │       └── Detay
    ├── Kullanıcı Yönetimi (Admin)
    │   ├── Liste
    │   ├── Ekle
    │   └── Sil
    ├── Raporlar
    │   ├── Tamamlayanlar
    │   ├── Eksik Evrak
    │   ├── Muhasebe
    │   ├── Farklar
    │   └── Beklemede Tam Olanlar
    ├── Yedekleme
    │   ├── İçeri Aktar
    │   └── Veritabanı İndir
    ├── Aktivite Günlüğü
    └── Ayarlar & Profil
```

---

## 🚀 Özellik Özeti

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| Kursiyer Yönetimi | Ekle, Düzenle, Listele, Ara | ✅ Tamamlandı |
| Belge Yönetimi | Yükle, İndir, ZIP Export | ✅ Tamamlandı |
| Sınıf Yönetimi | Oluştur, Yönet, Sil | ✅ Tamamlandı |
| Sınav Takibi | Puanlar, Tarih, Filtreler | ✅ Tamamlandı |
| Evrak Sistemi | Gelen/Giden Evrak Takibi | ✅ Tamamlandı |
| Raporlama | Kapsamlı Raporlar | ✅ Tamamlandı |
| İçeri Aktarma | Excel Import | ✅ Tamamlandı |
| Yedekleme | Database Backup | ✅ Tamamlandı |
| Günlük Sistem | Aktivite Takibi | ✅ Tamamlandı |
| Kullanıcı Yönetimi | Multi-user Support | ✅ Tamamlandı |

---

## 📊 Finansal Yönetim

Sistem geliştirilmiş ödeme ve finansal takip özelliklerine sahiptir:

**Ödeme Planı:**
- 6 kademe ödeme imkanı
- Her ödemede tarih ve tutar kaydı
- Kalan tutar otomatik hesaplama
- Admin tarafından kontrol edilir

**Muhasebe Raporu:**
- Toplam gelir hesaplama
- Ödeme durumu analizi
- Kalan tutar takibi
- Ödeme farkları raporu

---

## 💼 İş Mantığı Özellikleri

### Kursiyer Durumu Yönetimi
```
Beklemede ─→ Katiliyor ─→ Tamamlayan
    ↓           ↓            
  Özel          İptal
 Durum    (otomatik arsiv & inaktif)
```

### Otomatik İşlemler
- ✅ İptal durumunda otomatik olarak arsiv ve inaktif işaret
- ✅ Kullanıcılar tarafından ödeme bilgisi güncellenirken otomatik kalan hesaplama
- ✅ Devam eğitimi sınavında not girilmezse tarih otomatik temizliği
- ✅ Belgelerin klasörlere organizasyonu (Kursiyer İsmi - Eğitim Tipi)
- ✅ "Özel Durum" → "Katiliyor" geçişi özel işlemle yönetilir

---

## 📝 Örnek İş Akışları

### Kursiyer Ekleme Akışı
1. Kursiyer bilgileri girilir (Ad, TC, Tel, vb.)
2. Belge yüklenir (Fotoğraf, Sertifikalar, vb.)
3. Ödeme planı belirlenir
4. Sınıf atanır
5. Sistem günlüğüne kaydedilir

### Sınav Giriş Akışı
1. Kursiyer sınav yazılı puanları girilir
2. Uygulama sınav puanları girilir
3. İsteğe bağlı devam eğitimi sınavları girilir
4. Sistem otomatik geçme/kalma durumu hesaplar
5. Raporlar güncellenir

### Evrak Takibi Akışı
1. Gelen evrak kaydedilir
2. Belgeler sisteme yüklenir
3. İşlemler takip edilir
4. Giden evrak kaydedilir
5. Tüm evrak tarihi sistemde saklanır

---

## 🎓 Eğitim Kurumu Yönetim Özellikleri

**Kursiyerler İçin:**
- Katılım durumu takibi
- İnaktif/Arşiv işaretleme
- Belge uygunluk kontrolü
- Sınav sonuçları izleme

**Mali Yönetim İçin:**
- Ödeme planlama
- Kalan tutar takibi
- Finansal raporlar
- Muhasebe özeti

**İdari Yönetim İçin:**
- Çoklu kullanıcı desteği
- Rol tabanlı erişim
- Aktivite günlüğü
- Veritabanı yedekleme

---

## 🔄 Veri Akışı Diyagramı

```
Giriş (Login)
    ↓
Kimlik Doğrulama → JWT Token Oluştur
    ↓
Dashboard Ana Sayfa
    ├─→ Kursiyer Yönetimi (Listeleme, Arama, Detay)
    │        ├─→ Belge Yönetimi (Yükle, İndir)
    │        └─→ Sınav Takibi (Puanlar, Raporlar)
    │
    ├─→ Sınıf Yönetimi (Oluştur, Yönet)
    │
    ├─→ Evrak Sistemi
    │    ├─→ Gelen Evrak
    │    └─→ Giden Evrak
    │
    ├─→ Raporlama Modülü
    │    ├─→ Tamamlayanlar
    │    ├─→ Muhasebe
    │    └─→ Diğer Raporlar
    │
    ├─→ Yedekleme
    │    ├─→ İçeri Aktar
    │    └─→ Dışarı Ver
    │
    └─→ Ayarlar & Profil
```

---

## 📈 Sistem Kapasitesi

- **Kullanıcı Sayısı:** Sınırsız (Basit SQL yapısı)
- **Kursiyer Sayısı:** 10.000+ (Veritabanı bağlı)
- **Belge Sayısı:** Sınırsız (Dosya sistemi bağlı)
- **Sınav Kaydı:** Sınırsız (Bellek bağlı)
- **Evrak İşlemi:** 1.000+ aylık

---

## 🎯 Kullanım Senaryosu

### Örnek: Yeni Kursiyer Kaydı

1. **Admin:** Kursiyer formu doldurur
   - Ad: "Ahmet Yılmaz"
   - TC: "12345678901"
   - Tel: "+90555123456"
   - Eğitim: "Web Tasarımı"

2. **Admin:** Belgeleri yükler
   - Kimlik Belgesi
   - Adres Belgesi
   - Fotoğraf

3. **Admin:** Ödeme planını oluşturur
   - Toplam: 5.000 TL
   - 6 kademede ödeme yapıldığını belirtir

4. **Admin:** Sınıf atar ve sistem günlüğe kaydeder

5. **Sistem:** Otomatik klasör oluşturur: "Ahmet Yılmaz - Web Tasarımı"

6. **İstatistik:** Dashboard güncellenir

---

## 🔍 Sistem Özellikleri Özeti

### Teknik Özellikler
- ✅ RESTful API architektürü
- ✅ Stateless kimlik doğrulama (JWT)
- ✅ SQL injection koruması (parametrize queries)
- ✅ Dosya tipi validasyonu
- ✅ Hata yönetimi ve loglama
- ✅ CORS entegrasyonu
- ✅ Transaksiyonel operasyonlar

### İş Mantığı Özellikleri
- ✅ Otomatik hesaplamalar (Kalan tutar)
- ✅ Durum geçişleri (Kursiyer durumları)
- ✅ Dinamik raporlama
- ✅ Finansal takip
- ✅ Evrak organizasyonu
- ✅ İstatistik ve analitics

### Kullanıcı Arayüzü Özellikleri
- ✅ Responsive tasarım
- ✅ Hoşlanılan UI/UX
- ✅ Hızlı arama ve filtreleme
- ✅ İntuitive navigasyon
- ✅ Tablo ve form yönetimi
- ✅ Modal ve popup sistemleri

---

## 💡 Temel İstatistikler

- **Backend Kod Satırı:** 2.300+ (main.py)
- **Frontend Bileşenleri:** 20+ React component
- **API Endpoint Sayısı:** 50+
- **Veritabanı Tablosu:** 10+
- **Desteklenen Belge Tipi:** 7

---

## 🎓 Benzersiz Özellikler

1. **Otomatik Kalan Hesaplama:** 6 kademeli ödeme planında kalan tutar otomatik hesaplanır
2. **Geliştiş Belge Organizasyonu:** Kursiyerlrin belgeleri otomatik klasörlere organize edilir
3. **Devam Eğitimi Desteği:** Ana eğitim ve devam eğitimi sınavları ayrı takip edilebilir
4. **Komprehensif Evrak Sistemi:** Gelen ve giden evraklar bağımsız olarak yönetilir
5. **Çok Seviyeli Raporlama:** Finansal, istatistiksel ve yönetimsel raporlar
6. **Rol Tabanlı Erişim:** Admin ve User rolleri ile farklı erişim seviyeleri
7. **Turkeish Timezone Support:** İstanbul saat dilimi ile log kaydı

---

## 🚀 Sonuç

Bandırma SRC-CRM, eğitim kurumları için tam teşekküllü bir yönetim çözümüdür. Kursiyerler, belgeler, sınavlar, evraklar ve finansal veriler merkezi bir platformda yönetilir. Sistem:

- ✅ **Verimlilik:** Tüm işlemleri dijitalleştirir
- ✅ **Güvenlik:** Roll-base erişim ve şifre koruması ile güvenli
- ✅ **Ölçeklenebilirlik:** Büyüyen kurslara uyum sağlar
- ✅ **Raporlama:** Kapsamlı analiz ve raporlama imkanı
- ✅ **Yönetim:** Kolay yedekleme ve veri yönetimi

Bu sistem, modern bir eğitim kurumunun tüm ihtiyaçlarını karşılamak üzere tasarlanmıştır.

---

**Geliştirme Tarihi:** 2026  
**Versiyon:** 1.0  
**Platform:** Web (FastAPI Backend + React Frontend)  
**Veritabanı:** SQLite3
