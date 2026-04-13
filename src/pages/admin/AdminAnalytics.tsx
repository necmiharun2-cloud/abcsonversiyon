import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { RefreshCw, TrendingUp, TrendingDown, Users, ShoppingBag, Package, CreditCard, Download } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#5b68f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminAnalytics() {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  const load = async () => {
    setLoading(true);
    const safe = async (col: string, max = 500) => {
      try { return (await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() })); }
      catch { return (await getDocs(query(collection(db, col), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() })); }
    };
    const [u, o, p, t] = await Promise.all([safe('users', 500), safe('orders', 500), safe('products', 500), safe('transactions', 500)]);
    setUsers(u); setOrders(o); setProducts(p); setTransactions(t);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const days = Number(period);
  const dateRange = Array.from({ length: days }, (_, i) => {
    const d = subDays(new Date(), days - 1 - i);
    return format(d, 'yyyy-MM-dd');
  });

  const dailySales = dateRange.map(dateStr => {
    const label = format(new Date(dateStr), 'dd.MM', { locale: tr });
    const dayOrders = orders.filter(o => {
      try { const cd = o.createdAt?.toDate?.(); return cd && format(cd, 'yyyy-MM-dd') === dateStr; } catch { return false; }
    });
    const revenue = dayOrders.reduce((s, o) => s + Number(o.amount || o.total || 0), 0);
    const commission = dayOrders.reduce((s, o) => s + Number(o.commission || 0), 0);
    return { label, ciro: parseFloat(revenue.toFixed(2)), komisyon: parseFloat(commission.toFixed(2)), siparis: dayOrders.length };
  });

  const dailyUsers = dateRange.map(dateStr => {
    const label = format(new Date(dateStr), 'dd.MM', { locale: tr });
    const count = users.filter(u => {
      try { const cd = u.createdAt?.toDate?.(); return cd && format(cd, 'yyyy-MM-dd') === dateStr; } catch { return false; }
    }).length;
    return { label, kullanici: count };
  });

  const categoryData = Array.from(
    products.reduce((acc, p) => { const k = p.category || 'Diğer'; acc.set(k, (acc.get(k) || 0) + 1); return acc; }, new Map<string, number>())
  ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 8).map(([name, value]: any) => ({ name, value }));

  const orderStatusData = [
    { name: 'Bekleyen', value: orders.filter(o => ['pending', 'processing'].includes(o.status)).length },
    { name: 'Tamamlanan', value: orders.filter(o => o.status === 'completed').length },
    { name: 'İptal', value: orders.filter(o => o.status === 'cancelled').length },
    { name: 'İhtilaf', value: orders.filter(o => o.status === 'disputed').length },
  ].filter(d => d.value > 0);

  const topSellers = Array.from(
    orders.filter(o => o.status === 'completed').reduce((acc, o) => {
      const k = o.sellerId || 'unknown'; acc.set(k, (acc.get(k) || 0) + Number(o.amount || 0)); return acc;
    }, new Map<string, number>())
  ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([id, revenue]: any) => ({ id: id.slice(0, 10), revenue: parseFloat(revenue.toFixed(2)) }));

  const kpis = {
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.amount || o.total || 0), 0),
    totalCommission: transactions.filter(t => t.type === 'commission').reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0),
    conversionRate: orders.length > 0 ? ((orders.filter(o => o.status === 'completed').length / orders.length) * 100).toFixed(1) : '0',
    refundRate: orders.length > 0 ? ((orders.filter(o => o.status === 'refunded').length / orders.length) * 100).toFixed(1) : '0',
    disputeRate: orders.length > 0 ? ((orders.filter(o => o.status === 'disputed').length / orders.length) * 100).toFixed(1) : '0',
    avgOrderValue: orders.filter(o => o.status === 'completed').length > 0 ? (orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.amount || o.total || 0), 0) / orders.filter(o => o.status === 'completed').length).toFixed(2) : '0',
  };

  const exportCSV = () => {
    const rows = [['Tarih', 'Ciro (₺)', 'Komisyon (₺)', 'Sipariş Sayısı'], ...dailySales.map(d => [d.label, d.ciro, d.komisyon, d.siparis])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `rapor_${period}gun.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-b-2 border-[#5b68f6]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl font-bold text-white">Analitik & Raporlama</h2><p className="text-gray-400 text-sm mt-1">İş kararları için veriler</p></div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36 bg-[#1a1b23] border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Son 7 Gün</SelectItem>
              <SelectItem value="14">Son 14 Gün</SelectItem>
              <SelectItem value="30">Son 30 Gün</SelectItem>
              <SelectItem value="90">Son 90 Gün</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={load} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Toplam Ciro', value: `${kpis.totalRevenue.toFixed(2)} ₺`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Komisyon', value: `${kpis.totalCommission.toFixed(2)} ₺`, icon: CreditCard, color: 'text-purple-400' },
          { label: 'Dönüşüm', value: `%${kpis.conversionRate}`, icon: TrendingUp, color: 'text-blue-400' },
          { label: 'İade Oranı', value: `%${kpis.refundRate}`, icon: TrendingDown, color: 'text-amber-400' },
          { label: 'İhtilaf Oranı', value: `%${kpis.disputeRate}`, icon: TrendingDown, color: 'text-red-400' },
          { label: 'Ort. Sipariş', value: `${kpis.avgOrderValue} ₺`, icon: ShoppingBag, color: 'text-cyan-400' },
        ].map(k => (
          <Card key={k.label} className="bg-[#1a1b23] border-white/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1"><k.icon className={`w-3.5 h-3.5 ${k.color}`} /><span className="text-gray-500 text-xs">{k.label}</span></div>
              <p className={`font-bold text-lg ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Günlük Ciro (₺)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailySales} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1b23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="ciro" stroke="#5b68f6" fill="#5b68f620" strokeWidth={2} name="Ciro ₺" />
                <Area type="monotone" dataKey="komisyon" stroke="#10b981" fill="#10b98120" strokeWidth={2} name="Komisyon ₺" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Günlük Yeni Kullanıcı</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyUsers} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1b23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="kullanici" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Yeni Kullanıcı" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Günlük Sipariş Sayısı</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailySales} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1b23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="siparis" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Sipariş" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">Sipariş Durum Dağılımı</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`} labelLine={false}>
                  {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1b23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">En Aktif Kategoriler</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ background: '#1a1b23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#5b68f6" radius={[0, 3, 3, 0]} name="İlan Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">En Çok Satan Satıcılar</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topSellers.length === 0 ? <p className="text-center py-8 text-gray-400 text-sm">Veri yok.</p> :
              topSellers.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm w-5">{i + 1}.</span>
                  <span className="text-white text-sm flex-1 font-mono">{s.id}...</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5b68f6] rounded-full" style={{ width: `${(s.revenue / topSellers[0].revenue) * 100}%` }} />
                  </div>
                  <span className="text-emerald-400 text-sm font-bold w-28 text-right">{s.revenue.toFixed(2)} ₺</span>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
