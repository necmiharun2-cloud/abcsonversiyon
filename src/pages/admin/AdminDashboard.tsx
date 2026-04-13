import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Users, Package, ShoppingBag, DollarSign, Wallet, MessageSquare,
  Store, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle,
  Activity, UserCheck, Inbox, ArrowUpRight, Shield, Zap,
  TrendingDown, Flag, Ban, CreditCard
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

interface Props {
  onNavigate: (tab: string) => void;
}

const KPICard = ({ title, value, sub, icon: Icon, color, onClick }: any) => (
  <Card
    className={`bg-[#1a1b23] border-white/10 cursor-pointer hover:border-white/20 transition-all ${onClick ? 'hover:scale-[1.02]' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard({ onNavigate }: Props) {
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0, totalListings: 0, pendingListings: 0,
    totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0,
    commissionRevenue: 0, pendingWithdrawals: 0, pendingWithdrawalAmount: 0,
    openTickets: 0, pendingStores: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [usersChart, setUsersChart] = useState<any[]>([]);
  const [riskStats, setRiskStats] = useState({ riskyUsers: 0, openDisputes: 0, failedPayments: 0, highRiskListings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const safe = async (col: string, max = 200) => {
          try {
            return (await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() }));
          } catch {
            return (await getDocs(query(collection(db, col), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() }));
          }
        };

        const [users, products, orders, withdrawals, tickets, storeApps, transactions, logs] = await Promise.all([
          safe('users', 500), safe('products', 500), safe('orders', 500),
          safe('withdrawals', 200), safe('supportTickets', 100),
          safe('storeApplications', 100), safe('transactions', 300),
          safe('adminLogs', 50),
        ]);

        const totalRevenue = transactions.filter((t: any) => t.type === 'purchase' || t.type === 'sale').reduce((s: number, t: any) => s + Math.abs(Number(t.amount || 0)), 0);
        const commissionRevenue = transactions.filter((t: any) => t.type === 'commission').reduce((s: number, t: any) => s + Math.abs(Number(t.amount || 0)), 0);
        const pendingWd = withdrawals.filter((w: any) => w.status === 'Beklemede');

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.accountStatus !== 'banned' && u.accountStatus !== 'frozen').length,
          totalListings: products.length,
          pendingListings: products.filter((p: any) => p.moderationStatus === 'pending').length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => ['pending', 'processing'].includes(o.status)).length,
          completedOrders: orders.filter((o: any) => o.status === 'completed').length,
          totalRevenue,
          commissionRevenue,
          pendingWithdrawals: pendingWd.length,
          pendingWithdrawalAmount: pendingWd.reduce((s: number, w: any) => s + Number(w.amount || 0), 0),
          openTickets: tickets.filter((t: any) => t.status === 'open').length,
          pendingStores: storeApps.filter((s: any) => s.status === 'pending').length,
        });

        // Risk istatistikleri
        const riskyUsers = users.filter((u: any) => (u.trustLevel === 'risky') || (u.trustScore !== undefined && u.trustScore < 35)).length;
        const openDisputes = (await getDocs(query(collection(db, 'disputes'), where('status', '==', 'open'), limit(100))).catch(() => ({ docs: [] }))).docs.length;
        const recentFailed = transactions.filter((t: any) => t.status === 'failed').length;
        const highRiskListings = products.filter((p: any) => p.moderationScore !== undefined && p.moderationScore < 40).length;
        setRiskStats({ riskyUsers, openDisputes, failedPayments: recentFailed, highRiskListings });

        setRecentLogs(logs.slice(0, 10));
        setRecentUsers(users.slice(0, 5));
        setRecentListings(products.slice(0, 5));
        setRecentTickets(tickets.filter((t: any) => t.status === 'open').slice(0, 5));

        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - 6 + i);
          const label = format(d, 'dd.MM', { locale: tr });
          const dateStr = format(d, 'yyyy-MM-dd');
          const saleAmt = orders.filter((o: any) => {
            try { const cd = o.createdAt?.toDate?.(); return cd && format(cd, 'yyyy-MM-dd', { locale: tr }) === dateStr; } catch { return false; }
          }).reduce((s: number, o: any) => s + Number(o.amount || o.total || 0), 0);
          const newUsers = users.filter((u: any) => {
            try { const cd = u.createdAt?.toDate?.(); return cd && format(cd, 'yyyy-MM-dd', { locale: tr }) === dateStr; } catch { return false; }
          }).length;
          return { label, satis: parseFloat(saleAmt.toFixed(2)), kullanici: newUsers };
        });
        setSalesChart(days);
        setUsersChart(days);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const alerts = [
    riskStats.riskyUsers > 0  && { type: 'crit', msg: `${riskStats.riskyUsers} yüksek riskli kullanıcı tespit edildi`, tab: 'users', icon: Shield },
    riskStats.openDisputes > 0 && { type: 'crit', msg: `${riskStats.openDisputes} açık uyuşmazlık bekliyor`, tab: 'disputes', icon: Flag },
    riskStats.failedPayments > 5 && { type: 'warn', msg: `${riskStats.failedPayments} başarısız ödeme hareketi var`, tab: 'finance', icon: CreditCard },
    riskStats.highRiskListings > 0 && { type: 'warn', msg: `${riskStats.highRiskListings} yüksek riskli ilan otomatik işaretlendi`, tab: 'listings', icon: AlertTriangle },
    stats.pendingListings > 0 && { type: 'warn', msg: `${stats.pendingListings} ilan moderasyon kuyruğunda`, tab: 'listings', icon: Clock },
    stats.pendingWithdrawals > 0 && { type: 'warn', msg: `${stats.pendingWithdrawals} çekim talebi bekliyor — ${stats.pendingWithdrawalAmount.toFixed(0)}₺`, tab: 'finance', icon: Wallet },
    stats.openTickets > 5 && { type: 'warn', msg: `${stats.openTickets} açık destek talebi var`, tab: 'support', icon: MessageSquare },
    stats.pendingStores > 0 && { type: 'info', msg: `${stats.pendingStores} mağaza başvurusu inceleme bekliyor`, tab: 'stores', icon: Store },
  ].filter(Boolean) as any[];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 rounded-full border-b-2 border-[#5b68f6]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Genel Bakış</h2>
        <span className="text-sm text-gray-400">{format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}</span>
      </div>

      {/* Operasyon Merkezi — Uyarılar */}
      {alerts.length > 0 && (
        <div className="bg-[#1a1b23] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-white font-semibold text-sm">Operasyon Merkezi — {alerts.length} Uyarı</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alerts.map((a, i) => {
              const Icon = a.icon || AlertTriangle;
              const cls = a.type === 'crit'
                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15'
                : a.type === 'warn'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/15';
              return (
                <div key={i} onClick={() => onNavigate(a.tab)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${cls}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm flex-1">{a.msg}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Risk Özeti */}
      {(riskStats.riskyUsers > 0 || riskStats.openDisputes > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 cursor-pointer hover:bg-red-500/15" onClick={() => onNavigate('users')}>
            <p className="text-xs text-red-400 mb-1">Riskli Kullanıcı</p>
            <p className="text-2xl font-black text-red-400">{riskStats.riskyUsers}</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 cursor-pointer hover:bg-orange-500/15" onClick={() => onNavigate('disputes')}>
            <p className="text-xs text-orange-400 mb-1">Açık Uyuşmazlık</p>
            <p className="text-2xl font-black text-orange-400">{riskStats.openDisputes}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 cursor-pointer hover:bg-amber-500/15" onClick={() => onNavigate('finance')}>
            <p className="text-xs text-amber-400 mb-1">Başarısız Ödeme</p>
            <p className="text-2xl font-black text-amber-400">{riskStats.failedPayments}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 cursor-pointer hover:bg-purple-500/15" onClick={() => onNavigate('listings')}>
            <p className="text-xs text-purple-400 mb-1">Riskli İlan</p>
            <p className="text-2xl font-black text-purple-400">{riskStats.highRiskListings}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <KPICard title="Toplam Kullanıcı" value={stats.totalUsers.toLocaleString()} sub={`${stats.activeUsers} aktif`} icon={Users} color="bg-blue-500/20" onClick={() => onNavigate('users')} />
        <KPICard title="Toplam İlan" value={stats.totalListings.toLocaleString()} sub={`${stats.pendingListings} onay bekliyor`} icon={Package} color="bg-purple-500/20" onClick={() => onNavigate('listings')} />
        <KPICard title="Toplam Sipariş" value={stats.totalOrders.toLocaleString()} sub={`${stats.pendingOrders} bekleyen`} icon={ShoppingBag} color="bg-emerald-500/20" onClick={() => onNavigate('orders')} />
        <KPICard title="Tamamlanan Sipariş" value={stats.completedOrders.toLocaleString()} sub="başarıyla tamamlandı" icon={CheckCircle} color="bg-teal-500/20" onClick={() => onNavigate('orders')} />
        <KPICard title="Toplam Ciro" value={`${stats.totalRevenue.toFixed(2)} ₺`} sub="tüm zamanlar" icon={DollarSign} color="bg-amber-500/20" onClick={() => onNavigate('finance')} />
        <KPICard title="Komisyon Geliri" value={`${stats.commissionRevenue.toFixed(2)} ₺`} sub="net kazanç" icon={TrendingUp} color="bg-orange-500/20" onClick={() => onNavigate('finance')} />
        <KPICard title="Bekleyen Çekim" value={stats.pendingWithdrawals.toString()} sub={`${stats.pendingWithdrawalAmount.toFixed(2)} ₺`} icon={Wallet} color="bg-red-500/20" onClick={() => onNavigate('finance')} />
        <KPICard title="Açık Ticket" value={stats.openTickets.toString()} sub="yanıt bekliyor" icon={MessageSquare} color="bg-pink-500/20" onClick={() => onNavigate('support')} />
        <KPICard title="Mağaza Başvurusu" value={stats.pendingStores.toString()} sub="inceleme bekliyor" icon={Store} color="bg-indigo-500/20" onClick={() => onNavigate('stores')} />
        <KPICard title="Onay Bekleyen İlan" value={stats.pendingListings.toString()} sub="moderasyon kuyruğu" icon={Clock} color="bg-yellow-500/20" onClick={() => onNavigate('listings')} />
        <KPICard title="Aktif Kullanıcı" value={stats.activeUsers.toLocaleString()} sub="ban/dondurma hariç" icon={UserCheck} color="bg-cyan-500/20" />
        <KPICard title="Bekleyen Sipariş" value={stats.pendingOrders.toString()} sub="işlem bekliyor" icon={Inbox} color="bg-violet-500/20" onClick={() => onNavigate('orders')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader><CardTitle className="text-white text-sm">Son 7 Gün — Satış (₺)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={salesChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1b23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="satis" stroke="#5b68f6" fill="#5b68f620" strokeWidth={2} name="Satış ₺" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader><CardTitle className="text-white text-sm">Son 7 Gün — Yeni Kullanıcı</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={usersChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1b23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="kullanici" fill="#10b981" radius={[4, 4, 0, 0]} name="Yeni Kullanıcı" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-white text-sm">Son Kayıt Olan Kullanıcılar</CardTitle>
            <Button size="sm" variant="ghost" className="text-[#5b68f6] hover:text-[#5b68f6]/80 text-xs h-7" onClick={() => onNavigate('users')}>Tümü →</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                <div className="w-8 h-8 rounded-full bg-[#5b68f6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{(u.username || 'U')[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.username || 'İsimsiz'}</p>
                  <p className="text-gray-500 text-xs truncate">{u.email || u.id.slice(0, 16)}</p>
                </div>
                <span className="text-gray-600 text-xs flex-shrink-0">{u.createdAt?.toDate?.() ? format(u.createdAt.toDate(), 'dd.MM HH:mm', { locale: tr }) : '-'}</span>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Veri yok</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-white text-sm">Son Açık Destek Talepleri</CardTitle>
            <Button size="sm" variant="ghost" className="text-[#5b68f6] hover:text-[#5b68f6]/80 text-xs h-7" onClick={() => onNavigate('support')}>Tümü →</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTickets.map(t => (
              <div key={t.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5">
                <MessageSquare className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{t.subject || 'Konu belirtilmedi'}</p>
                  <p className="text-gray-500 text-xs">{t.priority || 'Normal'} • {t.category || '-'}</p>
                </div>
                <span className="text-gray-600 text-xs flex-shrink-0">{t.createdAt?.toDate?.() ? format(t.createdAt.toDate(), 'dd.MM', { locale: tr }) : '-'}</span>
              </div>
            ))}
            {recentTickets.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Açık ticket yok</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-white text-sm">Son Verilen İlanlar</CardTitle>
            <Button size="sm" variant="ghost" className="text-[#5b68f6] hover:text-[#5b68f6]/80 text-xs h-7" onClick={() => onNavigate('listings')}>Tümü →</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentListings.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                {p.imageUrls?.[0] ? <img src={p.imageUrls[0]} className="w-8 h-8 rounded object-cover flex-shrink-0" alt="" /> : <Package className="w-8 h-8 text-gray-600 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.title || 'İsimsiz'}</p>
                  <p className="text-gray-500 text-xs">{p.price} ₺ • {p.category || '-'}</p>
                </div>
                <Badge variant="outline" className={`text-xs flex-shrink-0 ${p.moderationStatus === 'pending' ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'}`}>{p.moderationStatus === 'pending' ? 'Bekliyor' : 'Aktif'}</Badge>
              </div>
            ))}
            {recentListings.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Veri yok</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-white text-sm">Son Admin İşlemleri</CardTitle>
            <Button size="sm" variant="ghost" className="text-[#5b68f6] hover:text-[#5b68f6]/80 text-xs h-7" onClick={() => onNavigate('security')}>Tümü →</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5">
                    <Activity className="w-3.5 h-3.5 text-[#5b68f6] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs"><span className="font-medium text-[#8b95ff]">{log.action}</span> <span className="text-gray-500">{log.entity}</span></p>
                      <p className="text-gray-600 text-xs">{log.actorRole} • {log.createdAt?.toDate?.() ? format(log.createdAt.toDate(), 'dd.MM HH:mm', { locale: tr }) : '-'}</p>
                    </div>
                  </div>
                ))}
                {recentLogs.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Log yok</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
