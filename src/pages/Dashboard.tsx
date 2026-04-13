import { 
  LayoutDashboard, ShoppingCart, Heart, Wallet, MessageSquare, Store, 
  HelpCircle, Settings, Bell, Search, Plus, TrendingUp, Package,
  ChevronRight, Star, DollarSign, Users, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, CheckCircle, XCircle, Clock3, LogOut, FileText, 
  Shield, User, CreditCard, Gift, Camera, Edit3, ShoppingBag, Trophy,
  BarChart3, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Pzt', value: 45 },
  { name: 'Sal', value: 62 },
  { name: 'Çar', value: 38 },
  { name: 'Per', value: 71 },
  { name: 'Cum', value: 55 },
  { name: 'Cmt', value: 89 },
  { name: 'Paz', value: 42 },
];

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeListings: 0,
    soldOrders: 0,
    boughtOrders: 0,
    totalEarned: 0,
    totalSpent: 0,
    balance: 0,
    pendingOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const uid = user.uid;
        
        const [activeSnap, soldSnap, boughtSnap, ordersSnap, pendingSnap] = await Promise.all([
          getDocs(query(collection(db, 'products'), where('sellerId', '==', uid), where('status', '==', 'active'))),
          getDocs(query(collection(db, 'orders'), where('sellerId', '==', uid), limit(50))),
          getDocs(query(collection(db, 'orders'), where('buyerId', '==', uid), limit(50))),
          getDocs(query(collection(db, 'orders'), where('sellerId', '==', uid), orderBy('createdAt', 'desc'), limit(5))),
          getDocs(query(collection(db, 'orders'), where('sellerId', '==', uid), where('status', '==', 'pending')))
        ]);

        const soldOrders = soldSnap.docs.map(d => d.data() as any);
        const boughtOrders = boughtSnap.docs.map(d => d.data() as any);
        
        setStats({
          activeListings: activeSnap.size,
          soldOrders: soldSnap.size,
          boughtOrders: boughtSnap.size,
          totalEarned: soldOrders.reduce((sum, o) => sum + Number(o.price || 0), 0),
          totalSpent: boughtOrders.reduce((sum, o) => sum + Number(o.price || 0), 0),
          balance: Number(profile?.balance || 0),
          pendingOrders: pendingSnap.size
        });

        setRecentOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Dashboard fetch failed:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, profile]);

  if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Genel Bakış', to: '/kontrol-merkezi', active: true },
    { icon: Store, label: 'İlanlarım', to: '/ilanlarim' },
    { icon: ShoppingBag, label: 'Siparişlerim', to: '/siparislerim' },
    { icon: Heart, label: 'Favorilerim', to: '/favorilerim' },
    { icon: Wallet, label: 'Cüzdanım', to: '/bakiye-yukle' },
    { icon: MessageSquare, label: 'Mesajlarım', to: '/mesajlarim' },
    { icon: Star, label: 'Değerlendirmelerim', to: '/degerlendirmelerim' },
    { icon: Bell, label: 'Bildirimler', to: '/bildirimler', badge: 2 },
    { icon: Settings, label: 'Ayarlar', to: '/ayarlar' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6">
      
      {/* Left Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
              {profile?.avatar || user.photoURL ? (
                <img src={profile?.avatar || user.photoURL || ''} alt="" className="w-full h-full object-cover" />
              ) : (
                <Trophy className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-white font-bold">{profile?.username || user.displayName || 'Kullanıcı'}</h3>
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Elit Satıcı</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            {sidebarLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  link.active 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </div>
                {link.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1a1b23] p-6 rounded-2xl border border-white/5">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Hoş geldin, {profile?.username || user.displayName || 'Kullanıcı'}! 👋
            </h1>
            <p className="text-gray-400 text-sm">Bu haftaki satış performansın harika! Devam et.</p>
          </div>
          <Link to="/ilan-ekle" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap">
            <Plus className="w-5 h-5" />
            Yeni İlan
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> +12%
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Toplam Satış</p>
            <h3 className="text-2xl font-bold text-white">₺{stats.totalEarned.toLocaleString('tr-TR')}</h3>
          </div>

          <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> +3
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Aktif İlan</p>
            <h3 className="text-2xl font-bold text-white">{stats.activeListings}</h3>
          </div>

          <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                <ArrowDownRight className="w-3 h-3" /> -2
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Bekleyen Sipariş</p>
            <h3 className="text-2xl font-bold text-white">{stats.pendingOrders}</h3>
          </div>

          <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> +₺450
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Bakiye</p>
            <h3 className="text-2xl font-bold text-white">₺{stats.balance.toLocaleString('tr-TR')}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Chart & Orders) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart */}
            <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <h2 className="font-bold text-white">Haftalık Satış Grafiği</h2>
                </div>
                <select className="bg-[#111218] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                  <option>Bu hafta</option>
                  <option>Geçen hafta</option>
                  <option>Bu ay</option>
                </select>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1b23', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-[#1a1b23] rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold text-white">Son Siparişler</h2>
                <Link to="/siparislerim" className="text-sm text-blue-400 hover:text-blue-300">
                  Tümünü Gör
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
                ) : recentOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">Henüz sipariş yok</div>
                ) : (
                  recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#111218] flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{order.productTitle || 'Sipariş'}</p>
                          <p className="text-xs text-gray-500">#{order.id.slice(0,8).toUpperCase()} • {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('tr-TR') : 'Yeni'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{Number(order.price || 0).toLocaleString('tr-TR')} ₺</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          order.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {order.status === 'completed' ? 'Tamamlandı' : 
                           order.status === 'pending' ? 'Bekliyor' : 
                           order.status === 'cancelled' ? 'İptal' : order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Widgets) */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
              <h3 className="font-bold text-white mb-4">Hızlı İşlemler</h3>
              <div className="space-y-2">
                <Link to="/ilan-ekle" className="flex items-center gap-3 p-3 rounded-xl bg-[#111218] hover:bg-white/5 border border-white/5 transition-colors group">
                  <Plus className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-300 group-hover:text-white">İlan Ekle</span>
                </Link>
                <Link to="/bakiye-yukle" className="flex items-center gap-3 p-3 rounded-xl bg-[#111218] hover:bg-white/5 border border-white/5 transition-colors group">
                  <Wallet className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-300 group-hover:text-white">Bakiye Yükle</span>
                </Link>
                <Link to="/mesajlarim" className="flex items-center gap-3 p-3 rounded-xl bg-[#111218] hover:bg-white/5 border border-white/5 transition-colors group">
                  <MessageSquare className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-300 group-hover:text-white">Mesajlar</span>
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Bildirimler</h3>
                <Link to="/bildirimler" className="text-xs text-blue-400 hover:text-blue-300">Tümü</Link>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShoppingCart className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300"><span className="text-white font-medium">Yeni sipariş aldınız:</span> CS2 Prime Hesap</p>
                    <span className="text-xs text-gray-500">2 dk önce</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300"><span className="text-white font-medium">Bakiye yüklemeniz onaylandı:</span> ₺500</p>
                    <span className="text-xs text-gray-500">1 saat önce</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300"><span className="text-white font-medium">Yeni değerlendirme aldınız:</span> ⭐⭐⭐⭐⭐</p>
                    <span className="text-xs text-gray-500">5 saat önce</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-5">
              <h3 className="font-bold text-white mb-4">Performans</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Teslim Süresi</span>
                  <span className="text-sm font-medium text-emerald-400">~5 dk <span className="text-xs text-gray-500 ml-1">Çok İyi</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Yanıt Süresi</span>
                  <span className="text-sm font-medium text-emerald-400">~2 dk <span className="text-xs text-gray-500 ml-1">Mükemmel</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">İptal Oranı</span>
                  <span className="text-sm font-medium text-blue-400">%1.2 <span className="text-xs text-gray-500 ml-1">Düşük</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Memnuniyet</span>
                  <span className="text-sm font-medium text-emerald-400">%98 <span className="text-xs text-gray-500 ml-1">Mükemmel</span></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

