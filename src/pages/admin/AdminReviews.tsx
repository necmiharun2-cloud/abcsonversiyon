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
import { ScrollArea } from '../../components/ui/scroll-area';
import toast from 'react-hot-toast';
import { Star, Trash2, CheckCircle, Search, RefreshCw, EyeOff, Eye, Flag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminReviews() {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(300)));
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(query(collection(db, 'reviews'), limit(300)));
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, id: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'reviews', entityId: id, details: details || {}, createdAt: serverTimestamp() });
  };

  const updateReview = async (r: any, patch: any, actionName: string) => {
    try {
      await updateDoc(doc(db, 'reviews', r.id), { ...patch, updatedAt: serverTimestamp() });
      await logAction(actionName, r.id, patch);
      toast.success('Yorum güncellendi.');
      setReviews(prev => prev.map(x => x.id === r.id ? { ...x, ...patch } : x));
    } catch { toast.error('Güncelleme başarısız.'); }
  };

  const filtered = useMemo(() => {
    let r = reviews;
    if (search) r = r.filter(x => (x.comment || x.text || '').toLowerCase().includes(search.toLowerCase()) || (x.reviewerId || '').includes(search));
    if (ratingFilter !== 'all') r = r.filter(x => String(x.rating) === ratingFilter);
    if (statusFilter !== 'all') r = r.filter(x => (x.status || 'active') === statusFilter);
    return r;
  }, [reviews, search, ratingFilter, statusFilter]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : '0';
  const reported = reviews.filter(r => r.reportCount > 0);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
      ))}
      <span className="text-white text-sm ml-1">{rating}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Yorum & Puan Yönetimi</h2><p className="text-gray-400 text-sm mt-1">{reviews.length} yorum • Ort. puan: {avgRating}</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Toplam Yorum', value: reviews.length, color: 'text-white' },
          { label: 'Ortalama Puan', value: avgRating, color: 'text-amber-400' },
          { label: 'Raporlanan', value: reported.length, color: 'text-red-400' },
          { label: 'Silinen', value: reviews.filter(r => r.status === 'deleted').length, color: 'text-gray-400' },
        ].map(s => (
          <Card key={s.label} className="bg-[#1a1b23] border-white/10">
            <CardContent className="p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a1b23] border-white/10">
        <CardContent className="p-3 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Yorum ara..." className="pl-9 bg-[#111218] border-white/10 text-white h-8" />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-36 bg-[#111218] border-white/10 h-8"><SelectValue placeholder="Puan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Puanlar</SelectItem>
              {['5','4','3','2','1'].map(r => <SelectItem key={r} value={r}>{'⭐'.repeat(Number(r))} ({r})</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-[#111218] border-white/10 h-8"><SelectValue placeholder="Durum" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="hidden">Gizli</SelectItem>
              <SelectItem value="deleted">Silinen</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1b23] border-white/10">
        {loading ? <div className="flex justify-center py-10"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-[#5b68f6]" /></div> : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Kullanıcı</TableHead>
                <TableHead className="text-gray-400">Hedef</TableHead>
                <TableHead className="text-gray-400">Puan</TableHead>
                <TableHead className="text-gray-400">Yorum</TableHead>
                <TableHead className="text-gray-400">Rapor</TableHead>
                <TableHead className="text-gray-400">Durum</TableHead>
                <TableHead className="text-gray-400">Tarih</TableHead>
                <TableHead className="text-gray-400 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white text-sm font-mono">{r.reviewerId?.slice(0, 8) || '-'}</TableCell>
                  <TableCell className="text-gray-400 text-sm font-mono">{(r.targetId || r.productId || r.sellerId || '-')?.slice(0, 8)}</TableCell>
                  <TableCell><StarRating rating={Number(r.rating) || 0} /></TableCell>
                  <TableCell className="text-gray-400 text-sm max-w-[220px]">
                    <p className="truncate">{r.comment || r.text || '-'}</p>
                  </TableCell>
                  <TableCell>
                    {r.reportCount > 0 ? (
                      <span className="flex items-center gap-1 text-red-400 text-xs"><Flag className="w-3 h-3" />{r.reportCount}</span>
                    ) : <span className="text-gray-600 text-xs">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={r.status === 'deleted' ? 'border-red-500/20 text-red-400' : r.status === 'hidden' ? 'border-gray-500/20 text-gray-400' : 'border-emerald-500/20 text-emerald-400'}>{r.status || 'active'}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">{r.createdAt?.toDate?.() ? format(r.createdAt.toDate(), 'dd.MM.yy', { locale: tr }) : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {r.status !== 'hidden' && r.status !== 'deleted' && (
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-gray-500/20 text-gray-400 hover:text-white" title="Gizle" onClick={() => updateReview(r, { status: 'hidden' }, 'review.hide')}><EyeOff className="w-3 h-3" /></Button>
                      )}
                      {r.status === 'hidden' && (
                        <Button size="sm" className="h-7 w-7 p-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Göster" onClick={() => updateReview(r, { status: 'active' }, 'review.show')}><Eye className="w-3 h-3" /></Button>
                      )}
                      {r.status !== 'deleted' && (
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-red-500/20 text-red-400 hover:bg-red-500/10" title="Sil" onClick={() => updateReview(r, { status: 'deleted' }, 'review.delete')}><Trash2 className="w-3 h-3" /></Button>
                      )}
                      {r.status === 'deleted' && (
                        <Button size="sm" className="h-7 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs" onClick={() => updateReview(r, { status: 'active' }, 'review.restore')}>Geri Yükle</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && filtered.length === 0 && <p className="text-center py-10 text-gray-400">Yorum bulunamadı.</p>}
      </Card>
    </div>
  );
}
