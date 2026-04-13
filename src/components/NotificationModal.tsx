import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { safeGetItem, safeSetItem } from '../lib/safeStorage';

/** Bu sayfalarda tam ekran modal giriş/kayıt akışını bozmaması için gösterilmez */
const AUTH_PATH_PREFIXES = ['/login', '/register', '/sifremi-unuttum'];

export default function NotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const isAuthRoute = AUTH_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (isAuthRoute) return;
    // Sadece ilk ziyarette; tarayıcı bildirim izni zaten verilmişse gereksiz rahatsız etme
    const hasSeenModal = safeGetItem('hasSeenNotificationModal');
    if (hasSeenModal) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      safeSetItem('hasSeenNotificationModal', 'true');
      return;
    }
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isAuthRoute]);

  const handleClose = () => {
    setIsOpen(false);
    safeSetItem('hasSeenNotificationModal', 'true');
  };

  const handleEnableNotifications = () => {
    toast.success('Bildirimleri açmak için tarayıcı adres çubuğundaki kilit ikonuna tıklayıp "Bildirimler" seçeneğini aktif edebilirsiniz.', {
      duration: 6000,
      icon: '🔔'
    });
    handleClose();
  };

  if (isAuthRoute || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#23242f] rounded-2xl p-8 max-w-[500px] w-full relative shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
        {/* Kapatma Butonu */}
        <button 
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* İkon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <BellOff className="w-16 h-16 text-[#ff6b6b]" strokeWidth={1.5} />
            {/* Zzz efekti için küçük detaylar eklenebilir, şimdilik BellOff kullanıyoruz */}
          </div>
        </div>

        {/* Başlık */}
        <h2 className="text-xl font-bold text-white text-center mb-4">
          Bildirim İznine İhtiyacımız Var!
        </h2>

        {/* Metin 1 */}
        <p className="text-gray-300 text-center text-sm mb-4 leading-relaxed">
          Tarayıcınızda bildirimler engellendiği için size bildirim gönderemiyoruz. Satın aldığınız ilanlar, kullanıcılarla mesajlaşmalar gibi önemli işlemlerinizi size iletemiyoruz.
        </p>

        {/* Metin 2 (Kırmızı) */}
        <p className="text-[#ff6b6b] text-center text-sm mb-8 leading-relaxed">
          Bildirimlere nasıl izin vereceğinizi bilmiyorsanız lütfen aşağıdaki izinleri aç butonuna tıklayın ve yönlendirilen sayfayı inceleyin.
        </p>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            type="button"
            onClick={handleEnableNotifications}
            className="w-full sm:w-auto bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Bildirim İzinlerini Aç
          </button>
          <button 
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto bg-[#4b5563] hover:bg-[#374151] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Hayır, İstemiyorum
          </button>
        </div>
      </div>
    </div>
  );
}
