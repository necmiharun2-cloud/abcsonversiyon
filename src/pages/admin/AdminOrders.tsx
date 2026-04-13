import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, limit, orderBy, query, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import toast from 'react-hot-toast';
import { ShoppingBag, CheckCircle, XCircle, Gavel, Search, RefreshCw, Clock, AlertTriangle, StickyNote, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    disputed: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    resolved: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    refunded: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return <Badge variant="outline" className={map[status] || map.pending}>{status || 'pending'}</Badge>;
};

export default function AdminOrders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [manualNote, setManualNote] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(500)));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(query(collection(db, 'orders'), limit(500)));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const log = async (action: string, orderId: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'orders', entityId: orderId, details: details || {}, createdAt: serverTimestamp() });
  };

  const updateStatus = async (order: any, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), { status, updatedAt: serverTimestamp(), reviewedBy: user?.uid });
      await log(`order.${status}`, order.id, { prevStatus: order.status });
      toast.success('Sipariş durumu güncellendi.');
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o));
      if (selectedOrder?.id === order.id) setSelectedOrder((p: any) => ({ ...p, status }));
    } catch { toast.error('Güncelleme başarısız.'); }
  };

  const addNote = async () => {
    if (!selectedOrder || !manualNote.trim()) return;
    const notes = Array.isArray(selectedOrder.adminNotes) ? selectedOrder.adminNotes : [];
    const n = { note: manualNote.trim(), addedBy: user?.uid, addedAt: new Date().toISOString() };
    await updateDoc(doc(db, 'orders', selectedOrder.id), { adminNotes: [...notes, n], updatedAt: serverTimestamp() });
    await log('order.addNote', selectedOrder.id, n);
    toast.success('Not eklendi.');
    setManualNote('');
    setSelectedOrder((p: any) => ({ ...p, adminNotes: [...notes, n] }));
  };

  const filtered = useMemo(() => {
    let r = orders;
    if (search) r = r.filter(o => o.id.includes(search) || (o.buyerId || '').includes(search) || (o.sellerId || '').includes(search));
    if (statusFilter !== 'all') r = r.filter(o => o.status === statusFilter);
    return r;
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => ['pending','processing'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    disputed: orders.filter(o => o.status === 'disputed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.amount || o.total || 0), 0),
    commission: orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.commission || 0), 0),
  }), [orders]);

  const OrdersTable = ({ items }: { items: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead className="text-gray-400">Sipariş No</TableHead>
          <TableHead className="text-gray-400">Alıcı</TableHead>
          <TableHead className="text-gray-400">Satıcı</TableHead>
          <TableHead className="text-gray-400">Tutar</TableHead>
          <TableHead className="text-gray-400">Komisyon</TableHead>
          <TableHead className="text-gray-400">Durum</TableHead>
          <TableHead className="text-gray-400">Tarih</TableHead>
          <TableHead className="text-gray-400 text-right">İşlem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(o => (
          <TableRow key={o.id} className="border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => { setSelectedOrder(o); setDetailOpen(true); }}>
            <TableCell className="text-gray-400 font-mono text-xs">{o.id.slice(0, 12)}...</TableCell>
            <TableCell className="text-white text-sm">{o.buyerId?.slice(0, 8) || '-'}</TableCell>
            <TableCell className="text-white text-sm">{o.sellerId?.slice(0, 8) || '-'}</TableCell>
            <TableCell className="text-white font-semibold">{(Number(o.amount || o.total) || 0).toFixed(2)} ₺</TableCell>
            <TableCell className="text-amber-400 text-sm">{(Number(o.commission) || 0).toFixed(2)} ₺</TableCell>
            <TableCell onClick={e => e.stopPropagation()}><SBadge status={o.status || 'pending'} /></TableCell>
            <TableCell className="text-gray-500 text-xs">{o.createdAt?.toDate?.() ? format(o.createdAt.toDate(), 'dd.MM.yy HH:mm', { locale: tr }) : '-'}</TableCell>
            <TableCell className="text-right" onClick={e => e.stopPropagation()}>
              <div className="flex gap-1 justify-end">
                {o.status === 'pending' && <>
                  <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 h-6 px-2 text-xs" onClick={() => updateStatus(o, 'completed')}>Tamamla</Button>
                  <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 h-6 px-2 text-xs" onClick={() => updateStatus(o, 'cancelled')}>İptal</Button>
                </>}
                {o.status === 'disputed' && <Button size="sm" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 h-6 px-2 text-xs" onClick={() => updateStatus(o, 'resolved')}>Çöz</Button>}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sipariş Yönetimi</h2>
          <p className="text-gray-400 text-sm mt-1">{orders.length} toplam sipariş</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Toplam', value: stats.total, color: 'text-white' },
          { label: 'Bekleyen', value: stats.pending, color: 'text-amber-400' },
          { label: 'Tamamlanan', value: stats.completed, color: 'text-emerald-400' },
          { label: 'İptal', value: stats.cancelled, color: 'text-red-400' },
          { label: 'İhtilaf', value: stats.disputed, color: 'text-orange-400' },
          { label: 'Toplam Ciro', value: `${stats.totalRevenue.toFixed(2)} ₺`, color: 'text-blue-400' },
          { label: 'Komisyon', value: `${stats.commission.toFixed(2)} ₺`, color: 'text-purple-400' },
        ].map(s => (
          <Card key={s.label} className="bg-[#1a1b23] border-white/10">
            <CardContent className="p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="all">Tüm Siparişler</TabsTrigger>
          <TabsTrigger value="pending">Bekleyen{stats.pending > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full">{stats.pending}</span>}</TabsTrigger>
          <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
          <TabsTrigger value="cancelled">İptal / İade</TabsTrigger>
          <TabsTrigger value="disputed">İhtilaf{stats.disputed > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-orange-500 text-white rounded-full">{stats.disputed}</span>}</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'completed', 'cancelled', 'disputed'].map(tabVal => (
          <TabsContent key={tabVal} value={tabVal} className="mt-4 space-y-3">
            <Card className="bg-[#1a1b23] border-white/10">
              <CardContent className="p-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sipariş ID veya kullanıcı ara..." className="pl-9 bg-[#111218] border-white/10 text-white h-8" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1b23] border-white/10">
              {loading ? <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-[#5b68f6]" /></div> : (
                <OrdersTable items={tabVal === 'all' ? filtered : orders.filter(o => {
                  if (tabVal === 'pending') return ['pending','processing'].includes(o.status);
                  return o.status === tabVal;
                })} />
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>Sipariş Detayı</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Sipariş ID', selectedOrder.id.slice(0, 16) + '...'],
                  ['Alıcı', selectedOrder.buyerId?.slice(0, 12) || '-'],
                  ['Satıcı', selectedOrder.sellerId?.slice(0, 12) || '-'],
                  ['Tutar', `${(Number(selectedOrder.amount || selectedOrder.total) || 0).toFixed(2)} ₺`],
                  ['Komisyon', `${(Number(selectedOrder.commission) || 0).toFixed(2)} ₺`],
                  ['Durum', selectedOrder.status || '-'],
                  ['Tarih', selectedOrder.createdAt?.toDate?.() ? format(selectedOrder.createdAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-'],
                  ['Ürün', selectedOrder.productTitle || selectedOrder.listingTitle || '-'],
                ].map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-lg bg-[#111218] border border-white/5">
                    <p className="text-gray-500 text-xs mb-0.5">{k}</p>
                    <p className="text-white font-medium">{v}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-white text-sm">Manuel Müdahale</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status !== 'completed' && <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => updateStatus(selectedOrder, 'completed')}><CheckCircle className="w-3.5 h-3.5 mr-1" />Tamamla</Button>}
                  {selectedOrder.status !== 'cancelled' && <Button size="sm" variant="outline" className="border-red-500/20 text-red-400" onClick={() => updateStatus(selectedOrder, 'cancelled')}><XCircle className="w-3.5 h-3.5 mr-1" />İptal Et</Button>}
                  {selectedOrder.status !== 'disputed' && <Button size="sm" className="bg-orange-500/10 text-orange-400 border border-orange-500/20" onClick={() => updateStatus(selectedOrder, 'disputed')}><Gavel className="w-3.5 h-3.5 mr-1" />İhtilaf Aç</Button>}
                  {selectedOrder.status !== 'refunded' && <Button size="sm" className="bg-purple-500/10 text-purple-400 border border-purple-500/20" onClick={() => updateStatus(selectedOrder, 'refunded')}>İade Et</Button>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white text-sm">Admin Notu</Label>
                <Textarea value={manualNote} onChange={e => setManualNote(e.target.value)} placeholder="Not ekle..." rows={2} className="bg-[#111218] border-white/10 text-white" />
                <Button size="sm" onClick={addNote} disabled={!manualNote.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90"><StickyNote className="w-3.5 h-3.5 mr-1" />Not Ekle</Button>
              </div>

              {Array.isArray(selectedOrder.adminNotes) && selectedOrder.adminNotes.length > 0 && (
                <ScrollArea className="h-32">
                  {selectedOrder.adminNotes.map((n: any, i: number) => (
                    <div key={i} className="p-2 rounded bg-[#111218] border border-white/5 mb-1.5">
                      <p className="text-white text-xs">{n.note}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">{n.addedBy?.slice(0, 8)} • {n.addedAt ? format(new Date(n.addedAt), 'dd.MM.yy HH:mm') : '-'}</p>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)} className="border-white/10 text-white">Kapat</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
