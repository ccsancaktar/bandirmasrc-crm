import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KursiyerList from './pages/Kursiyer/KursiyerList';
import KursiyerEkle from './pages/Kursiyer/KursiyerEkle';
import UserSettings from './pages/Kullanici/UserSettings';
import NotFound from './pages/notFound';
import KullaniciEkle from './pages/Kullanici/KullaniciEkle';
import KursiyerDetay from './pages/Kursiyer/KursiyerDetay';
import KursiyerDuzenle from './pages/Kursiyer/KursiyerDuzenle';
import KursiyerBelge from './pages/Kursiyer/KursiyerBelge';
import Kullanicilar from './pages/Kullanici/Kullanicilar'; 
import SinifListesi from './pages/Sinif/SinifListesi';
import SinifDetay from './pages/Sinif/SinifDetay';
import Yedek from './pages/Yedek/Yedek';
import KursiyerSinav from './pages/Kursiyer/KursiyerSinav';
import KursiyerSinavListesi from './pages/Kursiyer/KursiyerSinavListesi';
import LogKayit from './pages/LogKayit';
import Rapor from './pages/Rapor';
import EvrakList from './pages/Evrak/EvrakList';
import GelenEvrakDetay from './pages/Evrak/Gelen/GelenEvrakDetay';
import GelenEvrakDuzenle from './pages/Evrak/Gelen/GelenEvrakDuzenle';
import GelenEvrakEkle from './pages/Evrak/Gelen/GelenEvrakEkle';
import GidenEvrakDetay from './pages/Evrak/Giden/GidenEvrakDetay';
import GidenEvrakDuzenle from './pages/Evrak/Giden/GidenEvrakDuzenle';
import GidenEvrakEkle from './pages/Evrak/Giden/GidenEvrakEkle';

// Wrapper pages for direct routing
function GelenEvrakDetayPage() {
  const { id } = useParams();
  return <GelenEvrakDetay evrakId={id} />;
}
function GelenEvrakDuzenlePage() {
  const { id } = useParams();
  return <GelenEvrakDuzenle evrakId={id} />;
}
function GelenEvrakEklePage() {
  return <GelenEvrakEkle />;
}
function GidenEvrakDetayPage() {
  const { id } = useParams();
  return <GidenEvrakDetay evrakId={id} />;
}
function GidenEvrakDuzenlePage() {
  const { id } = useParams();
  return <GidenEvrakDuzenle evrakId={id} />;
}
function GidenEvrakEklePage() {
  return <GidenEvrakEkle />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route index element={<KursiyerList />} />
            <Route path="kursiyer-ekle" element={<KursiyerEkle />} />
            <Route path="ayarlar" element={<UserSettings />} />
            <Route path="kullanici-ekle" element={<KullaniciEkle />} />
            <Route path="kullanicilar" element={<Kullanicilar />} /> 
            <Route path="kursiyer/:id" element={<KursiyerDetay />} />
            <Route path="kursiyer/:id/duzenle" element={<KursiyerDuzenle />} />
            <Route path="kursiyer/:id/belgeler" element={<KursiyerBelge />} />
            <Route path="kursiyer/:id/sinav" element={<KursiyerSinav />} />
            <Route path="sinif-listesi" element={<SinifListesi />} /> 
            <Route path="sinif/:id" element={<SinifDetay />} />
            <Route path="yedek" element={<Yedek />} /> {/* Yedek sayfası eklendi */}
            <Route path="sinav-listesi" element={<KursiyerSinavListesi />} /> {/* Sınav Listesi route */}
            <Route path="log-kayit" element={<LogKayit />} />
            <Route path="rapor" element={<Rapor />} />
            <Route path="evrak" element={<EvrakList />} />
            <Route path="evrak/detay/:id" element={<GelenEvrakDetayPage />} />
            <Route path="evrak/gelen/duzenle/:id" element={<GelenEvrakDuzenlePage />} />
            <Route path="evrak/ekle" element={<GelenEvrakEklePage />} />
            <Route path="evrak/giden/detay/:id" element={<GidenEvrakDetayPage />} />
            <Route path="evrak/giden/duzenle/:id" element={<GidenEvrakDuzenlePage />} />
            <Route path="evrak/giden/ekle" element={<GidenEvrakEklePage />} />
          </Route>
          
          {/* Fallback routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;