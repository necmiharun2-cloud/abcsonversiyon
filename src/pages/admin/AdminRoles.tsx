import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ScrollArea } from '../../components/ui/scroll-area';
import toast from 'react-hot-toast';
import { Shield, Users, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = [
  { id: 'admin', label: 'Super Admin', color: 'bg-red-500/10 text-red-400 border-red-500/20', desc: 'Tüm yetkiler, kritik ayarlar' },
  { id: 'moderator', label: 'Moderatör', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', desc: 'İlan moderasyon, kullanıcı yönetimi' },
  { id: 'support', label: 'Destek', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20', desc: 'Ticket sistemi, kullanıcı görüntüleme' },
  { id: 'finance', label: 'Finans', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', desc: 'Ödeme, çekim, bakiye işlemleri' },
  { id: 'content', label: 'İçerik Yöneticisi', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', desc: 'Banner, duyuru, SSS, kategori' },
  { id: 'user', label: 'Kullanıcı', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', desc: 'Sadece standart kullanıcı yetkileri' },
];

const PERMISSIONS: Record<string, string[]> = {
  admin: ['dashboard', 'users', 'roles', 'listings', 'orders', 'disputes', 'finance', 'support', 'stores', 'reviews', 'notifications', 'campaigns', 'content', 'categories', 'settings', 'security', 'analytics'],
  moderator: ['dashboard', 'users', 'listings', 'orders', 'disputes', 'support', 'stores', 'reviews', 'security'],
  support: ['dashboard', 'users', 'support', 'orders'],
  finance: ['dashboard', 'finance', 'orders', 'disputes'],
  content: ['dashboard', 'content', 'categories', 'notifications', 'campaigns'],
  user: [],
};

const ALL_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Kullanıcı Yönetimi' },
  { id: 'roles', label: 'Rol Yönetimi' },
  { id: 'listings', label: 'İlan Yönetimi' },
  { id: 'orders', label: 'Sipariş Yönetimi' },
  { id: 'disputes', label: 'Uyuşmazlık' },
  { id: 'finance', label: 'Finans Paneli' },
  { id: 'support', label: 'Destek Sistemi' },
  { id: 'stores', label: 'Mağaza Yönetimi' },
  { id: 'reviews', label: 'Yorumlar' },
  { id: 'notifications', label: 'Bildirimler' },
  { id: 'campaigns', label: 'Kampanyalar' },
  { id: 'content', label: 'İçerik' },
  { id: 'categories', label: 'Kategoriler' },
  { id: 'settings', label: 'Site Ayarları' },
  { id: 'security', label: 'Güvenlik' },
  { id: 'analytics', label: 'Analitik' },
];

export default function AdminRoles() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUid, setSearchUid] = useState('');
  const [assignRole, setAssignRole] = useState('moderator');
  const [assigning, setAssigning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), limit(500)));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStaffUsers(all.filter((u: any) => u.role && u.role !== 'user'));
    } catch { /* no-op */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const doAssign = async () => {
    if (!searchUid.trim()) { toast.error('Kullanıcı ID girin.'); return; }
    setAssigning(true);
    try {
      await updateDoc(doc(db, 'users', searchUid.trim()), { role: assignRole, updatedAt: serverTimestamp() });
      await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action: `role.assign.${assignRole}`, entity: 'users', entityId: searchUid.trim(), createdAt: serverTimestamp() });
      toast.success(`Rol atandı: ${assignRole}`);
      setSearchUid('');
      load();
    } catch { toast.error('Atama başarısız. UID doğru mu?'); }
    finally { setAssigning(false); }
  };

  const removeRole = async (u: any) => {
    if (!isAdmin) { toast.error('Sadece admin rol kaldırabilir.'); return; }
    await updateDoc(doc(db, 'users', u.id), { role: 'user', updatedAt: serverTimestamp() });
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action: 'role.remove', entity: 'users', entityId: u.id, createdAt: serverTimestamp() });
    toast.success('Rol kaldırıldı.');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Rol & Yetki Yönetimi</h2><p className="text-gray-400 text-sm mt-1">{staffUsers.length} yetkili kullanıcı</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[#1a1b23] border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Rol Ata</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-gray-400 text-xs">Kullanıcı Firebase UID</label>
                <Input value={searchUid} onChange={e => setSearchUid(e.target.value)} placeholder="Kullanıcı UID..." className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} />
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-400 text-xs">Rol</label>
                <select value={assignRole} onChange={e => setAssignRole(e.target.value)} className="w-full bg-[#111218] border border-white/10 rounded-md text-white px-3 py-2 text-sm" disabled={!isAdmin}>
                  {ROLES.filter(r => r.id !== 'user').map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <Button onClick={doAssign} disabled={assigning || !isAdmin || !searchUid.trim()} className="w-full bg-[#5b68f6] hover:bg-[#5b68f6]/90">
                <CheckCircle className="w-4 h-4 mr-1" />{assigning ? 'Atanıyor...' : 'Rol Ata'}
              </Button>
              {!isAdmin && <p className="text-xs text-gray-500 text-center">Sadece admin rol atayabilir.</p>}
            </CardContent>
          </Card>

          <Card className="bg-[#1a1b23] border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Rol Tanımları</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {ROLES.map(r => (
                <div key={r.id} className="p-3 rounded-lg bg-[#111218] border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs ${r.color}`}>{r.label}</Badge>
                  </div>
                  <p className="text-gray-500 text-xs">{r.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#1a1b23] border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Yetki Matrisi</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 p-2 min-w-[120px]">Sayfa / İşlem</th>
                      {ROLES.filter(r => r.id !== 'user').map(r => (
                        <th key={r.id} className="text-center p-2 min-w-[80px]">
                          <Badge variant="outline" className={`text-[10px] ${r.color}`}>{r.id}</Badge>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_PERMISSIONS.map(perm => (
                      <tr key={perm.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="text-gray-300 text-xs p-2">{perm.label}</td>
                        {ROLES.filter(r => r.id !== 'user').map(r => (
                          <td key={r.id} className="text-center p-2">
                            {PERMISSIONS[r.id]?.includes(perm.id) ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                            ) : (
                              <span className="text-gray-700 text-xs">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1b23] border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Yetkili Kullanıcılar ({staffUsers.length})</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center py-6"><div className="animate-spin w-5 h-5 rounded-full border-b-2 border-[#5b68f6]" /></div> : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-400">Kullanıcı</TableHead>
                      <TableHead className="text-gray-400">E-posta</TableHead>
                      <TableHead className="text-gray-400">Rol</TableHead>
                      <TableHead className="text-gray-400 text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffUsers.map(u => {
                      const roleInfo = ROLES.find(r => r.id === u.role);
                      return (
                        <TableRow key={u.id} className="border-white/10">
                          <TableCell className="text-white text-sm">{u.username || u.id.slice(0, 10)}</TableCell>
                          <TableCell className="text-gray-400 text-sm">{u.email || '-'}</TableCell>
                          <TableCell>
                            {roleInfo && <Badge variant="outline" className={`text-xs ${roleInfo.color}`}>{roleInfo.label}</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            {u.role !== 'admin' && isAdmin && (
                              <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-7 px-2 text-xs" onClick={() => removeRole(u)}>Rolü Kaldır</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
              {!loading && staffUsers.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">Yetkili kullanıcı yok.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
