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
import { MessageSquare, CheckCircle, Search, RefreshCw, Send, StickyNote, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const QUICK_REPLIES = [
  { label: 'Hoş geldiniz', text: 'Merhaba, destek talebinizi aldık. En kısa sürede yanıt vereceğiz.' },
  { label: 'Bilgi istendi', text: 'Talebinizi inceliyoruz. Ek bilgi gerekmesi halinde sizinle iletişime geçeceğiz.' },
  { label: 'Çözüldü', text: 'Sorununuz çözülmüştür. Başka bir konuda yardımcı olmamızı isterseniz lütfen tekrar yazın.' },
  { label: 'İnceleniyor', text: 'Talebiniz teknik ekibimize iletildi. 24-48 saat içinde geri dönüş yapılacaktır.' },
  { label: 'Ödeme konusu', text: 'Ödeme işlemlerinizle ilgili sorunlar için finans departmanımıza yönlendiriyoruz.' },
];

const PriorityBadge = ({ p }: { p: string }) => {
  const map: Record<string, string> = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    urgent: 'bg-red-600/20 text-red-300 border-red-600/30',
  };
  return <Badge variant="outline" className={map[(p||'').toLowerCase()] || map.low}>{p || 'Normal'}</Badge>;
};

export default function AdminSupport() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [replying, setReplying] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'), limit(300)));
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(query(collection(db, 'supportTickets'), limit(300)));
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, ticketId: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'supportTickets', entityId: ticketId, details: details || {}, createdAt: serverTimestamp() });
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setReplying(true);
    try {
      const replies = Array.isArray(selectedTicket.replies) ? selectedTicket.replies : [];
      const newReply = { text: replyText.trim(), authorId: user?.uid, authorRole: profile?.role, isAdmin: true, createdAt: new Date().toISOString() };
      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), { replies: [...replies, newReply], lastReplyAt: serverTimestamp(), status: 'pending_user' });
      await logAction('ticket.reply', selectedTicket.id);
      toast.success('Cevap gönderildi.');
      setReplyText('');
      setSelectedTicket((p: any) => ({ ...p, replies: [...replies, newReply], status: 'pending_user' }));
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, replies: [...replies, newReply], status: 'pending_user' } : t));
    } catch { toast.error('Gönderim başarısız.'); }
    finally { setReplying(false); }
  };

  const closeTicket = async (t: any) => {
    await updateDoc(doc(db, 'supportTickets', t.id), { status: 'closed', closedAt: serverTimestamp() });
    await logAction('ticket.close', t.id);
    toast.success('Ticket kapatıldı.');
    setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status: 'closed' } : x));
    if (selectedTicket?.id === t.id) setSelectedTicket((p: any) => ({ ...p, status: 'closed' }));
  };

  const addInternalNote = async () => {
    if (!selectedTicket || !internalNote.trim()) return;
    const notes = Array.isArray(selectedTicket.internalNotes) ? selectedTicket.internalNotes : [];
    const n = { note: internalNote.trim(), addedBy: user?.uid, addedAt: new Date().toISOString() };
    await updateDoc(doc(db, 'supportTickets', selectedTicket.id), { internalNotes: [...notes, n], updatedAt: serverTimestamp() });
    toast.success('İç not eklendi.');
    setInternalNote('');
    setSelectedTicket((p: any) => ({ ...p, internalNotes: [...notes, n] }));
  };

  const changePriority = async (t: any, priority: string) => {
    await updateDoc(doc(db, 'supportTickets', t.id), { priority, updatedAt: serverTimestamp() });
    toast.success('Öncelik güncellendi.');
    setTickets(prev => prev.map(x => x.id === t.id ? { ...x, priority } : x));
    if (selectedTicket?.id === t.id) setSelectedTicket((p: any) => ({ ...p, priority }));
  };

  const filtered = useMemo(() => {
    let r = tickets;
    if (search) r = r.filter(t => (t.subject || '').toLowerCase().includes(search.toLowerCase()) || (t.userId || '').includes(search));
    if (statusFilter !== 'all') r = r.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') r = r.filter(t => (t.priority || '').toLowerCase() === priorityFilter);
    return r;
  }, [tickets, search, statusFilter, priorityFilter]);

  const counts = useMemo(() => ({
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending_user').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    urgent: tickets.filter(t => (t.priority || '').toLowerCase() === 'urgent' && t.status !== 'closed').length,
  }), [tickets]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Destek Sistemi</h2><p className="text-gray-400 text-sm mt-1">{tickets.length} toplam ticket</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Açık', value: counts.open, color: 'text-amber-400', status: 'open' },
          { label: 'Yanıt Bekleniyor', value: counts.pending, color: 'text-blue-400', status: 'pending_user' },
          { label: 'Kapatıldı', value: counts.closed, color: 'text-gray-400', status: 'closed' },
          { label: 'Acil', value: counts.urgent, color: 'text-red-400', status: 'urgent' },
        ].map(s => (
          <Card key={s.label} className="bg-[#1a1b23] border-white/10 cursor-pointer hover:border-white/20" onClick={() => setStatusFilter(s.status !== 'urgent' ? s.status : 'open')}>
            <CardContent className="p-3 text-center">
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className={`font-bold text-2xl ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a1b23] border-white/10">
        <CardContent className="p-3 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ticket ara..." className="pl-9 bg-[#111218] border-white/10 text-white h-8" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-[#111218] border-white/10 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="open">Açık</SelectItem>
              <SelectItem value="pending_user">Yanıt Bekliyor</SelectItem>
              <SelectItem value="closed">Kapalı</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36 bg-[#111218] border-white/10 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öncelikler</SelectItem>
              <SelectItem value="urgent">Acil</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="low">Düşük</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1b23] border-white/10">
        {loading ? <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-[#5b68f6]" /></div> : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">#</TableHead>
                <TableHead className="text-gray-400">Konu</TableHead>
                <TableHead className="text-gray-400">Kullanıcı</TableHead>
                <TableHead className="text-gray-400">Kategori</TableHead>
                <TableHead className="text-gray-400">Öncelik</TableHead>
                <TableHead className="text-gray-400">Durum</TableHead>
                <TableHead className="text-gray-400">Tarih</TableHead>
                <TableHead className="text-gray-400 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t, i) => (
                <TableRow key={t.id} className="border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => { setSelectedTicket(t); setReplyText(''); setDetailOpen(true); }}>
                  <TableCell className="text-gray-600 text-xs">#{i + 1}</TableCell>
                  <TableCell className="text-white font-medium">{t.subject || 'Konu yok'}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{t.userId?.slice(0, 10) || '-'}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{t.category || '-'}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}><PriorityBadge p={t.priority} /></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={t.status === 'open' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : t.status === 'closed' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}>{t.status === 'open' ? 'Açık' : t.status === 'closed' ? 'Kapalı' : 'Yanıt Bekleniyor'}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">{t.createdAt?.toDate?.() ? format(t.createdAt.toDate(), 'dd.MM.yy HH:mm', { locale: tr }) : '-'}</TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    {t.status !== 'closed' && <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 h-7 px-2" onClick={() => closeTicket(t)}><CheckCircle className="w-3 h-3 mr-1" />Kapat</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && filtered.length === 0 && <p className="text-center py-10 text-gray-400">Ticket bulunamadı.</p>}
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ticket Detayı — {selectedTicket?.subject}</DialogTitle></DialogHeader>
          {selectedTicket && (
            <Tabs defaultValue="messages">
              <TabsList className="bg-[#111218] border border-white/10 w-full">
                <TabsTrigger value="messages" className="flex-1 text-xs">Mesajlar</TabsTrigger>
                <TabsTrigger value="reply" className="flex-1 text-xs">Cevap Ver</TabsTrigger>
                <TabsTrigger value="notes" className="flex-1 text-xs">İç Notlar</TabsTrigger>
                <TabsTrigger value="info" className="flex-1 text-xs">Bilgiler</TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="mt-3">
                <div className="p-3 rounded-lg bg-[#111218] border border-white/10 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Kullanıcı Mesajı</p>
                  <p className="text-white text-sm">{selectedTicket.description || selectedTicket.message || 'Mesaj yok'}</p>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {(selectedTicket.replies || []).map((r: any, i: number) => (
                      <div key={i} className={`p-3 rounded-lg border ${r.isAdmin ? 'bg-[#5b68f6]/10 border-[#5b68f6]/20 ml-4' : 'bg-[#111218] border-white/10 mr-4'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${r.isAdmin ? 'text-[#8b95ff]' : 'text-gray-400'}`}>{r.isAdmin ? `Admin (${r.authorRole})` : 'Kullanıcı'}</span>
                          <span className="text-gray-600 text-xs">{r.createdAt ? format(new Date(r.createdAt), 'dd.MM HH:mm', { locale: tr }) : '-'}</span>
                        </div>
                        <p className="text-white text-sm">{r.text}</p>
                      </div>
                    ))}
                    {(!selectedTicket.replies || selectedTicket.replies.length === 0) && <p className="text-gray-500 text-sm text-center py-4">Henüz yanıt yok.</p>}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="reply" className="mt-3 space-y-3">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Hızlı Cevaplar</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.map(qr => (
                      <Button key={qr.label} size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white text-xs h-7" onClick={() => setReplyText(qr.text)}>{qr.label}</Button>
                    ))}
                  </div>
                </div>
                <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Cevabınızı yazın..." rows={5} className="bg-[#111218] border-white/10 text-white" />
                <div className="flex gap-2">
                  <Button onClick={sendReply} disabled={replying || !replyText.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90"><Send className="w-3.5 h-3.5 mr-1" />{replying ? 'Gönderiliyor...' : 'Gönder'}</Button>
                  {selectedTicket.status !== 'closed' && <Button variant="outline" className="border-emerald-500/20 text-emerald-400" onClick={() => closeTicket(selectedTicket)}><CheckCircle className="w-3.5 h-3.5 mr-1" />Kapat</Button>}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-3 space-y-3">
                <Textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} placeholder="İç not (kullanıcı göremez)..." rows={3} className="bg-[#111218] border-white/10 text-white" />
                <Button size="sm" onClick={addInternalNote} disabled={!internalNote.trim()} className="bg-amber-500/20 text-amber-400 border border-amber-500/30"><StickyNote className="w-3.5 h-3.5 mr-1" />Not Ekle</Button>
                <ScrollArea className="h-48">
                  {(selectedTicket.internalNotes || []).map((n: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-1.5">
                      <p className="text-white text-sm">{n.note}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{n.addedBy?.slice(0, 8)} • {n.addedAt ? format(new Date(n.addedAt), 'dd.MM HH:mm', { locale: tr }) : ''}</p>
                    </div>
                  ))}
                  {(!selectedTicket.internalNotes || selectedTicket.internalNotes.length === 0) && <p className="text-gray-500 text-sm text-center py-4">İç not yok.</p>}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="info" className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Ticket ID', selectedTicket.id.slice(0, 16)],
                    ['Kullanıcı', selectedTicket.userId?.slice(0, 12) || '-'],
                    ['Kategori', selectedTicket.category || '-'],
                    ['Durum', selectedTicket.status || '-'],
                    ['Tarih', selectedTicket.createdAt?.toDate?.() ? format(selectedTicket.createdAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-'],
                    ['Yanıt Sayısı', (selectedTicket.replies || []).length],
                  ].map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-lg bg-[#111218] border border-white/5">
                      <p className="text-gray-500 text-xs mb-0.5">{k}</p>
                      <p className="text-white text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-sm">Öncelik Değiştir</Label>
                  <Select value={selectedTicket.priority || 'medium'} onValueChange={v => changePriority(selectedTicket, v)}>
                    <SelectTrigger className="bg-[#111218] border-white/10 w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Acil</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)} className="border-white/10 text-white">Kapat</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
