import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import toast from 'react-hot-toast';
import { Store, CheckCircle, XCircle, Ban, RefreshCw, Star, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SBadge = ({ s }: { s: string }) => {
  const m: Record<string, string> = { active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20', approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', rejected: 'bg-red-500/10 text-red-400 border-red-500/20', suspended: 'bg-red-500/10 text-red-400 border-red-500/20' };
  return <Badge variant="outline" className={m[(s||'').toLowerCase()] || m.active}>{s || '-'}</Badge>;
};

export default function AdminStores() {
  const { user, profile } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const safe = async (col: string) => {
      try { return (await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(200)))).docs.map(d => ({ id: d.id, ...d.data() })); }
      catch { return (await getDocs(query(collection(db, col), limit(200)))).docs.map(d => ({ id: d.id, ...d.data() })); }
    };
    const [a, s] = await Promise.all([safe('storeApplications'), safe('stores')]);
    setApps(a); setStores(s); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, id: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'stores', entityId: id, details: details || {}, createdAt: serverTimestamp() });
  };

  const approveApp = async (app: any, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'storeApplications', app.id), { status, reviewedBy: user?.uid, reviewedAt: serverTimestamp(), rejectionReason: status === 'rejected' ? rejectReason : '' });
      if (status === 'approved') {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'stores', app.userId || app.id), { storeName: app.storeName, userId: app.userId, status: 'active', level: 'standard', createdAt: serverTimestamp() }, { merge: true });
        await updateDoc(doc(db, 'users', app.userId), { hasStore: true, storeId: app.userId || app.id, updatedAt: serverTimestamp() });
      }
      await logAction(`store.application.${status}`, app.id);
      toast.success(`Başvuru ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
      setApps(prev => prev.map(x => x.id === app.id ? { ...x, status } : x));
      setRejectDialog(false); setRejectReason('');
    } catch { toast.error('İşlem başarısız.'); }
  };

  const updateStore = async (s: any, patch: any) => {
    try {
      await updateDoc(doc(db, 'stores', s.id), { ...patch, updatedAt: serverTimestamp() });
      await logAction('store.update', s.id, patch);
      toast.success('Mağaza güncellendi.');
      setStores(prev => prev.map(x => x.id === s.id ? { ...x, ...patch } : x));
      if (selectedStore?.id === s.id) setSelectedStore((p: any) => ({ ...p, ...patch }));
    } catch { toast.error('Güncelleme başarısız.'); }
  };

  const pendingApps = apps.filter(a => a.status === 'pending');
  const approvedApps = apps.filter(a => a.status === 'approved');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Mağaza Yönetimi</h2><p className="text-gray-400 text-sm mt-1">{stores.length} aktif mağaza • {pendingApps.length} bekleyen başvuru</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Aktif Mağaza', value: stores.filter(s => s.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Bekleyen Başvuru', value: pendingApps.length, color: 'text-amber-400' },
          { label: 'Onaylanan Başvuru', value: approvedApps.length, color: 'text-blue-400' },
          { label: 'Askıya Alınan', value: stores.filter(s => s.status === 'suspended').length, color: 'text-red-400' },
        ].map(s => (
          <Card key={s.label} className="bg-[#1a1b23] border-white/10">
            <CardContent className="p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`font-bold text-2xl ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="applications">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="applications">Başvurular{pendingApps.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">{pendingApps.length}</span>}</TabsTrigger>
          <TabsTrigger value="stores">Aktif Mağazalar</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-4 space-y-3">
          {pendingApps.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/30" /><p>Bekleyen başvuru yok.</p></div>
          ) : (
            pendingApps.map(app => (
              <Card key={app.id} className="bg-[#1a1b23] border-white/10">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Store className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-semibold text-lg">{app.storeName || 'İsimsiz Mağaza'}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div><span className="text-gray-500">Kullanıcı:</span> <span className="text-white">{app.userId?.slice(0, 12) || '-'}</span></div>
                        <div><span className="text-gray-500">Kategori:</span> <span className="text-white">{app.category || '-'}</span></div>
                        <div><span className="text-gray-500">Tarih:</span> <span className="text-white">{app.createdAt?.toDate?.() ? format(app.createdAt.toDate(), 'dd.MM.yyyy', { locale: tr }) : '-'}</span></div>
                      </div>
                      {app.description && <p className="text-gray-400 text-sm bg-[#111218] p-3 rounded-lg">{app.description}</p>}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => approveApp(app, 'approved')}><CheckCircle className="w-4 h-4 mr-1.5" />Onayla</Button>
                      <Button variant="outline" className="border-red-500/20 text-red-400" onClick={() => { setRejectTarget(app); setRejectDialog(true); }}><XCircle className="w-4 h-4 mr-1.5" />Reddet</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {approvedApps.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-medium mb-3">Onaylanmış Başvurular ({approvedApps.length})</h3>
              <Card className="bg-[#1a1b23] border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-400">Mağaza Adı</TableHead>
                      <TableHead className="text-gray-400">Kullanıcı</TableHead>
                      <TableHead className="text-gray-400">Tarih</TableHead>
                      <TableHead className="text-gray-400">Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedApps.map(a => (
                      <TableRow key={a.id} className="border-white/10">
                        <TableCell className="text-white">{a.storeName}</TableCell>
                        <TableCell className="text-gray-400">{a.userId?.slice(0, 10)}</TableCell>
                        <TableCell className="text-gray-500 text-xs">{a.createdAt?.toDate?.() ? format(a.createdAt.toDate(), 'dd.MM.yy', { locale: tr }) : '-'}</TableCell>
                        <TableCell><SBadge s={a.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stores" className="mt-4">
          <Card className="bg-[#1a1b23] border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-400">Mağaza</TableHead>
                  <TableHead className="text-gray-400">Sahip</TableHead>
                  <TableHead className="text-gray-400">Seviye</TableHead>
                  <TableHead className="text-gray-400">Durum</TableHead>
                  <TableHead className="text-gray-400">Puan</TableHead>
                  <TableHead className="text-gray-400 text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map(s => (
                  <TableRow key={s.id} className="border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => { setSelectedStore(s); setDetailOpen(true); }}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Store className="w-4 h-4 text-blue-400" /></div>
                        <span className="text-white font-medium">{s.storeName || s.id.slice(0, 10)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">{s.userId?.slice(0, 10) || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={s.level === 'premium' ? 'border-amber-500/30 text-amber-400' : s.level === 'gold' ? 'border-yellow-500/30 text-yellow-400' : 'border-gray-500/30 text-gray-400'}>{s.level || 'standard'}</Badge>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}><SBadge s={s.status || 'active'} /></TableCell>
                    <TableCell>
                      {s.rating ? <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-white text-sm">{Number(s.rating).toFixed(1)}</span></div> : <span className="text-gray-600 text-sm">-</span>}
                    </TableCell>
                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                      {s.status !== 'suspended' ? (
                        <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 h-7 px-2" onClick={() => updateStore(s, { status: 'suspended' })}><Ban className="w-3 h-3 mr-1" />Askıya Al</Button>
                      ) : (
                        <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 h-7 px-2" onClick={() => updateStore(s, { status: 'active' })}><CheckCircle className="w-3 h-3 mr-1" />Aktif Et</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {stores.length === 0 && <p className="text-center py-10 text-gray-400">Mağaza bulunamadı.</p>}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white">
          <DialogHeader><DialogTitle>Başvuruyu Reddet</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Mağaza: <span className="text-white">{rejectTarget?.storeName}</span></p>
            <Label className="text-white">Red Sebebi</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Kullanıcıya gösterilecek red sebebi..." rows={3} className="bg-[#111218] border-white/10 text-white" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={() => approveApp(rejectTarget, 'rejected')} className="bg-red-500/20 text-red-400 border border-red-500/30">Reddet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>Mağaza Detayı</DialogTitle></DialogHeader>
          {selectedStore && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Mağaza Adı', selectedStore.storeName],
                  ['Sahip', selectedStore.userId?.slice(0, 12)],
                  ['Durum', selectedStore.status || 'active'],
                  ['Seviye', selectedStore.level || 'standard'],
                  ['Puan', selectedStore.rating ? Number(selectedStore.rating).toFixed(1) : '-'],
                  ['Toplam Satış', selectedStore.totalSales || 0],
                  ['Toplam Sipariş', selectedStore.totalOrders || 0],
                  ['Şikayet Oranı', selectedStore.complaintRate ? `%${selectedStore.complaintRate}` : '-'],
                ].map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-lg bg-[#111218] border border-white/5">
                    <p className="text-gray-500 text-xs mb-0.5">{k}</p>
                    <p className="text-white font-medium">{v}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-white text-sm">Seviye Ayarla</Label>
                <div className="flex gap-2">
                  {['standard', 'premium', 'gold'].map(l => (
                    <Button key={l} size="sm" variant="outline" className={`border-white/10 capitalize ${selectedStore.level === l ? 'text-white bg-white/10' : 'text-gray-400'}`} onClick={() => updateStore(selectedStore, { level: l })}>{l}</Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)} className="border-white/10 text-white">Kapat</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
