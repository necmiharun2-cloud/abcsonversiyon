import { 
  Filter, Search, Folder, Banknote, User, Key, Star, Zap, ShieldCheck, Building2, 
  RefreshCw, TrendingUp, Package, Users, Gamepad2, Smartphone, CreditCard,
  ChevronRight, Sparkles, Clock, CheckCircle, Crown, ShoppingBag
} from 'lucide-react';
import ShowcaseListings from '../components/ShowcaseListings';
import MarketplaceListings from '../components/MarketplaceListings';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  { label: 'Valorant', value: 'VALORANT', icon: '🎮', color: 'from-red-500 to-orange-500' },
  { label: 'Roblox', value: 'ROBLOX', icon: '🏗️', color: 'from-blue-500 to-cyan-500' },
  { label: 'CS2', value: 'CS2', icon: '🔫', color: 'from-yellow-500 to-amber-500' },
  { label: 'PUBG Mobile', value: 'PUBG MOBILE', icon: '📱', color: 'from-orange-500 to-red-500' },
  { label: 'League of Legends', value: 'LEAGUE OF LEGENDS', icon: '⚔️', color: 'from-purple-500 to-blue-500' },
  { label: 'Steam', value: 'STEAM', icon: '🎮', color: 'from-slate-500 to-gray-600' },
  { label: 'Discord', value: 'DISCORD', icon: '💬', color: 'from-indigo-500 to-purple-500' },
  { label: 'Minecraft', value: 'MINECRAFT', icon: '⛏️', color: 'from-green-500 to-emerald-500' },
  { label: 'Fortnite', value: 'FORTNITE', icon: '🎯', color: 'from-blue-400 to-purple-500' },
  { label: 'Mobile Legends', value: 'MOBILE LEGENDS', icon: '🏆', color: 'from-blue-600 to-indigo-600' },
  { label: 'Diğer', value: 'DIGER', icon: '📦', color: 'from-gray-500 to-slate-600' },
];

const STATS = [
  { label: 'Aktif İlan', value: '12,500+', icon: Package, color: 'text-blue-400' },
  { label: 'Güvenli İşlem', value: '500K+', icon: ShieldCheck, color: 'text-emerald-400' },
  { label: 'Aktif Kullanıcı', value: '150K+', icon: Users, color: 'text-purple-400' },
  { label: 'Oyun Kategorisi', value: '50+', icon: Gamepad2, color: 'text-orange-400' },
];

const QUICK_CATEGORIES = [
  { name: 'Valorant', icon: '🎮', to: '/ilan-pazari?q=Valorant' },
  { name: 'Roblox', icon: '🏗️', to: '/ilan-pazari?q=Roblox' },
  { name: 'CS2', icon: '🔫', to: '/ilan-pazari?q=CS2' },
  { name: 'PUBG', icon: '📱', to: '/ilan-pazari?q=PUBG' },
  { name: 'Steam', icon: '🎮', to: '/ilan-pazari?q=Steam' },
  { name: 'Discord', icon: '💬', to: '/ilan-pazari?q=Discord' },
];

export default function IlanPazari() {
  const [searchParams] = useSearchParams();
  const initialKeyword = (searchParams.get('q') || '').trim();
  const [categorySearch, setCategorySearch] = useState('');
  const [localFilters, setLocalFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    seller: '',
    keyword: initialKeyword,
    includeDescription: false,
    onlineOnly: false,
    autoDelivery: false,
    trustedOnly: false,
    corporateOnly: false
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    category: '',
    minPrice: '',
    maxPrice: '',
    seller: '',
    keyword: initialKeyword,
    includeDescription: false,
    onlineOnly: false,
    autoDelivery: false,
    trustedOnly: false,
    corporateOnly: false
  });

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const min = localFilters.minPrice ? Number(localFilters.minPrice) : NaN;
    const max = localFilters.maxPrice ? Number(localFilters.maxPrice) : NaN;
    if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
      toast.error('En az fiyat, en çok fiyattan büyük olamaz.');
      return;
    }
    setAppliedFilters({ ...localFilters });
    toast.success('Filtreler uygulandı!');
  };

  const clearFilters = () => {
    const initial = {
      category: '',
      minPrice: '',
      maxPrice: '',
      seller: '',
      keyword: '',
      includeDescription: false,
      onlineOnly: false,
      autoDelivery: false,
      trustedOnly: false,
      corporateOnly: false
    };
    setLocalFilters(initial);
    setAppliedFilters(initial);
    toast.success('Filtreler temizlendi!');
  };

  useEffect(() => {
    setAppliedFilters({ ...localFilters });
  }, [localFilters]);

  const visibleCategoryOptions = CATEGORY_OPTIONS.filter((c) =>
    c.label.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1a1b23] via-[#2a3050] to-[#1a1b23] rounded-2xl border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5b68f6] via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#5b68f6]/20 text-[#5b68f6] text-xs font-bold px-3 py-1 rounded-full">
                  İLAN PAZARI
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  ÜCRETSİZ İLAN
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                İtemSatış İlan Pazarı
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Online oyunlardaki item, skin, gold gibi oyun içi ürünleri satarak para kazanabilirsiniz. 
                Veya direkt olarak 2. el oyun hesap satışı yaparak, emek verdiğiniz hesabı nakit paraya çevirebilirsiniz. 
                7/24 ilan satışı yapabilir, yada satın alabilirsiniz.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/ilan-ekle"
                className="flex items-center gap-2 bg-gradient-to-r from-[#5b68f6] to-[#8b5cf6] hover:from-[#4a55d6] hover:to-[#7c5ce7] text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-[#5b68f6]/25 transition-all"
              >
                <Package className="w-5 h-5" />
                Ücretsiz İlan Ver
              </Link>
              <Link
                to="/alim-ilanlari"
                className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-6 py-3 rounded-xl font-medium transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Alım İlanları
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-[#111218] rounded-xl p-4 text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Categories */}
      <section>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {QUICK_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={cat.to}
              className="shrink-0 flex items-center gap-2 bg-[#1a1b23] hover:bg-[#23242f] border border-white/5 hover:border-[#5b68f6]/30 px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white transition-all"
            >
              <span>{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-[280px] shrink-0">
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 sticky top-4">
            {/* Filter Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-2 text-white font-bold">
                <Filter className="w-5 h-5" />
                Filtrele
              </div>
              <button 
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-[#5b68f6] transition-colors"
              >
                Temizle
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Categories */}
              <div>
                <div className="flex items-center gap-2 text-white font-bold mb-3 text-sm">
                  <Folder className="w-4 h-4 text-blue-400" />
                  Kategoriler
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Kategori ara..." 
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-[#111218] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[#5b68f6] transition-colors" 
                  />
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
                  {visibleCategoryOptions.map((cat) => (
                    <button 
                      key={cat.value}
                      onClick={() => handleFilterChange('category', localFilters.category === cat.value ? '' : cat.value)}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-colors text-sm ${
                        localFilters.category === cat.value 
                          ? 'bg-[#5b68f6]/20 text-white border border-[#5b68f6]/30' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center gap-2 text-white font-bold mb-3 text-sm">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  Fiyat Aralığı (₺)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₺</span>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={localFilters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full bg-[#111218] border border-white/5 rounded-lg py-2.5 pl-7 pr-2 text-sm text-white focus:outline-none focus:border-[#5b68f6] transition-colors" 
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₺</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={localFilters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full bg-[#111218] border border-white/5 rounded-lg py-2.5 pl-7 pr-2 text-sm text-white focus:outline-none focus:border-[#5b68f6] transition-colors" 
                    />
                  </div>
                </div>
              </div>

              {/* Keyword Search */}
              <div>
                <div className="flex items-center gap-2 text-white font-bold mb-3 text-sm">
                  <Key className="w-4 h-4 text-orange-400" />
                  Anahtar Kelime
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="İlan ara..." 
                    value={localFilters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    className="w-full bg-[#111218] border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[#5b68f6] transition-colors" 
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={localFilters.includeDescription}
                    onChange={(e) => handleFilterChange('includeDescription', e.target.checked)}
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    localFilters.includeDescription ? 'bg-[#5b68f6] border-[#5b68f6]' : 'border-white/20 bg-[#111218] group-hover:border-[#5b68f6]'
                  }`}>
                    {localFilters.includeDescription && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white">Açıklamalarda da ara</span>
                </label>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center gap-2 text-white font-bold mb-3 text-sm">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Özellikler
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'autoDelivery', label: 'Otomatik Teslimat', icon: Zap, color: 'text-yellow-400' },
                    { id: 'trustedOnly', label: 'Güvenilir Satıcı', icon: ShieldCheck, color: 'text-blue-400' },
                    { id: 'corporateOnly', label: 'Kurumsal Satıcı', icon: Crown, color: 'text-purple-400' },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#111218] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={(localFilters as any)[opt.id]}
                        onChange={(e) => handleFilterChange(opt.id, e.target.checked)}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        (localFilters as any)[opt.id] ? 'bg-[#5b68f6] border-[#5b68f6]' : 'border-white/20 bg-[#1a1b23]'
                      }`}>
                        {(localFilters as any)[opt.id] && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <opt.icon className={`w-4 h-4 ${opt.color}`} />
                      <span className="text-xs text-gray-300 font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button 
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-[#5b68f6] to-[#8b5cf6] hover:from-[#4a55d6] hover:to-[#7c5ce7] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#5b68f6]/20"
              >
                Filtreleri Uygula
              </button>
            </div>
          </div>
        </div>

        {/* Main Listings */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Showcase Section */}
          <section>
            <ShowcaseListings />
          </section>

          {/* All Listings */}
          <section className="pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Tüm İlanlar
                </h2>
                <p className="text-sm text-gray-400 mt-1">En son eklenen ilanları keşfedin</p>
              </div>
              <Link 
                to="/ilan-ekle"
                className="text-sm text-[#5b68f6] hover:text-[#4a55d6] font-medium flex items-center gap-1"
              >
                İlan Ekle <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <MarketplaceListings filters={appliedFilters} />
          </section>

          {/* Info Section */}
          <section className="bg-gradient-to-r from-[#1a1b23] to-[#2a3050] rounded-xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#5b68f6]" />
              Oyuncu Pazarında Alışveriş Yapabileceğiniz Kategoriler
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                'Valorant Hesap', 'LoL Hesap', 'PUBG Mobile Hesap', 'CS2 Item & Skin',
                'Steam Hesap', 'Discord Nitro', 'Minecraft Hesap', 'Fortnite Hesap',
                'Mobile Legends', 'Roblox Hesap', 'Oyun Parası', 'CD Key'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400 bg-[#111218] rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
