import { Star, ShieldCheck, Search, Award, Store, TrendingUp, Clock, Users, ChevronRight, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, where, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Default banner gradients for stores
const BANNER_GRADIENTS = [
  'from-indigo-600 via-purple-600 to-pink-500',
  'from-blue-600 via-cyan-500 to-teal-400',
  'from-emerald-600 via-green-500 to-lime-400',
  'from-orange-600 via-red-500 to-yellow-400',
  'from-purple-600 via-pink-500 to-rose-400',
  'from-cyan-600 via-blue-500 to-indigo-400',
  'from-rose-600 via-pink-500 to-purple-400',
  'from-amber-600 via-orange-500 to-red-400',
];

function getBannerGradient(id: string): string {
  const hash = id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  return BANNER_GRADIENTS[Math.abs(hash) % BANNER_GRADIENTS.length];
}

function getLastActiveText(lastActiveAt: any): string {
  if (!lastActiveAt) return 'Aktiflik bilgisi yok';
  
  let date: Date;
  if (lastActiveAt?.toDate) {
    date = lastActiveAt.toDate();
  } else if (lastActiveAt instanceof Date) {
    date = lastActiveAt;
  } else {
    return 'Aktiflik bilgisi yok';
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 5) return 'Şu an aktif';
  if (minutes < 60) return `${minutes} dakika önce aktifti`;
  if (hours < 24) return `${hours} saat önce aktifti`;
  if (days === 1) return 'Dün aktifti';
  if (days < 7) return `${days} gün önce aktifti`;
  return date.toLocaleDateString('tr-TR');
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function Magazalar() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'featured' | 'top-sellers' | 'newest'>('featured');
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followBusyId, setFollowBusyId] = useState<string | null>(null);
  const [followed, setFollowed] = useState<Record<string, string>>({});
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [showAllTopSellers, setShowAllTopSellers] = useState(false);
  const [showAllNewest, setShowAllNewest] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), orderBy('soldCount', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        const fetchedStores = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().username || doc.data().displayName || 'Kullanıcı',
          avatar: doc.data().avatar || '',
          rating: Number(doc.data().rating || 0).toFixed(1),
          sales: doc.data().soldCount || 0,
          isVerified: Boolean(doc.data().isVerifiedSeller),
          storeLevel: doc.data().storeLevel || 'standard',
          lastActiveAt: doc.data().lastActiveAt || doc.data().lastLogin || null,
          followerCount: doc.data().followerCount || 0,
          description: doc.data().storeDescription || '',
          createdAt: doc.data().createdAt || null
        }));
        setStores(fetchedStores);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Mağazalar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const fetchFollowed = async () => {
      if (!user) {
        setFollowed({});
        return;
      }
      try {
        const q = query(collection(db, 'followers'), where('followerId', '==', user.uid), limit(200));
        const snap = await getDocs(q);
        const map: Record<string, string> = {};
        snap.docs.forEach((d) => {
          const data: any = d.data();
          if (data?.targetUserId) map[String(data.targetUserId)] = d.id;
        });
        setFollowed(map);
      } catch {
        setFollowed({});
      }
    };
    fetchFollowed();
  }, [user]);

  const toggleFollow = async (targetUserId: string, targetName: string) => {
    if (!user) {
      toast.error('Takip etmek için giriş yapmalısınız.');
      return;
    }
    if (user.uid === targetUserId) {
      toast.error('Kendinizi takip edemezsiniz.');
      return;
    }
    setFollowBusyId(targetUserId);
    try {
      const existingId = followed[targetUserId];
      if (existingId) {
        await deleteDoc(doc(db, 'followers', existingId));
        setFollowed((prev) => {
          const next = { ...prev };
          delete next[targetUserId];
          return next;
        });
        toast.success('Takipten çıkıldı.');
      } else {
        const ref = await addDoc(collection(db, 'followers'), {
          followerId: user.uid,
          followerName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
          targetUserId,
          createdAt: new Date().toISOString(),
        });
        setFollowed((prev) => ({ ...prev, [targetUserId]: ref.id }));
        toast.success(`${targetName} takip edildi.`);
      }
    } catch (e) {
      console.error('toggleFollow error', e);
      toast.error('Takip işlemi başarısız.');
    } finally {
      setFollowBusyId(null);
    }
  };

  // Categorize stores
  const featuredStores = stores.filter(s => s.storeLevel === 'corporate' || s.storeLevel === 'pro' || s.isVerified);
  const topSellerStores = [...stores].sort((a, b) => (b.sales || 0) - (a.sales || 0));
  const newestStores = [...stores]
    .filter(s => s.createdAt)
    .sort((a, b) => {
      const aTs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTs - aTs;
    });

  const displayedFeatured = showAllFeatured ? featuredStores : featuredStores.slice(0, 12);
  const displayedTopSellers = showAllTopSellers ? topSellerStores : topSellerStores.slice(0, 8);
  const displayedNewest = showAllNewest ? newestStores : newestStores.slice(0, 8);

  // Store Card Component
  const StoreCard = ({ store, variant = 'normal' }: { store: any; variant?: 'normal' | 'featured' | 'compact' }) => {
    const gradient = getBannerGradient(store.id);
    
    if (variant === 'featured') {
      return (
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden hover:border-[#5b68f6]/30 transition-all group">
          {/* Banner */}
          <div className={`h-32 relative bg-gradient-to-r ${gradient}`}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] via-transparent to-transparent" />
            {/* Follower Count Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-white/70" />
              <span className="text-xs font-bold text-white">{formatNumber(store.followerCount || Object.keys(followed).length)}</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-4 pb-4 relative">
            {/* Avatar */}
            <Link to={`/profile/${store.id}`} className="absolute -top-12 left-4 group/avatar">
              {store.avatar ? (
                <img src={store.avatar} alt={store.name} className="w-20 h-20 rounded-xl border-4 border-[#1a1b23] bg-[#23242f] shadow-xl group-hover/avatar:ring-2 group-hover/avatar:ring-[#5b68f6]/50 transition-all" />
              ) : (
                <div className="w-20 h-20 rounded-xl border-4 border-[#1a1b23] bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] flex items-center justify-center text-2xl text-white font-bold shadow-xl">
                  {store.name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
              )}
            </Link>
            
            <div className="flex justify-end gap-2 pt-2 mb-8">
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                <span className="text-xs font-bold text-yellow-400">{store.rating}</span>
              </div>
              {store.isVerified && (
                <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
              {(store.storeLevel === 'pro' || store.storeLevel === 'corporate') && (
                <div className="flex items-center gap-1 bg-[#5b68f6]/20 px-2 py-1 rounded">
                  <Award className="w-3.5 h-3.5 text-[#5b68f6]" />
                </div>
              )}
            </div>

            <Link to={`/profile/${store.id}`} className="block">
              <h3 className="text-base font-bold text-white group-hover:text-[#5b68f6] transition-colors truncate">
                {store.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{getLastActiveText(store.lastActiveAt)}</span>
              </div>
              {store.sales >= 100 && (
                <div className="mt-2 text-xs">
                  <span className="text-emerald-400 font-medium">Son 30 günde +{Math.floor(store.sales / 10)} satış</span>
                </div>
              )}
            </Link>
            
            <button
              type="button"
              onClick={() => toggleFollow(store.id, store.name)}
              disabled={followBusyId === store.id}
              className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all ${
                followed[store.id]
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#5b68f6] hover:bg-[#4a55d6] text-white'
              } disabled:opacity-50`}
            >
              {followBusyId === store.id ? '...' : followed[store.id] ? 'Takip Ediliyor' : 'Takip Et'}
            </button>
          </div>
        </div>
      );
    }

    // Compact variant for top sellers and newest
    return (
      <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden hover:border-[#5b68f6]/30 transition-all group">
        <div className={`h-20 relative bg-gradient-to-r ${gradient}`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] via-transparent to-transparent" />
        </div>
        
        <div className="px-4 pb-4 relative">
          <Link to={`/profile/${store.id}`} className="absolute -top-10 left-4">
            {store.avatar ? (
              <img src={store.avatar} alt={store.name} className="w-16 h-16 rounded-lg border-4 border-[#1a1b23] bg-[#23242f] shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-lg border-4 border-[#1a1b23] bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] flex items-center justify-center text-xl text-white font-bold shadow-lg">
                {store.name?.charAt(0)?.toUpperCase() || 'M'}
              </div>
            )}
          </Link>
          
          <div className="flex justify-between items-center pt-1 mb-6">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] text-gray-400">{getLastActiveText(store.lastActiveAt)}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-500/20 px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-[11px] font-bold text-yellow-400">{store.rating}</span>
            </div>
          </div>

          <Link to={`/profile/${store.id}`}>
            <h3 className="text-sm font-bold text-white group-hover:text-[#5b68f6] transition-colors truncate flex items-center gap-1.5">
              {store.name}
              {store.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
              {(store.storeLevel === 'pro' || store.storeLevel === 'corporate') && <Award className="w-3.5 h-3.5 text-[#5b68f6]" />}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-400">
              <Users className="w-3 h-3 inline mr-1" />
              <span className="font-medium text-white">{formatNumber(store.followerCount || 0)}</span>
            </div>
            <button
              type="button"
              onClick={() => toggleFollow(store.id, store.name)}
              disabled={followBusyId === store.id}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                followed[store.id]
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-[#5b68f6] hover:bg-[#4a55d6] text-white'
              } disabled:opacity-50`}
            >
              {followBusyId === store.id ? '...' : followed[store.id] ? 'Takip Ediliyor' : 'Takip Et'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1a1b23] via-[#2a3050] to-[#1a1b23] rounded-2xl border border-white/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5b68f6] via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 justify-center lg:justify-start">
              <Store className="w-8 h-8 text-[#5b68f6]" />
              Öne Çıkan Mağazalar
            </h1>
            <p className="text-gray-400 max-w-xl">
              itemTR'ın en güvenilir, en çok satış yapan ve en yüksek puana sahip mağazalarını keşfedin.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/magaza-basvurusu"
              className="flex items-center gap-2 bg-gradient-to-r from-[#5b68f6] to-[#8b5cf6] hover:from-[#4a55d6] hover:to-[#7c5ce7] text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-[#5b68f6]/25 transition-all"
            >
              <Store className="w-5 h-5" />
              Mağaza Başvurusu
            </Link>
            <Link 
              to="/magazalar"
              className="flex items-center gap-2 bg-[#23242f] hover:bg-[#2d2e3b] text-white px-6 py-3 rounded-xl font-medium border border-white/10 transition-all"
            >
              Tüm Mağazalar
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mt-6 max-w-md mx-auto lg:mx-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Mağaza adı ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111218] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] focus:ring-1 focus:ring-[#5b68f6]/20 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-[#5b68f6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Mağazalar yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* Featured Stores Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#5b68f6]" />
                  Öne Çıkan Mağazalar
                </h2>
                <p className="text-sm text-gray-400 mt-1">itemTR'da en çok tercih edilen mağazalar</p>
              </div>
              <Link to="/magazalar" className="text-sm text-[#5b68f6] hover:text-[#4a55d6] font-medium flex items-center gap-1">
                Tüm Mağazalar
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedFeatured
                .filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(store => (
                  <StoreCard key={store.id} store={store} variant="featured" />
                ))}
            </div>
            
            {featuredStores.filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 12 && !showAllFeatured && (
              <div className="text-center mt-6">
                <button 
                  onClick={() => setShowAllFeatured(true)}
                  className="bg-[#23242f] hover:bg-[#2d2e3b] text-white px-6 py-2.5 rounded-lg text-sm font-medium border border-white/10 transition-colors"
                >
                  Daha fazla öne çıkan mağaza göster
                </button>
              </div>
            )}
          </section>

          {/* Top Sellers Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  En Çok Satış Yapan Mağazalar
                </h2>
                <p className="text-sm text-gray-400 mt-1">Bu listelemede son 30 gün baz alınmıştır</p>
              </div>
              <Link to="/magazalar" className="text-sm text-[#5b68f6] hover:text-[#4a55d6] font-medium flex items-center gap-1">
                Tüm Mağazalar
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedTopSellers
                .filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((store, index) => (
                  <div key={store.id} className="relative">
                    {store.sales >= 1000 && (
                      <div className="absolute -top-2 left-4 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                        Son 30 günde +{formatNumber(Math.floor(store.sales / 10))} satış
                      </div>
                    )}
                    <StoreCard store={store} variant="compact" />
                  </div>
                ))}
            </div>
            
            {topSellerStores.filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 8 && !showAllTopSellers && (
              <div className="text-center mt-6">
                <button 
                  onClick={() => setShowAllTopSellers(true)}
                  className="bg-[#23242f] hover:bg-[#2d2e3b] text-white px-6 py-2.5 rounded-lg text-sm font-medium border border-white/10 transition-colors"
                >
                  Daha fazla mağaza göster
                </button>
              </div>
            )}
          </section>

          {/* Newest Stores Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  En Yeni Mağazalar
                </h2>
                <p className="text-sm text-gray-400 mt-1">itemTR'da en son mağaza olanlar aşağıda listelenmektedir</p>
              </div>
              <Link to="/magazalar" className="text-sm text-[#5b68f6] hover:text-[#4a55d6] font-medium flex items-center gap-1">
                Tüm Mağazalar
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedNewest
                .filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(store => (
                  <StoreCard key={store.id} store={store} variant="compact" />
                ))}
            </div>
            
            {newestStores.filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 8 && !showAllNewest && (
              <div className="text-center mt-6">
                <button 
                  onClick={() => setShowAllNewest(true)}
                  className="bg-[#23242f] hover:bg-[#2d2e3b] text-white px-6 py-2.5 rounded-lg text-sm font-medium border border-white/10 transition-colors"
                >
                  Daha fazla mağaza göster
                </button>
              </div>
            )}
          </section>

          {/* Empty State */}
          {stores.filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div className="text-center py-16 bg-[#1a1b23] rounded-xl border border-white/5">
              <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Mağaza bulunamadı</p>
              <p className="text-gray-500 text-sm mt-1">Arama filtresini temizleyip tekrar deneyin.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[#5b68f6] hover:text-[#4a55d6] text-sm font-medium"
              >
                Filtreyi Temizle →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
