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
import toast from 'react-hot-toast';
import { Package, Search, CheckCircle, XCircle, Eye, Star, Trash2, RefreshCw, AlertTriangle, Flag, Shield, Zap, TrendingDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { runListingModeration, saveModerationResult, REJECTION_TEMPLATES } from '../../services/listingModerationService';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    featured: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  const norm = (status || '').toLowerCase();
  return <Badge variant="outline" className={map[norm] || map.inactive}>{status || '-'}</Badge>;
};

export default function AdminListings() {
  const { user, profile } = useAuth();
  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [autoModRunning, setAutoModRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(500)));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(query(collection(db, 'products'), limit(500)));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const logAction = async (action: string, entityId: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'products', entityId, details: details || {}, createdAt: serverTimestamp() });
  };

  const moderate = async (p: any, moderationStatus: string, reason = '') => {
    try {
      await updateDoc(doc(db, 'products', p.id), {
        moderationStatus,
        moderationReason: reason,
        status: moderationStatus === 'approved' ? 'active' : moderationStatus === 'rejected' ? 'inactive' : p.status,
        updatedAt: serverTimestamp(),
      });
      await logAction(`product.${moderationStatus}`, p.id, { reason });
      toast.success(`İlan ${moderationStatus === 'approved' ? 'onaylandı' : moderationStatus === 'rejected' ? 'reddedildi' : 'güncellendi'}.`);
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, moderationStatus, status: moderationStatus === 'approved' ? 'active' : x.status } : x));
    } catch { toast.error('İşlem başarısız.'); }
  };

  const featureListing = async (p: any) => {
    const isFeatured = p.featured;
    await updateDoc(doc(db, 'products', p.id), { featured: !isFeatured, updatedAt: serverTimestamp() });
    await logAction('product.feature', p.id, { featured: !isFeatured });
    toast.success(isFeatured ? 'Öne çıkarma kaldırıldı.' : 'İlan öne çıkarıldı.');
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, featured: !isFeatured } : x));
  };

  const bulkModerate = async (status: string) => {
    if (!selectedItems.length) return;
    for (const id of selectedItems) {
      const p = products.find(x => x.id === id);
      if (p) await moderate(p, status);
    }
    setSelectedItems([]);
    toast.success(`${selectedItems.length} ilan güncellendi.`);
  };

  const openReject = (p: any) => { setRejectTarget(p); setRejectReason(''); setRejectDialog(true); };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    await moderate(rejectTarget, 'rejected', rejectReason);
    setRejectDialog(false);
    setRejectTarget(null);
  };

  const runAutoModeration = async () => {
    const targets = products.filter(p =>
      (p.moderationStatus === 'pending' || !p.moderationStatus) &&
      p.title && p.description && !p.autoModerated
    ).slice(0, 20);
    if (!targets.length) { toast('Yeni moderasyon edilecek ilan yok.'); return; }
    setAutoModRunning(true);
    let approved = 0, queued = 0, rejected = 0;
    for (const p of targets) {
      try {
        const res = await runListingModeration({
          title: p.title, description: p.description || '',
          price: Number(p.price || 0), category: p.category || '',
          sellerId: p.sellerId || p.userId || '', images: p.imageUrls,
        });
        await saveModerationResult(p.id, res, user?.uid);
        if (res.decision === 'approve') approved++;
        else if (res.decision === 'queue') queued++;
        else rejected++;
        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, moderationScore: res.score, moderationDecision: res.decision, moderationStatus: res.decision === 'reject' ? 'rejected' : res.decision === 'queue' ? 'pending' : 'approved', autoModerated: true } : x));
      } catch { /* skip */ }
    }
    setAutoModRunning(false);
    toast.success(`Oto-mod: ${approved} onay, ${queued} kuyruk, ${rejected} red`);
  };

  const categories = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))], [products]);

  const filtered = useMemo(() => {
    let r = products;
    if (search) r = r.filter(p => (p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.userId || '').includes(search));
    if (catFilter !== 'all') r = r.filter(p => p.category === catFilter);
    if (statusFilter !== 'all') r = r.filter(p => p.moderationStatus === statusFilter || p.status === statusFilter);
    return r;
  }, [products, search, catFilter, statusFilter]);

  const pending = products.filter(p => p.moderationStatus === 'pending' || (!p.moderationStatus && p.status === 'pending'));
  const reported = products.filter(p => (p.reportCount || 0) > 0);
  const rejected = products.filter(p => p.moderationStatus === 'rejected' || p.moderationDecision === 'reject');
  const suspicious = products.filter(p => p.moderationScore !== undefined && p.moderationScore < 50 && p.status !== 'rejected');
  const priceAnomaly = products.filter(p => p.moderationChecks?.some?.((c: any) => c.id === 'price_anomaly' && !c.passed));

  const ScorePill = ({ score }: { score?: number }) => {
    if (score === undefined || score === null) return null;
    const cls = score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : score >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';
    return <span className={`inline-flex items-center gap-1 text-[10px] border rounded-full px-1.5 py-0.5 font-mono ${cls}`}><Shield className="w-2.5 h-2.5" />{score}</span>;
  };

  const ListingsTable = ({ items }: { items: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead className="w-8">
            <input type="checkbox" className="rounded" onChange={e => setSelectedItems(e.target.checked ? items.map(i => i.id) : [])} />
          </TableHead>
          <TableHead className="text-gray-400">İlan</TableHead>
          <TableHead className="text-gray-400">Satıcı</TableHead>
          <TableHead className="text-gray-400">Kategori</TableHead>
          <TableHead className="text-gray-400">Fiyat</TableHead>
          <TableHead className="text-gray-400">Skor</TableHead>
          <TableHead className="text-gray-400">Durum</TableHead>
          <TableHead className="text-gray-400">Tarih</TableHead>
          <TableHead className="text-gray-400 text-right">İşlem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(p => (
          <TableRow key={p.id} className="border-white/10 hover:bg-white/5">
            <TableCell>
              <input type="checkbox" className="rounded" checked={selectedItems.includes(p.id)} onChange={e => setSelectedItems(prev => e.target.checked ? [...prev, p.id] : prev.filter(x => x !== p.id))} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                {p.imageUrls?.[0] ? <img src={p.imageUrls[0]} className="w-10 h-10 rounded object-cover" alt="" /> : <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center"><Package className="w-4 h-4 text-gray-600" /></div>}
                <div className="max-w-[180px]">
                  <p className="text-white text-sm font-medium truncate">{p.title || 'İsimsiz'}</p>
                  {p.featured && <span className="text-xs text-purple-400">⭐ Öne Çıkan</span>}
                  {p.reportCount > 0 && <span className="text-xs text-red-400 ml-1">⚠ {p.reportCount} rapor</span>}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-gray-400 text-sm">{p.userId?.slice(0, 8) || '-'}</TableCell>
            <TableCell className="text-gray-400 text-sm">{p.category || '-'}</TableCell>
            <TableCell className="text-white font-medium">{p.price} ₺</TableCell>
            <TableCell><ScorePill score={p.moderationScore} /></TableCell>
            <TableCell><StatusBadge status={p.moderationStatus || p.status || 'active'} /></TableCell>
            <TableCell className="text-gray-500 text-xs">{p.createdAt?.toDate?.() ? format(p.createdAt.toDate(), 'dd.MM.yy', { locale: tr }) : '-'}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-1 justify-end">
                {p.moderationStatus === 'pending' && <>
                  <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 h-7 px-2" onClick={() => moderate(p, 'approved')}><CheckCircle className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 h-7 px-2" onClick={() => openReject(p)}><XCircle className="w-3 h-3" /></Button>
                </>}
                <Button size="sm" variant="outline" className={`h-7 px-2 ${p.featured ? 'border-purple-500/30 text-purple-400' : 'border-white/10 text-gray-500'}`} onClick={() => featureListing(p)}><Star className="w-3 h-3" /></Button>
                {p.status === 'active' && <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 h-7 px-2" onClick={() => moderate(p, 'suspended')}><Trash2 className="w-3 h-3" /></Button>}
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
          <h2 className="text-2xl font-bold text-white">İlan Yönetimi</h2>
          <p className="text-gray-400 text-sm mt-1">{products.length} toplam ilan • {pending.length} onay bekliyor</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="bg-[#5b68f6]/10 text-[#8b95ff] border border-[#5b68f6]/20 hover:bg-[#5b68f6]/20" onClick={runAutoModeration} disabled={autoModRunning}>
            {autoModRunning ? <><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />Tarıyor...</> : <><Zap className="w-3.5 h-3.5 mr-1" />Oto-Moderasyon Çalıştır</>}
          </Button>
          {selectedItems.length > 0 && <>
            <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => bulkModerate('approved')}><CheckCircle className="w-3.5 h-3.5 mr-1" />Onayla ({selectedItems.length})</Button>
            <Button size="sm" variant="outline" className="border-red-500/20 text-red-400" onClick={() => bulkModerate('rejected')}><XCircle className="w-3.5 h-3.5 mr-1" />Reddet</Button>
            <Button size="sm" variant="outline" className="border-gray-500/20 text-gray-400" onClick={() => bulkModerate('suspended')}><Trash2 className="w-3.5 h-3.5 mr-1" />Pasife Al</Button>
          </>}
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="border-white/10 text-white hover:bg-white/5">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="all">Tüm ({products.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Kuyruk {pending.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full">{pending.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="suspicious">
            Şüpheli {suspicious.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-orange-500 text-white rounded-full">{suspicious.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Reddedilen {rejected.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">{rejected.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="reported">
            Raporlanan {reported.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-400 text-white rounded-full">{reported.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="price">
            Fiyat Sapması {priceAnomaly.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-purple-500 text-white rounded-full">{priceAnomaly.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          <Card className="bg-[#1a1b23] border-white/10">
            <CardContent className="p-3 flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="İlan ara..." className="pl-9 bg-[#111218] border-white/10 text-white h-8" />
              </div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="w-[160px] bg-[#111218] border-white/10 h-8"><SelectValue placeholder="Kategori" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'Tüm Kategoriler' : c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-[#111218] border-white/10 h-8"><SelectValue placeholder="Durum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="pending">Bekleyen</SelectItem>
                  <SelectItem value="rejected">Reddedilmiş</SelectItem>
                  <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1b23] border-white/10">
            {loading ? <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-[#5b68f6]" /></div> : <ListingsTable items={filtered} />}
            {!loading && filtered.length === 0 && <p className="text-center py-10 text-gray-400">İlan bulunamadı.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 ? <div className="text-center py-16 text-gray-400"><CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/30" /><p>Onay bekleyen ilan yok.</p></div> : (
            pending.map(p => (
              <Card key={p.id} className="bg-[#1a1b23] border-white/10">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {p.imageUrls?.[0] && <img src={p.imageUrls[0]} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" alt="" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold">{p.title}</h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{p.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400">{p.price} ₺</Badge>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">{p.category || '-'}</Badge>
                        <Badge variant="outline" className="border-gray-500/30 text-gray-400">Satıcı: {p.userId?.slice(0, 8)}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => moderate(p, 'approved')}><CheckCircle className="w-3.5 h-3.5 mr-1" />Onayla</Button>
                      <Button size="sm" variant="outline" className="border-red-500/20 text-red-400" onClick={() => openReject(p)}><XCircle className="w-3.5 h-3.5 mr-1" />Reddet</Button>
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white" onClick={() => featureListing(p)}><Star className="w-3.5 h-3.5 mr-1" />Öne Çıkar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="suspicious" className="mt-4 space-y-3">
          {suspicious.length === 0 ? <div className="text-center py-16 text-gray-400"><Shield className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Şüpheli ilan yok.</p></div> : (
            suspicious.map(p => (
              <Card key={p.id} className="bg-[#1a1b23] border-orange-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {p.imageUrls?.[0] && <img src={p.imageUrls[0]} className="w-16 h-16 rounded object-cover flex-shrink-0" alt="" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 text-sm font-medium">Mod Skoru: {p.moderationScore}</span>
                        {p.moderationRejectReason && <span className="text-red-400 text-xs">{p.moderationRejectReason}</span>}
                      </div>
                      <h3 className="text-white font-semibold truncate">{p.title}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{p.category} • {p.price} ₺</p>
                      {p.moderationChecks && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.moderationChecks.filter((c: any) => !c.passed).map((c: any) => (
                            <span key={c.id} className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 rounded px-1.5 py-0.5">{c.label}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 h-7" onClick={() => moderate(p, 'approved')}><CheckCircle className="w-3 h-3 mr-1" />Onayla</Button>
                      <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 h-7" onClick={() => openReject(p)}><XCircle className="w-3 h-3 mr-1" />Reddet</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4 space-y-3">
          {rejected.length === 0 ? <div className="text-center py-16 text-gray-400"><XCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Reddedilen ilan yok.</p></div> : (
            <Card className="bg-[#1a1b23] border-white/10">
              <ListingsTable items={rejected} />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reported" className="mt-4 space-y-3">
          {reported.length === 0 ? <div className="text-center py-16 text-gray-400"><Flag className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Raporlanan ilan yok.</p></div> : (
            reported.map(p => (
              <Card key={p.id} className="bg-[#1a1b23] border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-amber-400 text-sm font-medium">{p.reportCount || 0} rapor</span></div>
                      <h3 className="text-white font-semibold">{p.title}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">Kategori: {p.category} • {p.price} ₺</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => moderate(p, 'approved')}>Temiz</Button>
                      <Button size="sm" variant="outline" className="border-red-500/20 text-red-400" onClick={() => openReject(p)}>Kaldır</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="price" className="mt-4 space-y-3">
          {priceAnomaly.length === 0 ? <div className="text-center py-16 text-gray-400"><TrendingDown className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Fiyat sapması tespit edilmedi.</p></div> : (
            <Card className="bg-[#1a1b23] border-white/10">
              <ListingsTable items={priceAnomaly} />
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>İlanı Reddet</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">İlan: <span className="text-white">{rejectTarget?.title}</span></p>
            <Label className="text-white text-xs text-gray-400">Şablon Seç</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {REJECTION_TEMPLATES.filter(t => t.id !== 'other').map(t => (
                <button key={t.id} onClick={() => setRejectReason(t.text)}
                  className={`text-left text-xs p-2 rounded-lg border transition-all ${rejectReason === t.text ? 'bg-[#5b68f6]/20 border-[#5b68f6]/40 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <Label className="text-white">Red Sebebi (kullanıcıya gösterilecek)</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Red sebebini yazın..." rows={3} className="bg-[#111218] border-white/10 text-white" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={confirmReject} className="bg-red-500/20 text-red-400 border border-red-500/30">Reddet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
