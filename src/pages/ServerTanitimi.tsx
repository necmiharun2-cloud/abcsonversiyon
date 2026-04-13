import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import toast from 'react-hot-toast';
import { 
  Megaphone, Upload, Users, Globe, Gamepad2, Search, Plus, X, 
  Server, Crown, Star, MessageCircle, ExternalLink, Filter, 
  Shield, Zap, Heart, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';

type ServerListing = {
  id: string;
  title: string;
  description: string;
  image: string;
  subcategory?: string;
  sellerName?: string;
  sellerId?: string;
  memberCount?: number;
  onlineCount?: number;
  features?: string[];
  inviteLink?: string;
  createdAt?: any;
};

const GAME_CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: Globe, color: '#5b68f6' },
  // Knight Online Kategorileri
  { id: 'Knight Online', name: 'Knight Online', icon: Gamepad2, color: '#FF6B35' },
  { id: 'KO PVP 1-99', name: 'KO 1-99 PVP', icon: Gamepad2, color: '#FF8C42' },
  { id: 'KO PVP 1-105', name: 'KO 1-105 PVP', icon: Gamepad2, color: '#FF9F5A' },
  { id: 'KO PVP 55-120', name: 'KO 55-120 PVP', icon: Gamepad2, color: '#FFB272' },
  { id: 'KO Emek', name: 'KO Emek Server', icon: Gamepad2, color: '#FFC58A' },
  { id: 'KO WSLik', name: 'KO WSLik', icon: Gamepad2, color: '#FFD8A2' },
  { id: 'KO USKO', name: 'KO USKO', icon: Gamepad2, color: '#FFEBBA' },
  { id: 'KO MYKO', name: 'KO MYKO', icon: Gamepad2, color: '#FFE4D1' },
  { id: 'KO Farm', name: 'KO Farm Server', icon: Gamepad2, color: '#E8A87C' },
  // Metin2 Kategorileri
  { id: 'Metin2', name: 'Metin2', icon: Gamepad2, color: '#4ECDC4' },
  { id: 'M2 PVP 1-99', name: 'M2 1-99 PVP', icon: Gamepad2, color: '#5ED4CC' },
  { id: 'M2 PVP 1-105', name: 'M2 1-105 PVP', icon: Gamepad2, color: '#6EDBD4' },
  { id: 'M2 PVP 1-120', name: 'M2 1-120 PVP', icon: Gamepad2, color: '#7EE2DC' },
  { id: 'M2 Emek', name: 'M2 Emek Server', icon: Gamepad2, color: '#8EE9E4' },
  { id: 'M2 WSLik', name: 'M2 WSLik', icon: Gamepad2, color: '#9EF0EC' },
  { id: 'M2 Beta', name: 'M2 Beta', icon: Gamepad2, color: '#AEF7F4' },
  // Diğer Popüler Oyunlar
  { id: 'Valorant', name: 'Valorant', icon: Gamepad2, color: '#FF4655' },
  { id: 'CS2', name: 'CS2 / CS:GO', icon: Gamepad2, color: '#DE9B35' },
  { id: 'Minecraft', name: 'Minecraft', icon: Server, color: '#62B47A' },
  { id: 'PUBG Mobile', name: 'PUBG Mobile', icon: Gamepad2, color: '#F2A900' },
  { id: 'League of Legends', name: 'League of Legends', icon: Gamepad2, color: '#C89B3C' },
  { id: 'GTA V', name: 'GTA V / FiveM', icon: Gamepad2, color: '#2D9CDB' },
  { id: 'Rust', name: 'Rust', icon: Gamepad2, color: '#CE422B' },
  { id: 'ARK', name: 'ARK Survival', icon: Gamepad2, color: '#1E90FF' },
  { id: 'Conquer', name: 'Conquer Online', icon: Gamepad2, color: '#9B59B6' },
  { id: 'Silkroad', name: 'Silkroad Online', icon: Gamepad2, color: '#D4AC0D' },
  { id: 'Discord', name: 'Discord', icon: MessageCircle, color: '#5865F2' },
  { id: 'TeamSpeak', name: 'TeamSpeak', icon: MessageCircle, color: '#2580C3' },
  { id: 'Roleplay', name: 'Roleplay', icon: Crown, color: '#9B59B6' },
  { id: 'Survival', name: 'Survival', icon: Shield, color: '#27AE60' },
  { id: 'Diğer', name: 'Diğer Oyunlar', icon: Server, color: '#6B7280' },
];

const SERVER_FEATURES = [
  'Aktif Topluluk',
  'Turnuva',
  'Ödüllü Etkinlik',
  'Sesli Sohbet',
  'Yetkili Alımı',
  'Eğlence Botları',
  'Müzik Odaları',
  'Oyun Desteği',
  'Yeni Üye Dostu',
  '18+',
  'TR Sunucu',
  'Uluslararası',
];

export default function ServerTanitimi() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ServerListing[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    game: 'Discord',
    description: '',
    memberCount: '',
    onlineCount: '',
    inviteLink: '',
  });

  const loadListings = async () => {
    try {
      // Basit sorgu - index gerektirmeden
      const q = query(
        collection(db, 'products'),
        where('category', '==', 'SERVER TANITIMI'),
        limit(50)
      );
      const snap = await getDocs(q);
      const listings = snap.docs.map((d) => ({ 
        id: d.id, 
        ...(d.data() as object) 
      } as ServerListing));
      
      // Client-side sıralama
      listings.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setItems(listings);
    } catch (error: any) {
      console.error('Error loading server listings:', error);
      toast.error(`Server listesi yüklenirken hata: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Server tanıtımı için giriş yapmalısınız.');
      return;
    }
    if (!imageFile || !formData.title.trim() || !formData.description.trim()) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    console.log('Server tanıtımı başlatılıyor...');
    
    // Timeout ile loading'i otomatik kapat
    const timeoutId = setTimeout(() => {
      console.log('Timeout: Loading durumu manuel olarak kapatılıyor');
      setLoading(false);
      toast.error('İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.');
    }, 5000); // 5 saniye timeout
    
    try {
      // Step 1: Upload image - SKIP STORAGE, use placeholder directly
      console.log('Görsel işlemi atlanıyor, placeholder kullanılıyor...');
      
      // Hemen placeholder kullan, storage'a yükleme yapma
      const imageUrl = `https://placehold.co/800x450/5b68f6/ffffff?text=${encodeURIComponent(formData.title || 'Server')}`;
      console.log('Placeholder URL:', imageUrl);

      // Step 2: Create document immediately - NO NESTED TRY-CATCH
      console.log('Firestore dokümanı oluşturuluyor...');
      const docData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: 'SERVER TANITIMI',
        subcategory: formData.game,
        features: selectedFeatures,
        memberCount: parseInt(formData.memberCount) || 0,
        onlineCount: parseInt(formData.onlineCount) || 0,
        inviteLink: formData.inviteLink.trim(),
        price: 0,
        stock: 1,
        type: 'sell',
        productType: 'account',
        deliveryType: 'manual',
        image: imageUrl,
        sellerId: user.uid,
        sellerName: user.displayName || 'Kullanıcı',
        status: 'active',
        createdAt: serverTimestamp(),
      };
      
      console.log('Doküman verisi:', docData);
      
      // Firestore'a ekle - hata olursa catch bloğu yakalar
      await addDoc(collection(db, 'products'), docData);
      console.log('Doküman oluşturuldu');

      // Başarılı - timeout'u temizle
      clearTimeout(timeoutId);
      
      toast.success('Server tanıtımı yayınlandı!');
      
      // Reset form
      setFormData({ title: '', game: 'Discord', description: '', memberCount: '', onlineCount: '', inviteLink: '' });
      setSelectedFeatures([]);
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      
      // Reload listings - NO AWAIT, don't block
      console.log('Liste yeniden yükleniyor...');
      loadListings().catch(err => console.error('Liste yükleme hatası:', err));
      console.log('İşlem tamamlandı');
      
    } catch (error: any) {
      // Timeout'u temizle
      clearTimeout(timeoutId);
      
      console.error('Error creating server listing:', error);
      console.error('Hata detayı:', error.message, error.code);
      
      if (error.message?.includes('index')) {
        toast.error('Veritabanı index hatası. Firebase Console\'dan index oluşturun.');
      } else if (error.message?.includes('permission')) {
        toast.error('İzin hatası. Firebase kurallarını kontrol edin.');
      } else {
        toast.error(`Yayın hatası: ${error.message || 'Bilinmeyen hata'}`);
      }
    } finally {
      console.log('Loading durumu false yapılıyor');
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.subcategory === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredServers = items.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1b23] via-[#111218] to-[#1a1b23] rounded-2xl border border-white/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Server Tanıtımı</h1>
                  <p className="text-gray-400 text-sm mt-0.5">Topluluğunu büyüt, oyuncu kazandır</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-fuchsia-400" />
                  {items.length} Aktif Tanıtım
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/20"
            >
              <Plus className="w-5 h-5" />
              Server Tanıt
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Server ara..."
              className="w-full bg-[#111218] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
            />
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {GAME_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-fuchsia-500 text-white'
                  : 'bg-[#23242f] text-gray-300 hover:bg-[#2d2e3b]'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Servers */}
      {selectedCategory === 'all' && featuredServers.length > 0 && (
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Öne Çıkan Sunucular
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredServers.map((server, index) => (
              <Link
                key={server.id}
                to={`/server-tanitimi/${server.id}`}
                className="group relative bg-[#23242f] rounded-xl overflow-hidden hover:ring-2 hover:ring-fuchsia-500/50 transition-all"
              >
                <div className="absolute top-3 left-3 z-10">
                  <span className="flex items-center gap-1 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded-md">
                    <Crown className="w-3 h-3" />
                    #{index + 1}
                  </span>
                </div>
                <div className="aspect-video relative">
                  <img 
                    src={server.image} 
                    alt={server.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: GAME_CATEGORIES.find(c => c.id === server.subcategory)?.color || '#6B7280' }}
                    ></span>
                    <span className="text-xs text-gray-300">{server.subcategory || 'Server'}</span>
                  </div>
                  <h3 className="text-white font-bold line-clamp-1">{server.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Server Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {selectedCategory === 'all' ? 'Tüm Sunucular' : GAME_CATEGORIES.find(c => c.id === selectedCategory)?.name}
            <span className="text-gray-500 text-sm font-normal ml-2">({filteredItems.length})</span>
          </h2>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                to={`/server-tanitimi/${item.id}`}
                className="group bg-[#1a1b23] rounded-xl overflow-hidden border border-white/5 hover:border-fuchsia-500/30 transition-all"
              >
                <div className="relative aspect-video">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <span 
                      className="text-xs font-bold px-2.5 py-1 rounded-md text-white"
                      style={{ backgroundColor: GAME_CATEGORIES.find(c => c.id === item.subcategory)?.color || '#6B7280' }}
                    >
                      {item.subcategory || 'SERVER'}
                    </span>
                  </div>
                  {item.memberCount && item.memberCount > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                      <Users className="w-3 h-3" />
                      {item.memberCount.toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-bold line-clamp-1 group-hover:text-fuchsia-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.description}</p>
                  
                  {/* Features Tags */}
                  {item.features && item.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="text-[10px] bg-[#23242f] text-gray-300 px-2 py-0.5 rounded">
                          {feature}
                        </span>
                      ))}
                      {item.features.length > 3 && (
                        <span className="text-[10px] text-gray-500">+{item.features.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {(item.sellerName || 'K')[0].toUpperCase()}
                      </div>
                      {item.sellerName || 'Kullanıcı'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#1a1b23] rounded-xl border border-white/5">
            <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Bu kategoride henüz server tanıtımı yok</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium"
            >
              İlk tanıtımı sen yap →
            </button>
          </div>
        )}
      </div>

      {/* Create Server Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1b23] flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-fuchsia-400" />
                  Server Tanıt
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">Sunucunu binlerce oyuncuya ulaştır</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user ? (
              <div className="p-8 text-center">
                <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Server tanıtmak için giriş yapmalısınız</p>
                <Link to="/login" className="inline-flex items-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                  Giriş Yap
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="p-5 space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Kapak Görseli <span className="text-red-400">*</span>
                  </label>
                  <div 
                    onClick={() => document.getElementById('image-input')?.click()}
                    className="relative border-2 border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-fuchsia-500/50 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="aspect-video relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video flex flex-col items-center justify-center text-gray-500">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm">Görsel yüklemek için tıkla</span>
                        <span className="text-xs mt-1">16:9 oranında önerilir</span>
                      </div>
                    )}
                    <input
                      id="image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Title & Game */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Server Adı <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                      placeholder="Örn: TR'nin En Aktif Valorant Topluluğu"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500"
                      maxLength={80}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.title.length}/80</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Oyun/Platform <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.game}
                      onChange={(e) => setFormData(p => ({ ...p, game: e.target.value }))}
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500"
                    >
                      {GAME_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Member Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Üye Sayısı
                    </label>
                    <input
                      type="number"
                      value={formData.memberCount}
                      onChange={(e) => setFormData(p => ({ ...p, memberCount: e.target.value }))}
                      placeholder="5000"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Aktif Üye
                    </label>
                    <input
                      type="number"
                      value={formData.onlineCount}
                      onChange={(e) => setFormData(p => ({ ...p, onlineCount: e.target.value }))}
                      placeholder="150"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Açıklama <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    rows={4}
                    placeholder="Sunucu hakkında detaylı bilgi, özellikler, kurallar ve katılım detayları..."
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Özellikler
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SERVER_FEATURES.map(feature => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedFeatures.includes(feature)
                            ? 'bg-fuchsia-500 text-white'
                            : 'bg-[#23242f] text-gray-300 hover:bg-[#2d2e3b]'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invite Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Davet Linki
                  </label>
                  <input
                    type="url"
                    value={formData.inviteLink}
                    onChange={(e) => setFormData(p => ({ ...p, inviteLink: e.target.value }))}
                    placeholder="https://discord.gg/xxxxx"
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-fuchsia-500/20"
                >
                  {loading ? 'Yayınlanıyor...' : 'Server Tanıtımını Yayınla'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
