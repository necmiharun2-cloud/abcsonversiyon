import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, limit, orderBy, query, doc, updateDoc, serverTimestamp, addDoc, runTransaction } from 'firebase/firestore';
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
import { Switch } from '../../components/ui/switch';
import toast from 'react-hot-toast';
import { Wallet, CheckCircle, XCircle, Plus, TrendingUp, CreditCard, DollarSign, RefreshCw, ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Beklemede: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Onaylandi: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Reddedildi: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return <Badge variant="outline" className={map[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>{status}</Badge>;
};

export default function AdminFinance() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isStaff = isAdmin || profile?.role === 'moderator' || profile?.role === 'finance';

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wdFilter, setWdFilter] = useState('all');
  const [txFilter, setTxFilter] = useState('all');

  const [manualOpen, setManualOpen] = useState(false);
  const [manualUserId, setManualUserId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const [commSettings, setCommSettings] = useState({ defaultRate: 10, categoryRates: {} as Record<string, number> });
  const [commCategory, setCommCategory] = useState('');
  const [commRate, setCommRate] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const safe = async (col: string, max = 300) => {
        try { return (await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() })); }
        catch { return (await getDocs(query(collection(db, col), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() })); }
      };
      const [wd, tx] = await Promise.all([safe('withdrawals', 200), safe('transactions', 300)]);
      setWithdrawals(wd);
      setTransactions(tx);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, entityId: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'finance', entityId, details: details || {}, createdAt: serverTimestamp() });
  };

  const updateWithdrawal = async (w: any, status: 'Onaylandi' | 'Reddedildi') => {
    const reason = status === 'Reddedildi' ? window.prompt('Red nedeni:') || '' : '';
    try {
      await updateDoc(doc(db, 'withdrawals', w.id), { status, rejectionReason: reason, processedBy: user?.uid, processedAt: serverTimestamp() });
      await logAction(`withdrawal.${status}`, w.id, { status, reason });
      toast.success('Çekim talebi güncellendi.');
      setWithdrawals(prev => prev.map(x => x.id === w.id ? { ...x, status } : x));
    } catch { toast.error('Güncelleme başarısız.'); }
  };

  const doManualAdjustment = async () => {
    const amount = Number(manualAmount);
    if (!manualUserId.trim() || !Number.isFinite(amount) || amount === 0) {
      toast.error('Geçerli kullanıcı ID ve tutar girin.'); return;
    }
    setProcessing(true);
    try {
      await runTransaction(db, async tx => {
        const userRef = doc(db, 'users', manualUserId.trim());
        const txRef = doc(collection(db, 'transactions'));
        const snap = await tx.get(userRef);
        if (!snap.exists()) throw new Error('Kullanıcı bulunamadı');
        const raw = snap.data() as any;
        const curr = typeof raw.balanceAvailableCents === 'number' ? raw.balanceAvailableCents : Math.round(Number(raw.balance || 0) * 100);
        const next = curr + Math.round(amount * 100);
        if (next < 0) throw new Error('Bakiye eksiye düşüyor');
        tx.update(userRef, { balanceAvailableCents: next, balance: next / 100, updatedAt: serverTimestamp() });
        tx.set(txRef, { userId: manualUserId.trim(), type: 'manual_adjustment', amount, fee: 0, status: 'completed', direction: amount >= 0 ? 'credit' : 'debit', reason: manualReason || 'Manuel düzeltme', createdAt: serverTimestamp(), actorId: user?.uid });
      });
      await logAction('finance.manualAdjustment', manualUserId.trim(), { amount, reason: manualReason });
      toast.success('Manuel işlem kaydedildi.');
      setManualOpen(false); setManualUserId(''); setManualAmount(''); setManualReason('');
      load();
    } catch (e: any) { toast.error(e?.message || 'İşlem başarısız.'); }
    finally { setProcessing(false); }
  };

  const stats = useMemo(() => ({
    pendingCount: withdrawals.filter(w => w.status === 'Beklemede').length,
    pendingAmount: withdrawals.filter(w => w.status === 'Beklemede').reduce((s, w) => s + Number(w.amount || 0), 0),
    approvedAmount: withdrawals.filter(w => w.status === 'Onaylandi').reduce((s, w) => s + Number(w.amount || 0), 0),
    totalTx: transactions.length,
    totalVolume: transactions.reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0),
    commission: transactions.filter(t => t.type === 'commission').reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0),
  }), [withdrawals, transactions]);

  const filteredWd = useMemo(() => wdFilter === 'all' ? withdrawals : withdrawals.filter(w => w.status === wdFilter), [withdrawals, wdFilter]);
  const filteredTx = useMemo(() => txFilter === 'all' ? transactions : transactions.filter(t => t.type === txFilter), [transactions, txFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Finans Paneli</h2><p className="text-gray-400 text-sm mt-1">Para hareketleri ve çekim talepleri</p></div>
        <div className="flex gap-2">
          <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={() => setManualOpen(true)}><Plus className="w-4 h-4 mr-1" />Manuel İşlem</Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Bekleyen Çekim', value: stats.pendingCount, sub: `${stats.pendingAmount.toFixed(2)} ₺`, icon: Wallet, color: 'text-amber-400' },
          { label: 'Onaylanan Çekim', value: `${stats.approvedAmount.toFixed(2)} ₺`, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Toplam İşlem', value: stats.totalTx, icon: CreditCard, color: 'text-blue-400' },
          { label: 'İşlem Hacmi', value: `${stats.totalVolume.toFixed(2)} ₺`, icon: TrendingUp, color: 'text-white' },
          { label: 'Komisyon', value: `${stats.commission.toFixed(2)} ₺`, icon: Percent, color: 'text-purple-400' },
        ].map(s => (
          <Card key={s.label} className="bg-[#1a1b23] border-white/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-gray-500 text-xs">{s.label}</span></div>
              <p className={`font-bold ${s.color}`}>{s.value}</p>
              {s.sub && <p className="text-gray-500 text-xs mt-0.5">{s.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="withdrawals">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="withdrawals">Çekim Talepleri{stats.pendingCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">{stats.pendingCount}</span>}</TabsTrigger>
          <TabsTrigger value="transactions">Tüm İşlemler</TabsTrigger>
          <TabsTrigger value="commission">Komisyon Ayarları</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Select value={wdFilter} onValueChange={setWdFilter}>
              <SelectTrigger className="w-40 bg-[#1a1b23] border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="Beklemede">Bekleyen</SelectItem>
                <SelectItem value="Onaylandi">Onaylanan</SelectItem>
                <SelectItem value="Reddedildi">Reddedilen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card className="bg-[#1a1b23] border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-400">Kullanıcı</TableHead>
                  <TableHead className="text-gray-400">Tutar</TableHead>
                  <TableHead className="text-gray-400">IBAN</TableHead>
                  <TableHead className="text-gray-400">Ad Soyad</TableHead>
                  <TableHead className="text-gray-400">Tarih</TableHead>
                  <TableHead className="text-gray-400">Durum</TableHead>
                  <TableHead className="text-gray-400 text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWd.map(w => (
                  <TableRow key={w.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white text-sm">{w.userId?.slice(0, 10) || '-'}</TableCell>
                    <TableCell className="text-white font-bold">{(Number(w.amount) || 0).toFixed(2)} ₺</TableCell>
                    <TableCell className="text-gray-400 text-sm font-mono">{w.iban ? w.iban.replace(/(.{4})/g, '$1 ').trim() : '-'}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{w.fullName || w.accountHolder || '-'}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{w.createdAt?.toDate?.() ? format(w.createdAt.toDate(), 'dd.MM.yy HH:mm', { locale: tr }) : '-'}</TableCell>
                    <TableCell><SBadge status={w.status} /></TableCell>
                    <TableCell className="text-right">
                      {w.status === 'Beklemede' && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 h-7 px-2" onClick={() => updateWithdrawal(w, 'Onaylandi')}><CheckCircle className="w-3 h-3 mr-1" />Onayla</Button>
                          <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 h-7 px-2" onClick={() => updateWithdrawal(w, 'Reddedildi')}><XCircle className="w-3 h-3 mr-1" />Reddet</Button>
                        </div>
                      )}
                      {w.status !== 'Beklemede' && <span className="text-gray-600 text-xs">İşlem tamamlandı</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredWd.length === 0 && <p className="text-center py-10 text-gray-400">Çekim talebi bulunamadı.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Select value={txFilter} onValueChange={setTxFilter}>
              <SelectTrigger className="w-48 bg-[#1a1b23] border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İşlem Türleri</SelectItem>
                <SelectItem value="purchase">Satın Alma</SelectItem>
                <SelectItem value="sale">Satış</SelectItem>
                <SelectItem value="commission">Komisyon</SelectItem>
                <SelectItem value="withdrawal">Çekim</SelectItem>
                <SelectItem value="topup">Bakiye Yükleme</SelectItem>
                <SelectItem value="manual_adjustment">Manuel Düzeltme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card className="bg-[#1a1b23] border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-400">Tarih</TableHead>
                  <TableHead className="text-gray-400">Kullanıcı</TableHead>
                  <TableHead className="text-gray-400">Tür</TableHead>
                  <TableHead className="text-gray-400">Yön</TableHead>
                  <TableHead className="text-gray-400">Tutar</TableHead>
                  <TableHead className="text-gray-400">Durum</TableHead>
                  <TableHead className="text-gray-400">Açıklama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTx.slice(0, 100).map(t => (
                  <TableRow key={t.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-gray-500 text-xs">{t.createdAt?.toDate?.() ? format(t.createdAt.toDate(), 'dd.MM.yy HH:mm', { locale: tr }) : '-'}</TableCell>
                    <TableCell className="text-white text-sm">{t.userId?.slice(0, 10) || '-'}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{t.type || '-'}</TableCell>
                    <TableCell>
                      {t.direction === 'credit' ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><ArrowUpRight className="w-3 h-3" />Gelen</span> : <span className="flex items-center gap-1 text-red-400 text-xs"><ArrowDownRight className="w-3 h-3" />Giden</span>}
                    </TableCell>
                    <TableCell className={`font-bold ${Number(t.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{Number(t.amount) >= 0 ? '+' : ''}{(Number(t.amount) || 0).toFixed(2)} ₺</TableCell>
                    <TableCell><SBadge status={t.status || 'completed'} /></TableCell>
                    <TableCell className="text-gray-500 text-xs max-w-[150px] truncate">{t.reason || t.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTx.length === 0 && <p className="text-center py-10 text-gray-400">İşlem bulunamadı.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1b23] border-white/10">
              <CardHeader><CardTitle className="text-white">Genel Komisyon Oranı</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Input type="number" value={commSettings.defaultRate} onChange={e => setCommSettings(p => ({ ...p, defaultRate: Number(e.target.value) }))} className="bg-[#111218] border-white/10 text-white w-24" min={0} max={100} />
                  <span className="text-gray-400">%</span>
                  <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" disabled={!isAdmin} onClick={async () => {
                    try {
                      const { setDoc } = await import('firebase/firestore');
                      await setDoc(doc(db, 'siteSettings', 'commission'), { defaultRate: commSettings.defaultRate, updatedAt: serverTimestamp() }, { merge: true });
                      await logAction('commission.updateDefault', 'settings', { rate: commSettings.defaultRate });
                      toast.success('Komisyon oranı kaydedildi.');
                    } catch { toast.error('Kayıt başarısız.'); }
                  }}>Kaydet</Button>
                </div>
                <p className="text-gray-500 text-sm">Varsayılan komisyon oranı tüm kategorilere uygulanır. Kategori bazlı oran varsa o kullanılır.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1b23] border-white/10">
              <CardHeader><CardTitle className="text-white">Kategori Bazlı Komisyon</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={commCategory} onChange={e => setCommCategory(e.target.value)} placeholder="Kategori adı..." className="bg-[#111218] border-white/10 text-white flex-1" />
                  <Input type="number" value={commRate} onChange={e => setCommRate(e.target.value)} placeholder="%" className="bg-[#111218] border-white/10 text-white w-20" />
                  <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" disabled={!isAdmin || !commCategory || !commRate} onClick={() => {
                    setCommSettings(p => ({ ...p, categoryRates: { ...p.categoryRates, [commCategory]: Number(commRate) } }));
                    setCommCategory(''); setCommRate('');
                    toast.success('Kategori oranı eklendi (kaydetmeyi unutmayın).');
                  }}><Plus className="w-4 h-4" /></Button>
                </div>
                <ScrollArea className="h-48">
                  {Object.entries(commSettings.categoryRates).map(([cat, rate]) => (
                    <div key={cat} className="flex items-center justify-between p-2.5 rounded bg-[#111218] border border-white/5 mb-1.5">
                      <span className="text-white text-sm">{cat}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold">%{rate}</span>
                        <button onClick={() => setCommSettings(p => { const r = { ...p.categoryRates }; delete r[cat]; return { ...p, categoryRates: r }; })} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                  {Object.keys(commSettings.categoryRates).length === 0 && <p className="text-gray-500 text-sm text-center py-4">Kategori oranı yok.</p>}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white">
          <DialogHeader><DialogTitle>Manuel Bakiye İşlemi</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Kullanıcı ID</Label>
              <Input value={manualUserId} onChange={e => setManualUserId(e.target.value)} placeholder="Firebase kullanıcı UID..." className="bg-[#111218] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Tutar (+ ekle, - düş)</Label>
              <Input type="number" value={manualAmount} onChange={e => setManualAmount(e.target.value)} placeholder="Örn: 50.00 veya -20.00" className="bg-[#111218] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Açıklama</Label>
              <Textarea value={manualReason} onChange={e => setManualReason(e.target.value)} placeholder="İşlem açıklaması..." rows={3} className="bg-[#111218] border-white/10 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualOpen(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={doManualAdjustment} disabled={processing || !manualUserId || !manualAmount} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">{processing ? 'İşleniyor...' : 'Kaydet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
