import TopBanner from './TopBanner';
import TopBar from './TopBar';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingChat from './FloatingChat';
import NotificationModal from './NotificationModal';
import SecureLoginOverlay from './SecureLoginOverlay';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function Layout() {
  const { user, profile, loading } = useAuth();
  const settings = useSiteSettings();
  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [verifyBusy, setVerifyBusy] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const needsEmailVerify = Boolean(user && !user.emailVerified && !isStaff);

  return (
    <div className="min-h-screen bg-[#111218] text-white font-sans pb-20">
      <SecureLoginOverlay />
      <NotificationModal />
      <TopBar />
      <Header />
      <Navbar />
      
      <main className={isHome ? '' : 'max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4'}>
        {!isHome && (
          <div className="mb-2 flex items-center">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                  return;
                }
                navigate('/');
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Geri dön"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Geri</span>
            </button>
          </div>
        )}
        {needsEmailVerify && !loading && !settings.maintenanceMode && !isStaff && (
          <div className="mb-4">
            <div className="bg-[#1a1b23] border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="text-lg font-extrabold text-white mb-1">E-posta Doğrulaması Öneriliyor</div>
              <div className="text-sm text-white/70">
                Gezinmeye devam edebilirsin. Ancak ilan ekleme, para cekme ve bazi guvenli islemler dogrulanmis hesap gerektirir.
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={verifyBusy}
                  onClick={async () => {
                    if (!user) return;
                    setVerifyBusy(true);
                    try {
                      await sendEmailVerification(user);
                    } finally {
                      setVerifyBusy(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-extrabold btn-accent disabled:opacity-60"
                >
                  {verifyBusy ? 'Gonderiliyor...' : 'Dogrulama Maili Tekrar Gonder'}
                </button>
                <button
                  type="button"
                  onClick={() => void signOut(auth)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 border border-white/10"
                >
                  Cikis Yap
                </button>
              </div>
            </div>
          </div>
        )}
        {settings.maintenanceMode && !isStaff ? (
          <div className="max-w-2xl mx-auto py-16">
            <div className="bg-[#1a1b23] border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-2xl font-extrabold text-white mb-2">Bakım Modu</div>
              <div className="text-gray-400">{settings.maintenanceMessage}</div>
            </div>
          </div>
        ) : (
          <>
            {isHome ? <Outlet /> : <div className="page-surface rounded-2xl p-4 sm:p-6"><Outlet /></div>}
          </>
        )}
      </main>

      <Footer />
      <FloatingChat />
    </div>
  );
}
