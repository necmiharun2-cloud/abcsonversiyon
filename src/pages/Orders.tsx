import { RefreshCw, Filter, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Orders() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'created' | 'processing' | 'delivered' | 'completed' | 'cancelled' | 'disputed'>('all');

  const fetchOrders = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('buyerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const textMatch =
        order.id.includes(searchTerm) ||
        (order.productTitle && order.productTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.sellerName && order.sellerName.toLowerCase().includes(searchTerm.toLowerCase()));
      const statusMatch = statusFilter === 'all' ? true : order.status === statusFilter;
      return textMatch && statusMatch;
    });
  }, [searchTerm, orders, statusFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
    toast.success('Siparişler güncellendi.');
  };

  if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Siparişlerim</h1>
          <p className="text-gray-400 text-sm">
            Satın aldığınız tüm ürün ve ilanlar aşağıda listelenmektedir.<br/>
            Sipariş detaylarını görmek için siparişin üstüne tıklayabilirsiniz.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-gray-400 text-sm">Sattığın ilanları mı arıyorsun?</span>
          <Link to="/sattigim-ilanlar" className="bg-[#5b68f6]/20 hover:bg-[#5b68f6]/30 text-[#60a5fa] border border-[#5b68f6]/30 px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 text-sm">
            Sattığım İlanlar
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Sipariş no, ilan veya satıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1b23] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#5b68f6] transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#1a1b23] hover:bg-white/5 border border-white/5 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sayfayı Yenile
          </button>
          <button 
            onClick={() => setStatusFilter((prev) => (prev === 'all' ? 'processing' : 'all'))}
            className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(91,104,246,0.3)]"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === 'all' ? 'Sadece İşleniyor' : 'Tüm Durumlar'}
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {fetching ? (
          <div className="text-center py-20 text-white">Siparişler yükleniyor...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link 
                key={order.id}
                to={`/siparis/${order.id}`}
                className="bg-[#1a1b23] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                {order.productImage ? (
                  <img src={order.productImage} alt={order.productTitle} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#111218] flex items-center justify-center text-[10px] text-gray-400">Görsel Yok</div>
                )}
                <div className="flex-1 w-full">
                  <div className="text-gray-400 text-sm mb-1">Sipariş No : {order.id.slice(0, 8)}</div>
                  <div className={`flex items-center gap-2 text-sm font-medium mb-2 ${order.status === 'completed' || order.status === 'delivered' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-400' : 'bg-yellow-400'}`}></div>
                    {order.status === 'completed' || order.status === 'delivered' ? 'Sipariş teslim edildi' : (order.status === 'cancelled' ? 'İptal Edildi' : order.status === 'disputed' ? 'Uyuşmazlıkta' : 'İşleniyor')}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 text-xs uppercase">Satıcı</span>
                    <span className="text-white bg-[#111218] px-2 py-1 rounded flex items-center gap-2 border border-white/5">
                      <span className="w-4 h-4 rounded bg-[#23242f] inline-block" />
                      {order.sellerName || 'Satıcı'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-4 md:mt-0">
                  <div className="text-right">
                    <div className="text-gray-400 text-sm mb-1">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('tr-TR') : 'Yeni'}</div>
                    <div className="text-yellow-500 font-bold text-lg">{(Number(order.price) || 0).toFixed(2)} ₺</div>
                    <div className="text-[11px] text-gray-500 mt-1">Ödeme: {order.paymentStatus || 'pending'}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-[#5b68f6] group-hover:text-white transition-colors">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-12 text-center">
            <p className="text-gray-400">Aradığınız kriterlere uygun sipariş bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
