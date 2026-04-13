import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { ArrowUpCircle, Zap, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IlanYukariTasima() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [promotionHistory, setPromotionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);

  const fetchListings = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'products'), where('sellerId', '==', user.uid), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      const fetchedListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) }));
      setListings(fetchedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('İlanlarınız yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  useEffect(() => {
    const fetchPromotionHistory = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          where('type', '==', 'listing_promotion'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setPromotionHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        setPromotionHistory([]);
      }
    };
    fetchPromotionHistory();
  }, [user, listings.length]);

  const handlePromote = async (listingId: string) => {
    if (!user || !profile || profile.balance < 5) {
      toast.error('Yetersiz bakiye. İlan yükseltme ücreti 5 ₺\'dir.');
      return;
    }

    setPromoting(listingId);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const listingRef = doc(db, 'products', listingId);
        const promotionRef = doc(collection(db, 'transactions'));
        
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("Kullanıcı bulunamadı.");
        
        const currentBalance = userDoc.data().balance || 0;
        if (currentBalance < 5) throw new Error("Yetersiz bakiye.");

        // Update balance
        transaction.update(userRef, {
          balance: currentBalance - 5
        });

        // Update listing
        transaction.update(listingRef, {
          createdAt: serverTimestamp(),
          isPromoted: true
        });

        transaction.set(promotionRef, {
          userId: user.uid,
          type: 'listing_promotion',
          amount: 5,
          fee: 0,
          status: 'captured',
          relatedId: listingId,
          reason: 'İlan yukarı taşıma ücreti',
          createdAt: serverTimestamp(),
        });
      });

      toast.success('İlanınız başarıyla yukarı taşındı!');
      await fetchListings();
    } catch (error: any) {
      console.error('Error promoting listing:', error);
      toast.error(error.message || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setPromoting(null);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    if (date.toDate) return date.toDate().toLocaleString('tr-TR');
    return new Date(date).toLocaleString('tr-TR');
  };

  if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-[#1a1b23] rounded-2xl p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ArrowUpCircle className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">İlanı Yukarı Taşı</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            İlanlarınızı listenin en üstüne taşıyarak daha fazla alıcıya ulaşın. 
            Her yukarı taşıma işlemi sadece <span className="text-white font-bold">5.00 ₺</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1b23] p-6 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500">İşlem Süresi</div>
            <div className="text-sm font-bold text-white">Anında</div>
          </div>
        </div>
        <div className="bg-[#1a1b23] p-6 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Güvenlik</div>
            <div className="text-sm font-bold text-white">%100 Güvenli</div>
          </div>
        </div>
        <div className="bg-[#1a1b23] p-6 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Etki</div>
            <div className="text-sm font-bold text-white">5x Daha Fazla İzlenme</div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Aktif İlanlarınız ({listings.length})</h2>
          <div className="text-sm text-gray-400">
            Bakiyeniz: <span className="text-emerald-500 font-bold">{profile?.balance.toFixed(2)} ₺</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {listings.map((listing) => (
            <div key={listing.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-white/5 transition-colors">
              {listing.image ? (
                <img src={listing.image} alt="" className="w-24 h-18 rounded-lg object-cover" />
              ) : (
                <div className="w-24 h-18 rounded-lg bg-[#111218] flex items-center justify-center text-[10px] text-gray-400">Görsel Yok</div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-white font-bold mb-1">{listing.title}</h3>
                <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-gray-500">
                  <span>{listing.category}</span>
                  <span>•</span>
                  <span>{listing.price.toFixed(2)} ₺</span>
                  <span>•</span>
                  <span>Son Güncelleme: {formatDate(listing.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={() => handlePromote(listing.id)}
                disabled={promoting === listing.id}
                className="bg-[#5b68f6] hover:bg-[#4a55d6] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              >
                {promoting === listing.id ? 'İşleniyor...' : 'Yukarı Taşı (5 ₺)'}
                <ArrowUpCircle className="w-4 h-4" />
              </button>
            </div>
          ))}

          {listings.length === 0 && (
            <div className="p-20 text-center">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Yukarı taşınacak aktif ilanınız bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Yükseltme Geçmişi</h2>
        </div>
        <div className="divide-y divide-white/5">
          {promotionHistory.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">Henüz yükseltme işlemi bulunmuyor.</div>
          ) : (
            promotionHistory.map((row: any) => (
              <div key={row.id} className="p-4 flex items-center justify-between text-sm">
                <div className="text-gray-300">İlan ID: <span className="text-white">{row.relatedId}</span></div>
                <div className="text-red-400 font-bold">- {(Number(row.amount) || 0).toFixed(2)} ₺</div>
                <div className="text-gray-500">{row.createdAt?.toDate ? row.createdAt.toDate().toLocaleString('tr-TR') : '-'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
