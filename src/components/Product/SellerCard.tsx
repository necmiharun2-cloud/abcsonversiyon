import { Shield, Smartphone, MessageSquare, ShoppingCart, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import { addDoc, collection, deleteDoc, doc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useEffect, useState } from 'react';

interface SellerCardProps {
  sellerName?: string;
  sellerAvatar?: string;
  sellerId?: string;
  productId?: string;
  productTitle?: string;
}

export default function SellerCard({ 
  sellerName = 'ValoKing', 
  sellerAvatar, 
  sellerId,
  productId,
  productTitle 
}: SellerCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [followDocId, setFollowDocId] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);

  const handleComingSoon = (feature: string) => {
    toast.success(`${feature} özelliği yakında eklenecek!`);
  };

  useEffect(() => {
    const fetchFollow = async () => {
      if (!user || !sellerId || user.uid === sellerId) {
        setFollowDocId(null);
        return;
      }
      try {
        const q = query(
          collection(db, 'followers'),
          where('followerId', '==', user.uid),
          where('targetUserId', '==', sellerId),
          limit(1)
        );
        const snap = await getDocs(q);
        setFollowDocId(snap.empty ? null : snap.docs[0].id);
      } catch {
        setFollowDocId(null);
      }
    };
    fetchFollow();
  }, [user, sellerId]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Takip etmek için giriş yapmalısınız.');
      navigate('/login');
      return;
    }
    if (!sellerId) {
      toast.error('Satıcı bilgisi bulunamadı.');
      return;
    }
    if (user.uid === sellerId) {
      toast.error('Kendinizi takip edemezsiniz.');
      return;
    }
    setFollowBusy(true);
    try {
      if (followDocId) {
        await deleteDoc(doc(db, 'followers', followDocId));
        setFollowDocId(null);
        toast.success('Takipten çıkıldı.');
      } else {
        const ref = await addDoc(collection(db, 'followers'), {
          followerId: user.uid,
          followerName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
          targetUserId: sellerId,
          createdAt: new Date().toISOString(),
        });
        setFollowDocId(ref.id);
        toast.success('Takip edildi.');
      }
    } catch (e) {
      console.error('follow toggle error', e);
      toast.error('Takip işlemi başarısız.');
    } finally {
      setFollowBusy(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      toast.error('Mesaj göndermek için giriş yapmalısınız.');
      navigate('/login');
      return;
    }

    if (!sellerId) {
      toast.error('Satıcı bilgisi bulunamadı.');
      return;
    }

    if (user.uid === sellerId) {
      toast.error('Kendinize mesaj gönderemezsiniz.');
      return;
    }

    try {
      const participantData = {
        [user.uid]: { name: user.displayName || 'Kullanıcı', avatar: user.photoURL || '' },
        [sellerId]: { name: sellerName, avatar: sellerAvatar || '' }
      };
      
      const productInfo = productId ? { productId, productTitle: productTitle || 'Ürün' } : undefined;
      
      const chatId = await chatService.createOrGetChat(
        [user.uid, sellerId],
        participantData,
        productInfo
      );
      
      if (chatId) {
        navigate('/mesajlarim', { state: { activeChatId: chatId } });
      } else {
        toast.error('Sohbet oluşturulamadı.');
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      toast.error('Sohbet başlatılamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase">Satıcı Bilgileri</span>
        <button 
          onClick={handleFollowToggle}
          disabled={followBusy}
          className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {followBusy ? '...' : followDocId ? 'Takibi Bırak' : 'Takip Et'}
        </button>
      </div>

      {/* Profile */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={sellerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName || 'S')}&background=5b68f6&color=fff&size=128`} 
                alt={sellerName} 
                className="w-12 h-12 rounded-lg object-cover" 
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#1a1b23]"></div>
            </div>
            <div>
              <div className="text-white font-bold text-sm flex items-center gap-1.5">
                {sellerName}
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <Smartphone className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-lg">{Math.floor(Math.random() * 5000) + 100}</div>
            <div className="text-[10px] text-gray-400">Başarılı İşlem</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          {sellerId ? (
            <Link 
              to={`/profile/${sellerId}`}
              state={{ fallbackProfile: { id: sellerId, username: sellerName, avatar: sellerAvatar } }}
              className="flex-1 bg-[#23242f] hover:bg-[#2d2e3b] text-white text-xs font-medium py-2 rounded transition-colors flex items-center justify-center gap-2"
            >
              Satıcı Profili
            </Link>
          ) : (
            <button 
              onClick={() => handleComingSoon('Satıcı Profili')}
              className="flex-1 bg-[#23242f] hover:bg-[#2d2e3b] text-white text-xs font-medium py-2 rounded transition-colors flex items-center justify-center gap-2"
            >
              Satıcı Profili
            </button>
          )}
          <button 
            onClick={() => handleComingSoon('Sepete Ekle')}
            className="w-10 bg-[#23242f] hover:bg-[#2d2e3b] text-white rounded flex items-center justify-center transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button 
            onClick={handleMessage}
            className="flex-1 bg-[#23242f] hover:bg-[#2d2e3b] text-white text-xs font-medium py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Mesaj Gönder
          </button>
        </div>

        {/* Risk Score */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Satıcı Risk Skoru</span>
            <span className="text-emerald-500 font-medium">Düşük Risk</span>
          </div>
          <div className="h-1.5 bg-[#23242f] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/4 rounded-full"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-[10px] text-gray-400 pt-4 border-t border-white/5">
          <div>Ort. Cevap: <span className="text-white font-medium">3dk</span></div>
          <div>Son Görülme: <span className="text-white font-medium">Şimdi</span></div>
        </div>
      </div>
    </div>
  );
}
