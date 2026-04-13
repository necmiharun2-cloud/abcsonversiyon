import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useMemo, useEffect } from 'react';
import { Heart, MessageSquare, Zap, ShieldCheck } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { getMockListingsForCategoryTab } from '../lib/catalog';
import { avatarImage } from '../lib/media';

interface Filters {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  keyword?: string;
  includeDescription?: boolean;
  onlineOnly?: boolean;
  autoDelivery?: boolean;
  trustedOnly?: boolean;
  corporateOnly?: boolean;
  type?: 'buy' | 'sell';
}

interface CategoryListingsProps {
  filters?: Filters;
  initialCategory?: string;
}

export default function CategoryListings({ filters, initialCategory }: CategoryListingsProps) {
  const [activeTab, setActiveTab] = useState(initialCategory || 'VALORANT');
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Base query: only active listings
    let constraints: any[] = [where('status', '==', 'active')];

    if (filters) {
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }
      if (filters.minPrice) {
        constraints.push(where('price', '>=', parseFloat(filters.minPrice)));
      }
      if (filters.maxPrice) {
        constraints.push(where('price', '<=', parseFloat(filters.maxPrice)));
      }
      if (filters.autoDelivery) {
        constraints.push(where('deliveryType', '==', 'Otomatik Teslimat'));
      }
    } else if (activeTab) {
      constraints.push(where('category', '==', activeTab));
    }

    let q = query(collection(db, 'products'), ...constraints, orderBy('createdAt', 'desc'));
    
    const applyFallback = () => {
      setAllListings(getMockListingsForCategoryTab(activeTab) as any[]);
      setLoading(false);
    };

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as object) }));
      if (fetched.length === 0) {
        applyFallback();
        return;
      }
      setAllListings(fetched);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching listings:', error);
      if (error.message.includes('index')) {
        const fallbackQ = query(collection(db, 'products'), where('status', '==', 'active'), orderBy('createdAt', 'desc'));
        onSnapshot(fallbackQ, (s) => {
          const rows = s.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));
          if (rows.length === 0) applyFallback();
          else {
            setAllListings(rows);
            setLoading(false);
          }
        });
      } else {
        applyFallback();
      }
    });

    return () => unsubscribe();
  }, [filters, activeTab]);

  const handleMessageSeller = async (e: React.MouseEvent, sellerId: string, sellerName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Mesaj göndermek için giriş yapmalısınız.');
      return;
    }

    if (user.uid === sellerId) {
      toast.error('Kendi ilanınıza mesaj gönderemezsiniz.');
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

  const tabs = [
    { name: 'VALORANT', icon: 'https://ui-avatars.com/api/?name=VA&background=5b68f6&color=fff&size=64' },
    { name: 'ROBLOX', icon: 'https://ui-avatars.com/api/?name=RB&background=5b68f6&color=fff&size=64' },
    { name: 'DISCORD', icon: 'https://ui-avatars.com/api/?name=DC&background=5b68f6&color=fff&size=64' },
    { name: 'PUBG MOBILE', icon: 'https://ui-avatars.com/api/?name=PB&background=5b68f6&color=fff&size=64' },
    { name: 'STEAM', icon: 'https://ui-avatars.com/api/?name=ST&background=5b68f6&color=fff&size=64' },
  ];

  const filteredListings = useMemo(() => {
    return allListings.filter(listing => {
      // Sidebar filters that are harder to do in Firestore or already done
      if (filters) {
        // These are already handled in Firestore if possible, but we keep them here for safety
        if (filters.minPrice && listing.price < parseFloat(filters.minPrice)) return false;
        if (filters.maxPrice && listing.price > parseFloat(filters.maxPrice)) return false;
        
        if (filters.seller && !listing.sellerName?.toLowerCase().includes(filters.seller.toLowerCase())) return false;
        if (filters.keyword) {
          const searchIn = filters.includeDescription 
            ? `${listing.title} ${listing.description}`.toLowerCase()
            : listing.title?.toLowerCase();
          if (!searchIn?.includes(filters.keyword.toLowerCase())) return false;
        }
      }

      return true;
    });
  }, [allListings, filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#1a1b23] rounded-lg aspect-[4/6] animate-pulse border border-white/5"></div>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeTab === tab.name 
                ? 'bg-[#5b68f6] border-[#5b68f6] text-white shadow-[0_0_15px_rgba(91,104,246,0.3)]' 
                : 'bg-[#1a1b23] border-white/10 text-gray-300 hover:bg-[#2d2e3b] hover:text-white'
            }`}
          >
            <img src={tab.icon} alt={tab.name} className="w-4 h-4 rounded-full" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredListings.map((listing) => (
            <Link
              to={`/product/${listing.id}`}
              key={`${listing.id}-${listing.category}`}
              className="bg-black/25 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors group cursor-pointer flex flex-col"
            >
              {/* Image & Badge */}
              <div className="relative aspect-[4/3]">
                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                {listing.type === 'buy' ? (
                  <div className="absolute top-0 inset-x-0 bg-amber-500 text-white text-[10px] font-bold text-center py-1 tracking-wider">
                    ALIM İLANI
                  </div>
                ) : listing.isVitrin ? (
                  <div className="absolute top-0 inset-x-0 accent-bg text-white text-[10px] font-bold text-center py-1 tracking-wider">
                    VİTRİN İLANI
                  </div>
                ) : (
                  <div className="absolute top-0 inset-x-0 bg-[#3b82f6] text-white text-[10px] font-bold text-center py-1 tracking-wider">
                    YENİ İLAN
                  </div>
                )}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(listing.id.toString());
                  }}
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-red-500 transition-colors group/fav"
                >
                  <Heart className={`w-4 h-4 ${isFavorite(listing.id.toString()) ? 'fill-current text-white' : 'text-white'}`} />
                </button>
                <button 
                  onClick={(e) => handleMessageSeller(e, listing.sellerId, listing.sellerName)}
                  className="absolute bottom-2 left-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-[#5b68f6] transition-colors"
                  title="Satıcıya Mesaj Gönder"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                
                {listing.deliveryType === 'Otomatik Teslimat' && (
                  <div className="absolute top-8 right-2 p-1 bg-yellow-500 rounded-md shadow-lg" title="Otomatik Teslimat">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Seller Info Bar */}
              <div className="bg-black/30 px-3 py-2 flex items-center gap-2.5 border-b border-white/10">
                <img src={listing.sellerAvatar || avatarImage(String(listing.sellerName || 'Satıcı'))} alt={listing.sellerName} className="w-7 h-7 rounded object-cover" />
                <div className="flex flex-col justify-center">
                  <span className="text-[9px] text-gray-400 font-medium leading-none mb-1">{listing.type === 'buy' ? 'ALICI' : 'SATICI'}</span>
                  <span className="text-xs text-white font-bold leading-none truncate">{listing.sellerName}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col flex-1">
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-1">{listing.category}</span>
                
                <h4 className="text-sm text-white font-semibold line-clamp-2 mb-3 leading-snug group-hover:accent-text transition-colors">
                  {listing.title}
                </h4>
                
                <div className="mt-auto">
                  <div className="flex items-end justify-between gap-2">
                    <span className="accent-text font-extrabold text-lg leading-none">{(Number(listing.price) || 0).toFixed(2)} ₺</span>
                    <div className="btn-buy text-white font-extrabold text-xs px-3 py-2 rounded-lg">
                      Satın Al
                    </div>
                  </div>
                  {listing.oldPrice && (
                    <div className="text-gray-500 text-xs line-through leading-none mt-1">{(Number(listing.oldPrice) || 0).toFixed(2)} ₺</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-12 text-center">
          <p className="text-gray-400">Aradığınız kriterlere uygun ilan bulunamadı.</p>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
          + Daha fazla {activeTab} ilanı göster
        </button>
      </div>
    </section>
  );
}

