import { 
  Filter, Search, PlusCircle, RefreshCw, X, ShoppingCart, 
  TrendingUp, Clock, CheckCircle, AlertCircle, ChevronRight,
  MessageSquare, Heart, Zap, ShieldCheck, Users, FileText
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { avatarImage, listingImage } from '../lib/media';
import { useFavorites } from '../contexts/FavoritesContext';
import { chatService } from '../services/chatService';

const CATEGORIES = [
  { id: 'VALORANT', name: 'Valorant', icon: '🎮' },
  { id: 'ROBLOX', name: 'Roblox', icon: '🏗️' },
  { id: 'CS2', name: 'CS2', icon: '🔫' },
  { id: 'PUBG MOBILE', name: 'PUBG Mobile', icon: '📱' },
  { id: 'STEAM', name: 'Steam', icon: '🎮' },
  { id: 'DISCORD', name: 'Discord', icon: '💬' },
  { id: 'LEAGUE OF LEGENDS', name: 'League of Legends', icon: '⚔️' },
  { id: 'MINECRAFT', name: 'Minecraft', icon: '⛏️' },
  { id: 'FORTNITE', name: 'Fortnite', icon: '🎯' },
  { id: 'MOBILE LEGENDS', name: 'Mobile Legends', icon: '🏆' },
];

const HOW_IT_WORKS = [
  {
    icon: FileText,
    title: 'İlan Oluştur',
    description: 'Aradığınız ürünü ve bütçenizi belirterek alım ilanı oluşturun.'
  },
  {
    icon: Users,
    title: 'Satıcılar Ulaşır',
    description: 'İlanınızı gören satıcılar size tekliflerini sunar.'
  },
  {
    icon: CheckCircle,
    title: 'Anlaşma Sağlayın',
    description: 'Teklifleri değerlendirin ve size uygun olanla anlaşın.'
  }
];

interface BuyListing {
  id: string;
  title: string;
  category: string;
  price: number;
  description?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  createdAt: any;
  status: string;
  type: string;
  image: string;
}

export default function AlimIlanlari() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [listings, setListings] = useState<BuyListing[]>([]);
  
  const [filters, setFilters] = useState({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });

  const [newListing, setNewListing] = useState({
    category: 'VALORANT',
    title: '',
    budget: '',
    description: ''
  });

  // Fetch listings
  useEffect(() => {
    setLoading(true);
    let constraints: any[] = [
      where('status', '==', 'active'),
      where('type', '==', 'buy')
    ];
    
    if (activeCategory) {
      constraints.push(where('category', '==', activeCategory));
    }

    const q = query(
      collection(db, 'products'), 
      ...constraints, 
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...(doc.data() as object) 
      })) as BuyListing[];
      setListings(fetched);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching listings:', error);
      setListings([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  // Filter listings client-side
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      if (filters.keyword) {
        const searchIn = `${listing.title} ${listing.description || ''}`.toLowerCase();
        if (!searchIn.includes(filters.keyword.toLowerCase())) return false;
      }
      if (filters.minPrice && listing.price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && listing.price > parseFloat(filters.maxPrice)) return false;
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      // newest is default
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });
  }, [listings, filters]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('İlan oluşturmak için giriş yapmalısınız.');
      return;
    }
    if (!newListing.category || !newListing.title || !newListing.budget) {
      toast.error('Lütfen gerekli alanları doldurun.');
      return;
    }

    if (newListing.title.length < 5) {
      toast.error('İlan başlığı en az 5 karakter olmalıdır.');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        category: newListing.category,
        title: newListing.title,
        price: parseFloat(newListing.budget),
        description: newListing.description,
        sellerId: user.uid,
        sellerName: profile?.username || user.displayName || 'Anonim',
        sellerAvatar: profile?.avatar || user.photoURL || avatarImage(profile?.username || user.displayName || 'U'),
        status: 'active',
        type: 'buy',
        createdAt: serverTimestamp(),
        image: listingImage(400, 300, newListing.title || 'Alim ilani')
      });

      toast.success('Alım ilanınız başarıyla oluşturuldu!');
      setIsModalOpen(false);
      setNewListing({ category: 'VALORANT', title: '', budget: '', description: '' });
    } catch (error) {
      console.error('Error creating buying listing:', error);
      toast.error('İlan oluşturulurken bir hata oluştu.');
    }
  };

  const handleMessageSeller = async (e: React.MouseEvent, sellerId: string, sellerName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Mesaj göndermek için giriş yapmalısınız.');
      return;
    }

    try {
      const chatId = await chatService.createChat(
        [user.uid, sellerId],
        {
          [user.uid]: { name: profile?.username || user.displayName || 'Me', avatar: profile?.avatar || user.photoURL || '' },
          [sellerId]: { name: sellerName, avatar: '' }
        }
      );
      navigate('/mesajlarim', { state: { activeChatId: chatId } });
    } catch (error) {
      toast.error('Sohbet başlatılamadı.');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Yeni';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Az önce';
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1a1b23] via-[#2a3050] to-[#1a1b23] rounded-2xl border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
        
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
              <ShoppingCart className="w-6 h-6 text-amber-500" />
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                ALIM İLANLARI
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Alım İlanları Pazarı
            </h1>
            <p className="text-gray-400 max-w-xl">
              Aradığınız ürünü bulamıyor musunuz? Hemen bir alım ilanı oluşturun, satıcılar size ulaşsın.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-[#111218] rounded-xl">
                <p className="text-2xl font-bold text-white">{listings.length}</p>
                <p className="text-xs text-gray-400">Aktif İlan</p>
              </div>
              <div className="text-center px-4 py-2 bg-[#111218] rounded-xl">
                <p className="text-2xl font-bold text-amber-400">{CATEGORIES.length}</p>
                <p className="text-xs text-gray-400">Kategori</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25"
            >
              <PlusCircle className="w-5 h-5" />
              Alım İlanı Oluştur
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {HOW_IT_WORKS.map((step, i) => (
          <div key={i} className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <step.icon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-400">ADIM {i + 1}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
              <p className="text-xs text-gray-400">{step.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Category Pills */}
      <section>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-amber-500 text-white'
                : 'bg-[#1a1b23] text-gray-300 hover:bg-[#23242f]'
            }`}
          >
            Tümü
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-[#1a1b23] text-gray-300 hover:bg-[#23242f]'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <Filter className="w-4 h-4" />
                Filtrele
              </div>
              <button 
                onClick={() => setFilters({ keyword: '', minPrice: '', maxPrice: '', sortBy: 'newest' })}
                className="text-xs text-gray-400 hover:text-white"
              >
                Temizle
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Anahtar Kelime</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="İlan ara..."
                    value={filters.keyword}
                    onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                    className="w-full bg-[#111218] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Bütçe Aralığı (₺)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="w-full bg-[#111218] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                  />
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full bg-[#111218] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Sıralama</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full bg-[#111218] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="newest">En Yeni</option>
                  <option value="price-low">Fiyat (Düşük → Yüksek)</option>
                  <option value="price-high">Fiyat (Yüksek → Düşük)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1 min-w-0">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">{filteredListings.length}</span> alım ilanı bulundu
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#1a1b23] rounded-xl aspect-[4/5] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <Link
                  to={`/product/${listing.id}`}
                  key={listing.id}
                  className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden hover:border-amber-500/30 transition-all group"
                >
                  {/* Header Badge */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-white" />
                      <span className="text-xs font-bold text-white">ALIM İLANI</span>
                    </div>
                    <span className="text-xs text-white/80">{formatDate(listing.createdAt)}</span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Category */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-400 bg-[#111218] px-2 py-1 rounded">
                        {listing.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-bold mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
                      {listing.title}
                    </h3>

                    {/* Description */}
                    {listing.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    {/* Budget */}
                    <div className="bg-amber-500/10 rounded-lg p-3 mb-4">
                      <p className="text-xs text-amber-400 mb-1">Bütçe</p>
                      <p className="text-xl font-bold text-white">
                        {listing.price.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <img 
                          src={listing.sellerAvatar || avatarImage(listing.sellerName)} 
                          alt={listing.sellerName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-xs text-gray-400">Alıcı</p>
                          <p className="text-sm font-medium text-white">{listing.sellerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => handleMessageSeller(e, listing.sellerId, listing.sellerName)}
                          className="p-2 rounded-lg bg-[#111218] hover:bg-[#5b68f6] text-gray-400 hover:text-white transition-colors"
                          title="Mesaj Gönder"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(listing.id);
                          }}
                          className={`p-2 rounded-lg bg-[#111218] transition-colors ${
                            isFavorite(listing.id) 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                          }`}
                          title="Favorilere Ekle"
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium mb-2">Alım ilanı bulunamadı</p>
              <p className="text-sm text-gray-500 mb-4">Filtrelerinizi değiştirmeyi deneyin veya yeni bir ilan oluşturun.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Alım İlanı Oluştur
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Alım İlanı Oluştur</h3>
                    <p className="text-xs text-white/80">Satıcılar size ulaşsın</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateListing} className="p-5 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kategori <span className="text-red-400">*</span>
                </label>
                <select
                  value={newListing.category}
                  onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  İlan Başlığı <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  placeholder="Ne arıyorsunuz?"
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{newListing.title.length}/100</p>
              </div>
              
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bütçe (₺) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    placeholder="0.00"
                    value={newListing.budget}
                    onChange={(e) => setNewListing({...newListing, budget: e.target.value})}
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ödemeye hazır olduğunuz maksimum tutar</p>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea 
                  rows={4}
                  placeholder="Aradığınız ürünün detaylarını, özelliklerini ve beklentilerinizi belirtin..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{newListing.description.length}/500</p>
              </div>

              {/* Info Box */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-400 mb-1">Bilgi</p>
                    <p className="text-xs text-gray-400">
                      Alım ilanınız yayınlandıktan sonra satıcılar size tekliflerini sunabilir. 
                      Teklifleri değerlendirerek uygun olanla anlaşabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Submit */}
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                İlanı Yayınla
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
