/**
 * Seller Analytics Service
 * Satıcı iş zekâsı — dönüşüm, en iyi/kötü ilanlar, saat bazlı analiz.
 */
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface SellerAnalytics {
  totalViews: number;
  totalFavorites: number;
  totalMessages: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  conversionRate: number;      // görüntülenme → sipariş
  cancelRate: number;
  avgDeliveryMinutes: number;
  repeatCustomerRate: number;
  totalRevenue: number;
  topListings: ListingPerf[];
  weakListings: ListingPerf[];
  hourlyMessages: number[];    // 0-23 saat için mesaj sayısı
  dailySales: DailySale[];
  categoryBreakdown: CategoryStat[];
}

export interface ListingPerf {
  id: string;
  title: string;
  price: number;
  views: number;
  favorites: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  image?: string;
}

export interface DailySale {
  date: string;
  orders: number;
  revenue: number;
}

export interface CategoryStat {
  category: string;
  orders: number;
  revenue: number;
  avgRating: number;
}

export async function getSellerAnalytics(sellerId: string): Promise<SellerAnalytics> {
  try {
    const [productsSnap, ordersSnap, messagesSnap, favoritesSnap] = await Promise.all([
      getDocs(query(collection(db, 'products'), where('sellerId', '==', sellerId), limit(200))),
      getDocs(query(collection(db, 'orders'), where('sellerId', '==', sellerId), limit(500))),
      // chats where either participant is seller
      getDocs(query(collection(db, 'chats'), where('participants', 'array-contains', sellerId), limit(200))),
      getDocs(query(collection(db, 'favorites'), where('sellerId', '==', sellerId), limit(500))),
    ]);

    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    const messages = messagesSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    const favorites = favoritesSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    const completed = orders.filter(o => o.status === 'completed' || o.status === 'Tamamlandı');
    const cancelled = orders.filter(o => o.status === 'cancelled' || o.status === 'İptal');
    const totalViews = products.reduce((s, p) => s + (p.viewCount || p.views || 0), 0);
    const totalRevenue = completed.reduce((s, o) => s + (Number(o.price || o.amount || 0)), 0);
    const conversionRate = totalViews > 0 ? Math.round((orders.length / totalViews) * 100 * 10) / 10 : 0;

    // Saat bazlı mesaj
    const hourlyMessages = Array(24).fill(0);
    messages.forEach(m => {
      const h = m.lastMessageAt?.toDate?.()?.getHours?.() ?? m.createdAt?.toDate?.()?.getHours?.() ?? 0;
      if (h >= 0 && h < 24) hourlyMessages[h]++;
    });

    // En iyi / en kötü ilanlar
    const listingPerfs: ListingPerf[] = products.map(p => {
      const listingOrders = orders.filter(o => o.productId === p.id || o.listingId === p.id);
      const listingRevenue = listingOrders.filter(o => o.status === 'completed' || o.status === 'Tamamlandı').reduce((s, o) => s + Number(o.price || 0), 0);
      const views = p.viewCount || p.views || 0;
      return {
        id: p.id,
        title: p.title || '',
        price: Number(p.price || 0),
        views,
        favorites: favorites.filter(f => f.productId === p.id).length,
        orders: listingOrders.length,
        revenue: listingRevenue,
        conversionRate: views > 0 ? Math.round((listingOrders.length / views) * 100 * 10) / 10 : 0,
        image: p.image || p.images?.[0],
      };
    });

    const sorted = [...listingPerfs].sort((a, b) => b.revenue - a.revenue);
    const topListings = sorted.slice(0, 5);
    const weakListings = [...listingPerfs].filter(l => l.views > 5 && l.conversionRate < 2).sort((a, b) => a.conversionRate - b.conversionRate).slice(0, 5);

    // Günlük satış (son 30 gün)
    const dailyMap = new Map<string, { orders: number; revenue: number }>();
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { orders: 0, revenue: 0 });
    }
    completed.forEach(o => {
      const t = o.createdAt?.toDate?.() || new Date(o.createdAt || 0);
      const key = t.toISOString().slice(0, 10);
      if (dailyMap.has(key)) {
        const v = dailyMap.get(key)!;
        v.orders++;
        v.revenue += Number(o.price || o.amount || 0);
      }
    });
    const dailySales: DailySale[] = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

    // Kategori bazlı
    const catMap = new Map<string, CategoryStat>();
    products.forEach(p => {
      const cat = p.category || 'Diğer';
      if (!catMap.has(cat)) catMap.set(cat, { category: cat, orders: 0, revenue: 0, avgRating: 0 });
      const listingOrders = orders.filter(o => o.productId === p.id);
      const rev = listingOrders.filter(o => o.status === 'completed' || o.status === 'Tamamlandı').reduce((s, o) => s + Number(o.price || 0), 0);
      const c = catMap.get(cat)!;
      c.orders += listingOrders.length;
      c.revenue += rev;
    });
    const categoryBreakdown = Array.from(catMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // Tekrar müşteri oranı
    const buyerCounts = new Map<string, number>();
    orders.forEach(o => { const b = o.buyerId || o.userId; if (b) buyerCounts.set(b, (buyerCounts.get(b) || 0) + 1); });
    const repeatCustomers = Array.from(buyerCounts.values()).filter(c => c > 1).length;
    const repeatCustomerRate = buyerCounts.size > 0 ? Math.round((repeatCustomers / buyerCounts.size) * 100) : 0;

    // Ortalama teslimat süresi
    const deliveredOrders = completed.filter(o => o.deliveredAt && o.createdAt);
    const avgDelivery = deliveredOrders.length > 0
      ? deliveredOrders.reduce((s, o) => {
          const created = o.createdAt?.toDate?.()?.getTime?.() || 0;
          const delivered = o.deliveredAt?.toDate?.()?.getTime?.() || 0;
          return s + Math.max(0, (delivered - created) / 60000);
        }, 0) / deliveredOrders.length
      : 0;

    return {
      totalViews,
      totalFavorites: favorites.length,
      totalMessages: messages.length,
      totalOrders: orders.length,
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,
      conversionRate,
      cancelRate: orders.length > 0 ? Math.round((cancelled.length / orders.length) * 100) : 0,
      avgDeliveryMinutes: Math.round(avgDelivery),
      repeatCustomerRate,
      totalRevenue,
      topListings,
      weakListings,
      hourlyMessages,
      dailySales,
      categoryBreakdown,
    };
  } catch (e) {
    console.error('sellerAnalytics error:', e);
    return {
      totalViews: 0, totalFavorites: 0, totalMessages: 0, totalOrders: 0,
      completedOrders: 0, cancelledOrders: 0, conversionRate: 0, cancelRate: 0,
      avgDeliveryMinutes: 0, repeatCustomerRate: 0, totalRevenue: 0,
      topListings: [], weakListings: [], hourlyMessages: Array(24).fill(0),
      dailySales: [], categoryBreakdown: [],
    };
  }
}
