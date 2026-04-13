import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import toast from 'react-hot-toast';
import { Gavel, CheckCircle, XCircle, RefreshCw, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SBadge = ({ s }: { s: string }) => {
  const m: Record<string, string> = {
    open: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    in_review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    awaiting_evidence: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  const labels: Record<string, string> = { open: 'Açık', in_review: 'İncelemede', resolved: 'Çözüldü', rejected: 'Reddedildi', awaiting_evidence: 'Delil Bekleniyor' };
  return <Badge variant="outline" className={m[(s||'').toLowerCase()] || m.open}>{labels[(s||'').toLowerCase()] || s}</Badge>;
};

export default function AdminDisputes() {
  const { user, profile } = useAuth();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [decision, setDecision] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'disputes'), orderBy('createdAt', 'desc'), limit(200)));
      setDisputes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(query(collection(db, 'disputes'), limit(200)));
      setDisputes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, id: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'disputes', entityId: id, details: details || {}, createdAt: serverTimestamp() });
  };

  const updateStatus = async (d: any, status: string) => {
    await updateDoc(doc(db, 'disputes', d.id), { status, updatedAt: serverTimestamp(), reviewedBy: user?.uid });
    await logAction(`dispute.${status}`, d.id, { status });
    toast.success('Uyuşmazlık durumu güncellendi.');
    setDisputes(prev => prev.map(x => x.id === d.id ? { ...x, status } : x));
    if (selected?.id === d.id) setSelected((p: any) => ({ ...p, status }));
  };

  const resolveDispute = async (favor: 'buyer' | 'seller' | 'partial') => {
    if (!selected || !decisionNote.trim()) { toast.error('Karar notu zorunludur.'); return; }
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'disputes', selected.id), {
        status: 'resolved', decision: favor, decisionNote, resolvedBy: user?.uid, resolvedAt: serverTimestamp(),
      });
      if (selected.orderId) {
        await updateDoc(doc(db, 'orders', selected.orderId), {
          status: favor === 'buyer' ? 'refunded' : 'completed', disputeResolved: true, updatedAt: serverTimestamp(),
        });
      }
      await logAction('dispute.resolve', selected.id, { favor, decisionNote });
      toast.success('Uyuşmazlık çözüldü.');
      setDisputes(prev => prev.map(x => x.id === selected.id ? { ...x, status: 'resolved', decision: favor } : x));
      setSelected((p: any) => ({ ...p, status: 'resolved', decision: favor }));
      setDecisionNote(''); setDecision('');
    } catch { toast.error('İşlem başarısız.'); }
    finally { setProcessing(false); }
  };

  const filtered = statusFilter === 'all' ? disputes : disputes.filter(d => d.status === statusFilter);
  const counts = { open: disputes.filter(d => d.status === 'open').length, in_review: disputes.filter(d => d.status === 'in_review').length, resolved: disputes.filter(d => d.status === 'resolved').length };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Uyuşmazlık Yönetimi</h2><p className="text-gray-400 text-sm mt-1">{disputes.length} uyuşmazlık</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Açık', value: counts.open, c: 'text-amber-400' }, { label: 'İncelemede', value: counts.in_review, c: 'text-blue-400' }, { label: 'Çözüldü', value: counts.resolved, c: 'text-emerald-400' }].map(s => (
          <Card key={s.label} className="bg-[#1a1b23] border-white/10">
            <CardContent className="p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`font-bold text-2xl ${s.c}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-[#1a1b23] border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="open">Açık</SelectItem>
            <SelectItem value="in_review">İncelemede</SelectItem>
            <SelectItem value="awaiting_evidence">Delil Bekleniyor</SelectItem>
            <SelectItem value="resolved">Çözüldü</SelectItem>
            <SelectItem value="rejected">Reddedildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? <div className="flex justify-center py-16"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-[#5b68f6]" /></div> :
          filtered.map(d => (
            <Card key={d.id} className={`bg-[#1a1b23] border-white/10 cursor-pointer hover:border-white/20 ${d.status === 'open' ? 'border-l-2 border-l-amber-500/50' : ''}`} onClick={() => { setSelected(d); setDetailOpen(true); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Gavel className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <h3 className="text-white font-medium truncate">{d.reason || d.subject || 'Uyuşmazlık'}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                      <span>Alıcı: {d.buyerId?.slice(0, 8) || '-'}</span>
                      <span>•</span>
                      <span>Satıcı: {d.sellerId?.slice(0, 8) || '-'}</span>
                      {d.amount && <><span>•</span><span className="text-white font-medium">{Number(d.amount).toFixed(2)} ₺</span></>}
                    </div>
                    {d.decision && <p className="text-xs mt-1 text-emerald-400">Karar: {d.decision === 'buyer' ? '🛒 Alıcı lehine' : d.decision === 'seller' ? '🏪 Satıcı lehine' : '⚖️ Kısmi çözüm'}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <SBadge s={d.status || 'open'} />
                    <span className="text-gray-600 text-xs">{d.createdAt?.toDate?.() ? format(d.createdAt.toDate(), 'dd.MM.yy', { locale: tr }) : '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        }
        {!loading && filtered.length === 0 && <div className="text-center py-16 text-gray-400"><Gavel className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Uyuşmazlık bulunamadı.</p></div>}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Uyuşmazlık Detayı</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['ID', selected.id.slice(0, 14) + '...'],
                  ['Durum', selected.status],
                  ['Alıcı', selected.buyerId?.slice(0, 12) || '-'],
                  ['Satıcı', selected.sellerId?.slice(0, 12) || '-'],
                  ['Sipariş', selected.orderId?.slice(0, 12) || '-'],
                  ['Tutar', selected.amount ? `${Number(selected.amount).toFixed(2)} ₺` : '-'],
                  ['Tarih', selected.createdAt?.toDate?.() ? format(selected.createdAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-'],
                ].map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-lg bg-[#111218] border border-white/5">
                    <p className="text-gray-500 text-xs mb-0.5">{k}</p>
                    <p className="text-white">{v}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-[#111218] border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Uyuşmazlık Nedeni</p>
                <p className="text-white text-sm">{selected.description || selected.reason || '-'}</p>
              </div>

              {selected.status !== 'resolved' && (
                <div className="space-y-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-white font-medium">Admin Kararı</p>
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Karar Notu (zorunlu)</Label>
                    <Textarea value={decisionNote} onChange={e => setDecisionNote(e.target.value)} placeholder="Kararınızın gerekçesini yazın..." rows={3} className="bg-[#111218] border-white/10 text-white" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={processing || !decisionNote.trim()} className="bg-blue-500/10 text-blue-400 border border-blue-500/20" onClick={() => resolveDispute('buyer')}><User className="w-3.5 h-3.5 mr-1" />Alıcı Lehine</Button>
                    <Button disabled={processing || !decisionNote.trim()} className="bg-purple-500/10 text-purple-400 border border-purple-500/20" onClick={() => resolveDispute('seller')}><User className="w-3.5 h-3.5 mr-1" />Satıcı Lehine</Button>
                    <Button disabled={processing || !decisionNote.trim()} className="bg-amber-500/10 text-amber-400 border border-amber-500/20" onClick={() => resolveDispute('partial')}>Kısmi Çözüm</Button>
                    <Button disabled={processing} variant="outline" className="border-white/10 text-gray-400" onClick={() => updateStatus(selected, 'awaiting_evidence')}>Delil İste</Button>
                  </div>
                </div>
              )}

              {selected.status === 'resolved' && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 font-medium">✓ Çözüldü</p>
                  <p className="text-white text-sm mt-1">Karar: {selected.decision === 'buyer' ? 'Alıcı lehine' : selected.decision === 'seller' ? 'Satıcı lehine' : 'Kısmi çözüm'}</p>
                  {selected.decisionNote && <p className="text-gray-400 text-sm mt-1">{selected.decisionNote}</p>}
                </div>
              )}

              <div className="flex gap-2">
                {selected.status === 'open' && <Button size="sm" className="bg-blue-500/10 text-blue-400 border border-blue-500/20" onClick={() => updateStatus(selected, 'in_review')}>İncelemeye Al</Button>}
                {selected.status !== 'rejected' && selected.status !== 'resolved' && <Button size="sm" variant="outline" className="border-red-500/20 text-red-400" onClick={() => updateStatus(selected, 'rejected')}>Reddet</Button>}
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)} className="border-white/10 text-white">Kapat</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
