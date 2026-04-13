import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { 
  Server, Users, Globe, MessageCircle, ExternalLink, Crown, 
  Star, Clock, Share2, ArrowLeft, Gamepad2, Heart, Shield,
  Zap, Check, Copy, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase';

const GAME_CATEGORIES: Record<string, { color: string; icon: typeof Server }> = {
  'Discord': { color: '#5865F2', icon: MessageCircle },
  'Valorant': { color: '#FF4655', icon: Gamepad2 },
  'CS2': { color: '#DE9B35', icon: Gamepad2 },
  'Minecraft': { color: '#62B47A', icon: Server },
  'PUBG Mobile': { color: '#F2A900', icon: Gamepad2 },
  'Roleplay': { color: '#9B59B6', icon: Crown },
  'Diğer': { color: '#6B7280', icon: Server },
};

export default function ServerTanitimiDetay() {
  const { id } = useParams();
  const [item, setItem] = useState<any | null>(null);
  const [relatedServers, setRelatedServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        // Fetch main item
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          const data = { id: snap.id, ...(snap.data() as object) } as { id: string; subcategory?: string; [key: string]: any };
          setItem(data);
          
          // Fetch related servers
          if (data.subcategory) {
            const relatedQ = query(
              collection(db, 'products'),
              where('category', '==', 'SERVER TANITIMI'),
              where('subcategory', '==', data.subcategory),
              limit(4)
            );
            const relatedSnap = await getDocs(relatedQ);
            setRelatedServers(
              relatedSnap.docs
                .filter(d => d.id !== id)
                .map(d => ({ id: d.id, ...(d.data() as object) }))
                .slice(0, 3)
            );
          }
        }
      } catch (error) {
        console.error('Error fetching server:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopyalandı!');
    } catch {
      toast.error('Kopyalanamadı.');
    }
  };

  const handleCopyInvite = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Davet linki kopyalandı!');
    } catch {
      toast.error('Kopyalanamadı.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-8 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16 bg-[#1a1b23] rounded-xl border border-white/5">
        <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Server Bulunamadı</h2>
        <p className="text-gray-400 mb-6">Bu tanıtım kaldırılmış veya hiç yayınlanmamış olabilir.</p>
        <Link 
          to="/server-tanitimi" 
          className="inline-flex items-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tüm Tanıtımlara Dön
        </Link>
      </div>
    );
  }

  const gameConfig = GAME_CATEGORIES[item.subcategory] || GAME_CATEGORIES['Diğer'];
  const GameIcon = gameConfig.icon;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link 
        to="/server-tanitimi" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Tüm Server Tanıtımları
      </Link>

      {/* Main Content */}
      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-48 sm:h-72 lg:h-80">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] via-black/30 to-transparent"></div>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: gameConfig.color }}
            >
              <GameIcon className="w-4 h-4" />
              {item.subcategory || 'SERVER'}
            </span>
          </div>

          {/* Stats Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-fuchsia-400" />
              <span className="text-white text-sm font-medium">
                {item.memberCount?.toLocaleString() || 'N/A'} Üye
              </span>
            </div>
            {item.onlineCount > 0 && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">
                  {item.onlineCount.toLocaleString()} Çevrimiçi
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Side - Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{item.title}</h1>
              
              {/* Features */}
              {item.features && item.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {item.features.map((feature: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 bg-[#23242f] text-gray-300 text-sm px-3 py-1.5 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="bg-[#111218] rounded-xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Hakkında
                </h3>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">{item.description}</p>
              </div>

              {/* Publisher Info */}
              <div className="flex items-center gap-4 p-4 bg-[#23242f] rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                  {(item.sellerName || 'K')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold">{item.sellerName || 'Kullanıcı'}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {item.createdAt?.toDate?.().toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) || 'Yakın zamanda'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="lg:w-72 space-y-4">
              {/* Invite Card */}
              {item.inviteLink && (
                <div className="bg-gradient-to-br from-fuchsia-500/10 to-purple-600/10 border border-fuchsia-500/20 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-fuchsia-400" />
                    Hemen Katıl
                  </h3>
                  <button
                    onClick={() => handleCopyInvite(item.inviteLink)}
                    className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Davet Linkini Kopyala
                  </button>
                  <a
                    href={item.inviteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-2 bg-[#23242f] hover:bg-[#2d2e3b] text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Doğrudan Aç
                  </a>
                </div>
              )}

              {/* Share Card */}
              <div className="bg-[#111218] rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Paylaş</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 bg-[#23242f] hover:bg-[#2d2e3b] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Linki Kopyala
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#111218] rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-400 mb-3">İstatistikler</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Toplam Üye</span>
                    <span className="text-sm font-bold text-white">{item.memberCount?.toLocaleString() || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Çevrimiçi</span>
                    <span className="text-sm font-bold text-emerald-400">{item.onlineCount?.toLocaleString() || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Kategori</span>
                    <span className="text-sm font-bold text-white">{item.subcategory || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Servers */}
      {relatedServers.length > 0 && (
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Benzer Sunucular
            </h2>
            <Link 
              to="/server-tanitimi" 
              className="text-sm text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1"
            >
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedServers.map((server) => (
              <Link
                key={server.id}
                to={`/server-tanitimi/${server.id}`}
                className="group bg-[#23242f] rounded-xl overflow-hidden hover:ring-2 hover:ring-fuchsia-500/30 transition-all"
              >
                <div className="aspect-video relative">
                  <img 
                    src={server.image} 
                    alt={server.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  {server.memberCount > 0 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      <Users className="w-3 h-3" />
                      {server.memberCount.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-white font-bold text-sm line-clamp-1 group-hover:text-fuchsia-400 transition-colors">
                    {server.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
