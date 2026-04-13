import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, limit, orderBy, query, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import toast from 'react-hot-toast';
import {
  Users, Search, Ban, CheckCircle, Eye, UserCheck, Filter,
  AlertTriangle, Shield, CreditCard, ShoppingBag, Star, StickyNote,
  Mail, Phone, Calendar, Activity, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    banned: 'bg-red-500/10 text-red-400 border-red-500/20',
    frozen: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const norm = (status || 'active').toLowerCase();
  return <Badge variant="outline" className={map[norm] || map.active}>{status}</Badge>;
};

const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    moderator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    support: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    finance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    user: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return <Badge variant="outline" className={map[role] || map.user}>{role || 'user'}</Badge>;
};

export default function AdminUsers() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isStaff = isAdmin || profile?.role === 'moderator';

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ search: '', role: 'all', status: 'all', kyc: 'all', hasStore: 'all' });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(500)));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(query(collection(db, 'users'), limit(500)));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const updateUser = async (u: any, patch: any, action: string) => {
    try {
      await updateDoc(doc(db, 'users', u.id), { ...patch, updatedAt: serverTimestamp() });
      await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'users', entityId: u.id, details: patch, createdAt: serverTimestamp() });
      toast.success('Kullanıcı güncellendi.');
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...patch } : x));
      if (selectedUser?.id === u.id) setSelectedUser((p: any) => ({ ...p, ...patch }));
    } catch { toast.error('Güncelleme başarısız.'); }
  };

  const addNote = async () => {
    if (!selectedUser || !noteText.trim()) return;
    setAddingNote(true);
    const notes = Array.isArray(selectedUser.adminNotes) ? selectedUser.adminNotes : [];
    const n = { note: noteText.trim(), addedBy: user?.uid, addedAt: new Date().toISOString() };
    await updateUser(selectedUser, { adminNotes: [...notes, n] }, 'user.addNote');
    setNoteText('');
    setAddingNote(false);
  };

  const openDetail = async (u: any) => {
    setSelectedUser(u);
    setDetailOpen(true);
    try {
      const [oSnap, tSnap] = await Promise.all([
        getDocs(query(collection(db, 'orders'), limit(20))),
        getDocs(query(collection(db, 'transactions'), limit(30))),
      ]);
      setUserOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((o: any) => o.buyerId === u.id || o.sellerId === u.id));
      setUserTransactions(tSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((t: any) => t.userId === u.id));
    } catch { /* no-op */ }
  };

  const filtered = useMemo(() => {
    let r = users;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      r = r.filter(u => (u.username || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s) || u.id.toLowerCase().includes(s));
    }
    if (filters.role !== 'all') r = r.filter(u => u.role === filters.role);
    if (filters.status !== 'all') r = r.filter(u => (u.accountStatus || 'active') === filters.status);
    if (filters.kyc !== 'all') r = r.filter(u => (u.kycStatus || 'none') === filters.kyc);
    if (filters.hasStore !== 'all') r = r.filter(u => String(!!u.hasStore) === filters.hasStore);
    return r;
  }, [users, filters]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h2>
          <p className="text-gray-400 text-sm mt-1">{users.length} toplam kullanıcı</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="border-white/10 text-white hover:bg-white/5">
          <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />Yenile
        </Button>
      </div>

      <Card className="bg-[#1a1b23] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="Kullanıcı ara (ad, e-posta, ID)..." className="pl-9 bg-[#111218] border-white/10 text-white" />
            </div>
            <Select value={filters.role} onValueChange={v => setFilters(p => ({ ...p, role: v }))}>
              <SelectTrigger className="w-[130px] bg-[#111218] border-white/10"><SelectValue placeholder="Rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderatör</SelectItem>
                <SelectItem value="support">Destek</SelectItem>
                <SelectItem value="finance">Finans</SelectItem>
                <SelectItem value="user">Kullanıcı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={v => setFilters(p => ({ ...p, status: v }))}>
              <SelectTrigger className="w-[130px] bg-[#111218] border-white/10"><SelectValue placeholder="Durum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="frozen">Dondurulmuş</SelectItem>
                <SelectItem value="banned">Banlı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.kyc} onValueChange={v => setFilters(p => ({ ...p, kyc: v }))}>
              <SelectTrigger className="w-[130px] bg-[#111218] border-white/10"><SelectValue placeholder="KYC" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm KYC</SelectItem>
                <SelectItem value="verified">Doğrulandı</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
                <SelectItem value="none">Yapılmadı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.hasStore} onValueChange={v => setFilters(p => ({ ...p, hasStore: v }))}>
              <SelectTrigger className="w-[140px] bg-[#111218] border-white/10"><SelectValue placeholder="Mağaza" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm</SelectItem>
                <SelectItem value="true">Mağaza Sahibi</SelectItem>
                <SelectItem value="false">Mağazasız</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-gray-500 mt-2">{filtered.length} sonuç gösteriliyor</p>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1b23] border-white/10">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-[#5b68f6]" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Kullanıcı</TableHead>
                <TableHead className="text-gray-400">E-posta</TableHead>
                <TableHead className="text-gray-400">Rol</TableHead>
                <TableHead className="text-gray-400">Durum</TableHead>
                <TableHead className="text-gray-400">KYC</TableHead>
                <TableHead className="text-gray-400">Bakiye</TableHead>
                <TableHead className="text-gray-400">Kayıt</TableHead>
                <TableHead className="text-gray-400 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b68f6] to-[#8b35ef] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(u.username || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{u.username || 'İsimsiz'}</p>
                        <p className="text-gray-600 text-xs">{u.id.slice(0, 10)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">{u.email || '-'}</TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell><StatusBadge status={u.accountStatus || 'active'} /></TableCell>
                  <TableCell><StatusBadge status={u.kycStatus || 'none'} /></TableCell>
                  <TableCell className="text-white font-medium text-sm">{(Number(u.balance) || 0).toFixed(2)} ₺</TableCell>
                  <TableCell className="text-gray-500 text-xs">{u.createdAt?.toDate?.() ? format(u.createdAt.toDate(), 'dd.MM.yy', { locale: tr }) : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white h-7 w-7 p-0" onClick={() => openDetail(u)}><Eye className="w-3.5 h-3.5" /></Button>
                      {u.accountStatus !== 'banned' ? (
                        <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-7 w-7 p-0" onClick={() => updateUser(u, { accountStatus: 'banned' }, 'user.ban')}><Ban className="w-3.5 h-3.5" /></Button>
                      ) : (
                        <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 h-7 w-7 p-0" onClick={() => updateUser(u, { accountStatus: 'active' }, 'user.unban')}><CheckCircle className="w-3.5 h-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && filtered.length === 0 && <p className="text-center py-10 text-gray-400">Kullanıcı bulunamadı.</p>}
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayı</DialogTitle>
            <DialogDescription className="text-gray-400">Tüm bilgileri görüntüle ve yönet</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="bg-[#111218] border border-white/10 mb-4 w-full">
                <TabsTrigger value="profile" className="flex-1 text-xs">Profil</TabsTrigger>
                <TabsTrigger value="actions" className="flex-1 text-xs">İşlemler</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1 text-xs">Siparişler</TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1 text-xs">İşlem Geçmişi</TabsTrigger>
                <TabsTrigger value="notes" className="flex-1 text-xs">Admin Notları</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5b68f6] to-[#8b35ef] flex items-center justify-center text-2xl font-bold">
                    {(selectedUser.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.username || 'İsimsiz'}</h3>
                    <div className="flex gap-2 mt-1">
                      <RoleBadge role={selectedUser.role} />
                      <StatusBadge status={selectedUser.accountStatus || 'active'} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Mail, label: 'E-posta', value: selectedUser.email },
                    { icon: Phone, label: 'Telefon', value: selectedUser.phone || '-' },
                    { icon: CreditCard, label: 'Bakiye', value: `${(Number(selectedUser.balance) || 0).toFixed(2)} ₺` },
                    { icon: Shield, label: 'KYC Durumu', value: selectedUser.kycStatus || 'none' },
                    { icon: Calendar, label: 'Kayıt Tarihi', value: selectedUser.createdAt?.toDate?.() ? format(selectedUser.createdAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-' },
                    { icon: Activity, label: 'Son Giriş', value: selectedUser.lastLogin?.toDate?.() ? format(selectedUser.lastLogin.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-3 rounded-lg bg-[#111218] border border-white/5">
                      <div className="flex items-center gap-2 mb-1"><Icon className="w-3.5 h-3.5 text-gray-500" /><span className="text-xs text-gray-500">{label}</span></div>
                      <p className="text-white text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                {Array.isArray(selectedUser.adminNotes) && selectedUser.adminNotes.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400 font-medium mb-1">⚠ Admin Riski</p>
                    <p className="text-xs text-gray-300">{selectedUser.adminNotes[selectedUser.adminNotes.length - 1]?.note}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-white">Hesap Durumu</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => updateUser(selectedUser, { accountStatus: 'active' }, 'user.activate')}>Aktif Et</Button>
                    <Button size="sm" className="bg-blue-500/10 text-blue-400 border border-blue-500/20" onClick={() => updateUser(selectedUser, { accountStatus: 'frozen' }, 'user.freeze')}>Dondur</Button>
                    <Button size="sm" className="bg-red-500/10 text-red-400 border border-red-500/20" onClick={() => updateUser(selectedUser, { accountStatus: 'banned' }, 'user.ban')}>Banla</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-white">Rol Atama {!isAdmin && <span className="text-gray-500 text-xs">(Sadece admin)</span>}</Label>
                  <div className="flex flex-wrap gap-2">
                    {['admin', 'moderator', 'support', 'finance', 'user'].map(r => (
                      <Button key={r} size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white capitalize" disabled={!isAdmin} onClick={() => updateUser(selectedUser, { role: r }, `user.roleTo.${r}`)}>{r}</Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-white">E-posta Doğrulama</Label>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => updateUser(selectedUser, { emailVerified: true }, 'user.verifyEmail')}>E-postayı Doğrula</Button>
                    <Button size="sm" className="bg-blue-500/10 text-blue-400 border border-blue-500/20" onClick={() => updateUser(selectedUser, { kycStatus: 'verified', isVerifiedSeller: true }, 'user.verifyKyc')}>KYC Onayla</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <ScrollArea className="h-[300px]">
                  {userOrders.length === 0 ? <p className="text-center py-8 text-gray-400 text-sm">Sipariş yok.</p> : (
                    <div className="space-y-2">
                      {userOrders.map(o => (
                        <div key={o.id} className="p-3 rounded-lg bg-[#111218] border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-mono">{o.id.slice(0, 12)}...</p>
                            <p className="text-gray-400 text-xs">{o.buyerId === selectedUser.id ? '🛒 Alıcı' : '🏪 Satıcı'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">{(Number(o.amount || o.total) || 0).toFixed(2)} ₺</p>
                            <StatusBadge status={o.status || 'pending'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="transactions">
                <ScrollArea className="h-[300px]">
                  {userTransactions.length === 0 ? <p className="text-center py-8 text-gray-400 text-sm">İşlem yok.</p> : (
                    <div className="space-y-2">
                      {userTransactions.map(t => (
                        <div key={t.id} className="p-3 rounded-lg bg-[#111218] border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{t.type || 'işlem'}</p>
                            <p className="text-gray-500 text-xs">{t.createdAt?.toDate?.() ? format(t.createdAt.toDate(), 'dd.MM.yy HH:mm', { locale: tr }) : '-'}</p>
                          </div>
                          <p className={`font-bold ${Number(t.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{Number(t.amount) >= 0 ? '+' : ''}{(Number(t.amount) || 0).toFixed(2)} ₺</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Not Ekle</Label>
                  <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Admin notu yazın..." rows={3} className="bg-[#111218] border-white/10 text-white" />
                  <Button onClick={addNote} disabled={addingNote || !noteText.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90 text-sm"><StickyNote className="w-3.5 h-3.5 mr-1" />Not Ekle</Button>
                </div>
                <ScrollArea className="h-[220px]">
                  <div className="space-y-2">
                    {(selectedUser.adminNotes || []).slice().reverse().map((n: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-[#111218] border border-white/5">
                        <p className="text-white text-sm">{n.note}</p>
                        <p className="text-gray-600 text-xs mt-1">{n.addedBy?.slice(0, 8)} • {n.addedAt ? format(new Date(n.addedAt), 'dd.MM.yy HH:mm', { locale: tr }) : '-'}</p>
                      </div>
                    ))}
                    {(!selectedUser.adminNotes || selectedUser.adminNotes.length === 0) && <p className="text-center py-4 text-gray-400 text-sm">Not yok.</p>}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)} className="border-white/10 text-white hover:bg-white/5">Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
