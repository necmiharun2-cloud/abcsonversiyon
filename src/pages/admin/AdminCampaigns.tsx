import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, doc, updateDoc, serverTimestamp, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import toast from 'react-hot-toast';
import { Gift, Percent, Plus, Trash2, Award, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminCampaigns() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [gDialog, setGDialog] = useState(false);
  const [gTitle, setGTitle] = useState('');
  const [gPrize, setGPrize] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gEndsAt, setGEndsAt] = useState('');

  const [cDialog, setCDialog] = useState(false);
  const [cCode, setCCode] = useState('');
  const [cDiscount, setCDiscount] = useState('');
  const [cType, setCType] = useState('percent');
  const [cLimit, setCLimit] = useState('');
  const [cCategory, setCCategory] = useState('');
  const [cExpiry, setCExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const safe = async (col: string) => {
      try { return (await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(100)))).docs.map(d => ({ id: d.id, ...d.data() })); }
      catch { return (await getDocs(query(collection(db, col), limit(100)))).docs.map(d => ({ id: d.id, ...d.data() })); }
    };
    const [g, c] = await Promise.all([safe('giveaways'), safe('coupons')]);
    setGiveaways(g); setCoupons(c); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, id: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'campaigns', entityId: id, details: details || {}, createdAt: serverTimestamp() });
  };

  const createGiveaway = async () => {
    if (!gTitle.trim() || !gPrize.trim()) { toast.error('Başlık ve ödül zorunlu.'); return; }
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'giveaways'), {
        title: gTitle.trim(), prize: gPrize.trim(), description: gDesc.trim(),
        endsAt: gEndsAt ? new Date(gEndsAt) : null,
        status: 'active', participants: [], winner: null,
        createdBy: user?.uid, createdAt: serverTimestamp(),
      });
      await logAction('giveaway.create', ref.id, { title: gTitle });
      toast.success('Çekiliş oluşturuldu.'); setGDialog(false);
      setGTitle(''); setGPrize(''); setGDesc(''); setGEndsAt('');
      load();
    } catch { toast.error('Oluşturma başarısız.'); } finally { setSaving(false); }
  };

  const pickWinner = async (g: any) => {
    const parts = g.participants || [];
    if (parts.length === 0) { toast.error('Katılımcı yok.'); return; }
    const winner = parts[Math.floor(Math.random() * parts.length)];
    await updateDoc(doc(db, 'giveaways', g.id), { winner, status: 'completed', completedAt: serverTimestamp() });
    await logAction('giveaway.pickWinner', g.id, { winner });
    toast.success(`Kazanan seçildi: ${winner.slice(0, 10)}`);
    setGiveaways(prev => prev.map(x => x.id === g.id ? { ...x, winner, status: 'completed' } : x));
  };

  const closeGiveaway = async (g: any) => {
    await updateDoc(doc(db, 'giveaways', g.id), { status: 'closed', closedAt: serverTimestamp() });
    await logAction('giveaway.close', g.id);
    toast.success('Çekiliş kapatıldı.');
    setGiveaways(prev => prev.map(x => x.id === g.id ? { ...x, status: 'closed' } : x));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    setCCode(Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
  };

  const createCoupon = async () => {
    if (!cCode.trim() || !cDiscount) { toast.error('Kod ve indirim zorunlu.'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'coupons', cCode.toUpperCase().trim()), {
        code: cCode.toUpperCase().trim(), discountType: cType,
        discountValue: Number(cDiscount), usageLimit: cLimit ? Number(cLimit) : null,
        usedCount: 0, category: cCategory || null,
        expiresAt: cExpiry ? new Date(cExpiry) : null,
        active: true, createdBy: user?.uid, createdAt: serverTimestamp(),
      });
      await logAction('coupon.create', cCode, { discountValue: cDiscount, type: cType });
      toast.success('Kupon oluşturuldu.'); setCDialog(false);
      setCCode(''); setCDiscount(''); setCLimit(''); setCCategory(''); setCExpiry('');
      load();
    } catch { toast.error('Oluşturma başarısız.'); } finally { setSaving(false); }
  };

  const deleteCoupon = async (c: any) => {
    if (!window.confirm(`"${c.code}" kuponunu silmek istiyor musunuz?`)) return;
    await deleteDoc(doc(db, 'coupons', c.id));
    await logAction('coupon.delete', c.id);
    toast.success('Kupon silindi.');
    setCoupons(prev => prev.filter(x => x.id !== c.id));
  };

  const toggleCoupon = async (c: any) => {
    await updateDoc(doc(db, 'coupons', c.id), { active: !c.active, updatedAt: serverTimestamp() });
    setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x));
    toast.success(c.active ? 'Kupon pasife alındı.' : 'Kupon aktif edildi.');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Kampanya & Çekiliş</h2></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <Tabs defaultValue="giveaways">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="giveaways">Çekilişler ({giveaways.length})</TabsTrigger>
          <TabsTrigger value="coupons">Kupon Kodları ({coupons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="giveaways" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={() => setGDialog(true)} disabled={!isAdmin}><Plus className="w-4 h-4 mr-1" />Yeni Çekiliş</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {giveaways.map(g => (
              <Card key={g.id} className="bg-[#1a1b23] border-white/10">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2"><Gift className="w-5 h-5 text-purple-400" /><h3 className="text-white font-semibold">{g.title}</h3></div>
                    <Badge variant="outline" className={g.status === 'active' ? 'border-emerald-500/20 text-emerald-400' : g.status === 'completed' ? 'border-blue-500/20 text-blue-400' : 'border-gray-500/20 text-gray-400'}>{g.status}</Badge>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-gray-400">🏆 Ödül: <span className="text-white">{g.prize}</span></p>
                    <p className="text-gray-400">👥 Katılımcı: <span className="text-white">{(g.participants || []).length}</span></p>
                    {g.winner && <p className="text-emerald-400">✓ Kazanan: {g.winner.slice(0, 12)}...</p>}
                    {g.endsAt?.toDate && <p className="text-gray-500 text-xs">Bitiş: {format(g.endsAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr })}</p>}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {g.status === 'active' && !g.winner && <Button size="sm" className="bg-purple-500/10 text-purple-400 border border-purple-500/20" onClick={() => pickWinner(g)}><Award className="w-3.5 h-3.5 mr-1" />Kazanan Seç</Button>}
                    {g.status === 'active' && <Button size="sm" variant="outline" className="border-gray-500/20 text-gray-400" onClick={() => closeGiveaway(g)}>Kapat</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
            {giveaways.length === 0 && <div className="col-span-2 text-center py-16 text-gray-400"><Gift className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Henüz çekiliş yok.</p></div>}
          </div>
        </TabsContent>

        <TabsContent value="coupons" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={() => setCDialog(true)} disabled={!isAdmin}><Plus className="w-4 h-4 mr-1" />Yeni Kupon</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(c => (
              <Card key={c.id} className={`bg-[#1a1b23] border-white/10 ${!c.active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-[#5b68f6] font-bold text-lg tracking-wider">{c.code}</code>
                    <Badge variant="outline" className={c.active ? 'border-emerald-500/20 text-emerald-400' : 'border-gray-500/20 text-gray-400'}>{c.active ? 'Aktif' : 'Pasif'}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400">İndirim: <span className="text-white font-medium">{c.discountType === 'percent' ? `%${c.discountValue}` : `${c.discountValue} ₺`}</span></p>
                    {c.usageLimit && <p className="text-gray-400">Limit: <span className="text-white">{c.usedCount || 0}/{c.usageLimit}</span></p>}
                    {c.category && <p className="text-gray-400">Kategori: <span className="text-white">{c.category}</span></p>}
                    {c.expiresAt?.toDate && <p className="text-gray-500 text-xs">Son kullanım: {format(c.expiresAt.toDate(), 'dd.MM.yyyy', { locale: tr })}</p>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 border-white/10 text-gray-400 hover:text-white text-xs" onClick={() => toggleCoupon(c)}>{c.active ? 'Pasife Al' : 'Aktif Et'}</Button>
                    <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 h-7 w-7 p-0" onClick={() => deleteCoupon(c)} disabled={!isAdmin}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {coupons.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400"><Percent className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Henüz kupon yok.</p></div>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={gDialog} onOpenChange={setGDialog}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white">
          <DialogHeader><DialogTitle>Yeni Çekiliş Oluştur</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-white text-sm">Başlık *</Label><Input value={gTitle} onChange={e => setGTitle(e.target.value)} placeholder="Çekiliş başlığı..." className="bg-[#111218] border-white/10 text-white" /></div>
            <div className="space-y-1.5"><Label className="text-white text-sm">Ödül *</Label><Input value={gPrize} onChange={e => setGPrize(e.target.value)} placeholder="100 TL hediye çeki, iPhone..." className="bg-[#111218] border-white/10 text-white" /></div>
            <div className="space-y-1.5"><Label className="text-white text-sm">Açıklama</Label><Textarea value={gDesc} onChange={e => setGDesc(e.target.value)} placeholder="Çekiliş detayları..." rows={3} className="bg-[#111218] border-white/10 text-white" /></div>
            <div className="space-y-1.5"><Label className="text-white text-sm">Bitiş Tarihi</Label><Input type="datetime-local" value={gEndsAt} onChange={e => setGEndsAt(e.target.value)} className="bg-[#111218] border-white/10 text-white" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGDialog(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={createGiveaway} disabled={saving || !gTitle.trim() || !gPrize.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">{saving ? 'Oluşturuluyor...' : 'Oluştur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cDialog} onOpenChange={setCDialog}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white">
          <DialogHeader><DialogTitle>Yeni Kupon Oluştur</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Kupon Kodu *</Label>
              <div className="flex gap-2">
                <Input value={cCode} onChange={e => setCCode(e.target.value.toUpperCase())} placeholder="SUMMER20" className="bg-[#111218] border-white/10 text-white uppercase" />
                <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white" onClick={generateCode}>Üret</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white text-sm">İndirim Türü</Label>
                <select value={cType} onChange={e => setCType(e.target.value)} className="w-full bg-[#111218] border border-white/10 rounded-md text-white px-3 py-2 text-sm">
                  <option value="percent">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (₺)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white text-sm">İndirim Değeri *</Label>
                <Input type="number" value={cDiscount} onChange={e => setCDiscount(e.target.value)} placeholder={cType === 'percent' ? '20' : '50'} className="bg-[#111218] border-white/10 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-white text-sm">Kullanım Limiti</Label><Input type="number" value={cLimit} onChange={e => setCLimit(e.target.value)} placeholder="Sınırsız" className="bg-[#111218] border-white/10 text-white" /></div>
              <div className="space-y-1.5"><Label className="text-white text-sm">Kategori</Label><Input value={cCategory} onChange={e => setCCategory(e.target.value)} placeholder="Tüm kategoriler" className="bg-[#111218] border-white/10 text-white" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-white text-sm">Son Kullanım Tarihi</Label><Input type="date" value={cExpiry} onChange={e => setCExpiry(e.target.value)} className="bg-[#111218] border-white/10 text-white" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCDialog(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={createCoupon} disabled={saving || !cCode.trim() || !cDiscount} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">{saving ? 'Oluşturuluyor...' : 'Oluştur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
