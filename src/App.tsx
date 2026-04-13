/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppErrorBoundary from './components/AppErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Roblox from './pages/Roblox';
import Product from './pages/Product';
import IlanPazari from './pages/IlanPazari';
import AlimIlanlari from './pages/AlimIlanlari';
import Topluluk from './pages/Topluluk';
import Magazalar from './pages/Magazalar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Reviews from './pages/Reviews';
import Notifications from './pages/Notifications';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import SoldListings from './pages/SoldListings';
import MyListings from './pages/MyListings';
import Favorites from './pages/Favorites';
import OrderDetail from './pages/OrderDetail';
import Withdraw from './pages/Withdraw';
import Support from './pages/Support';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import DistanceSales from './pages/DistanceSales';
import RefundPolicy from './pages/RefundPolicy';
import FAQ from './pages/FAQ';
import Deals from './pages/Deals';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Streamers from './pages/Streamers';
import StreamerProfile from './pages/StreamerProfile';
import Giveaways from './pages/Giveaways';
import CDKey from './pages/CDKey';
import TopUp from './pages/TopUp';
import GiftCards from './pages/GiftCards';
import IlanEkle from './pages/IlanEkle';
import IlanYukariTasima from './pages/IlanYukariTasima';
import FavoriSistemi from './pages/FavoriSistemi';
import AdminPanel from './pages/AdminPanel';
import TumKategoriler from './pages/TumKategoriler';
import ServerTanitimi from './pages/ServerTanitimi';
import ServerTanitimiDetay from './pages/ServerTanitimiDetay';
import MagazaBasvurusu from './pages/MagazaBasvurusu';
import BakiyeYukle from './pages/BakiyeYukle';
import ShopierCheckout from './pages/ShopierCheckout';
import ShopierPaymentResult from './pages/ShopierPaymentResult';
import { missingFirebaseEnvKeys } from './firebase';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <LanguageProvider>
              <BrowserRouter>
                {missingFirebaseEnvKeys.length > 0 && (
                  <div className="max-w-[1400px] mx-auto px-4 pt-3">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-lg px-3 py-2">
                      Firebase env eksik: {missingFirebaseEnvKeys.join(', ')}. Vercel Environment Variables alanına ekleyip redeploy et.
                    </div>
                  </div>
                )}
                <Toaster position="top-center" toastOptions={{
                  style: {
                    background: '#1a1b23',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  },
                  success: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
                      border: '1px solid rgba(34,197,94,0.5)',
                    },
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#1a1b23'
                    }
                  },
                  error: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
                      border: '1px solid rgba(239,68,68,0.5)',
                    },
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#1a1b23'
                    }
                  },
                  loading: {
                    style: {
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)',
                      border: '1px solid rgba(59,130,246,0.5)',
                    },
                    iconTheme: {
                      primary: '#3b82f6',
                      secondary: '#1a1b23'
                    }
                  }
                }} />
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
              <Route path="roblox" element={<Roblox />} />
              <Route path="product/:id" element={<Product />} />
              <Route path="ilan-pazari" element={<IlanPazari />} />
              <Route path="alim-ilanlari" element={<AlimIlanlari />} />
              <Route path="topluluk" element={<Topluluk />} />
              <Route path="server-tanitimi" element={<ServerTanitimi />} />
              <Route path="server-tanitimi/:id" element={<ServerTanitimiDetay />} />
              <Route path="tum-kategoriler" element={<TumKategoriler />} />
              <Route path="magazalar" element={<Magazalar />} />
                            <Route path="magaza-basvurusu" element={<MagazaBasvurusu />} />
              <Route path="cekilisler" element={<Giveaways />} />
              <Route path="cd-key" element={<CDKey />} />
              <Route path="top-up" element={<TopUp />} />
              <Route path="hediye-kartlari" element={<GiftCards />} />
              <Route path="ilan-ekle" element={<IlanEkle />} />
              <Route path="favori-sistemi" element={<FavoriSistemi />} />
              <Route path="ilan-yukari-tasima" element={<IlanYukariTasima />} />
              <Route path="gizlilik-politikasi" element={<Privacy />} />
              <Route path="mesafeli-satis-sozlesmesi" element={<DistanceSales />} />
              <Route path="iade-politikasi" element={<RefundPolicy />} />
              <Route path="sss" element={<FAQ />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="sifremi-unuttum" element={<ForgotPassword />} />
              <Route path="hakkimizda" element={<About />} />
              <Route path="kullanici-sozlesmesi" element={<Terms />} />
              <Route path="firsatlar" element={<Deals />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="yayincilar" element={<Streamers />} />
                            <Route path="destekle/:slug" element={<StreamerProfile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:id" element={<Profile />} />
              <Route path="mesajlarim" element={<Messages />} />
              <Route path="kontrol-merkezi" element={<Dashboard />} />
              <Route path="ayarlar" element={<Settings />} />
              <Route path="degerlendirmelerim" element={<Reviews />} />
              <Route path="bildirimler" element={<Notifications />} />
              <Route path="sepet" element={<Cart />} />
              <Route path="odeme/shopier" element={<ShopierCheckout />} />
              <Route path="odeme/shopier/sonuc" element={<ShopierPaymentResult />} />
              <Route path="cart" element={<Navigate to="/sepet" replace />} />
              <Route path="siparislerim" element={<Orders />} />
              <Route path="orders" element={<Navigate to="/siparislerim" replace />} />
              <Route path="siparis/:id" element={<OrderDetail />} />
              <Route path="sattigim-ilanlar" element={<SoldListings />} />
              <Route path="ilanlarim" element={<MyListings />} />
              <Route path="favorilerim" element={<Favorites />} />
              <Route path="para-cek" element={<Withdraw />} />
                            <Route path="bakiye-yukle" element={<BakiyeYukle />} />
              <Route path="destek-sistemi" element={<Support />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="admin/login" element={<Navigate to="/login?next=/admin" replace />} />
              <Route path="dashboard" element={<Navigate to="/kontrol-merkezi" replace />} />
              {/* Fallback for other routes */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
          </LanguageProvider>
      </FavoritesProvider>
    </CartProvider>
    </AuthProvider>
    </AppErrorBoundary>
  );
}
