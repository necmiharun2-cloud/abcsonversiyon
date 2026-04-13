import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, doc, updateDoc, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import toast from 'react-hot-toast';
import { Shield, Flag, Hash, Activity, CheckCircle, XCircle, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminSecurity() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [reports, setReports] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const safe = async (col: string, max = 200) => {
      try { return (await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() })); }
      catch { return (await getDocs(query(collection(db, col), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() })); }
    };
    const [r, l] = await Promise.all([safe('reports', 100), safe('adminLogs', 200)]);
    setReports(r); setLogs(l);
    try {
      const snap = await getDocs(collection(db, 'siteSettings'));
      const settingsDoc = snap.docs.find(d => d.id === 'moderation');
      if (settingsDoc) setBannedWords(settingsDoc.data().bannedWords || []);
    } catch { /* no-op */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, id: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'security', entityId: id, details: details || {}, createdAt: serverTimestamp() });
  };

  const resolveReport = async (r: any, status: 'resolved' | 'dismissed') => {
    try {
      await updateDoc(doc(db, 'reports', r.id), { status, reviewedBy: user?.uid, reviewedAt: serverTimestamp() });
      await logAction(`report.${status}`, r.id);
      toast.success(`Rapor ${status === 'resolved' ? 'çözüldü' : 'reddedildi'}.`);
      setReports(prev => prev.map(x => x.id === r.id ? { ...x, status } : x));
    } catch { toast.error('İşlem başarısız.'); }
  };

  const saveBannedWords = async (words: string[]) => {
    try {
      await setDoc(doc(db, 'siteSettings', 'moderation'), { bannedWords: words, updatedAt: serverTimestamp() }, { merge: true });
      await logAction('security.bannedWords.update', 'settings', { count: words.length });
      toast.success('Yasaklı kelimeler kaydedildi.');
    } catch { toast.error('Kayıt başarısız.'); }
  };

  const addWord = async () => {
    const w = newWord.trim().toLowerCase();
    if (!w || bannedWords.includes(w)) { toast.error('Geçersiz veya zaten var.'); return; }
    const updated = [...bannedWords, w];
    setBannedWords(updated);
    await saveBannedWords(updated);
    setNewWord('');
  };

  const removeWord = async (word: string) => {
    const updated = bannedWords.filter(w => w !== word);
    setBannedWords(updated);
    await saveBannedWords(updated);
  };

  const pendingReports = reports.filter(r => r.status === 'pending' || !r.status);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Güvenlik & Moderasyon</h2>
          <p className="text-gray-400 text-sm mt-1">{pendingReports.length} bekleyen rapor</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="reports">
            Raporlar
            {pendingReports.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">{pendingReports.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="bannedwords">Yasaklı Kelimeler ({bannedWords.length})</TabsTrigger>
          <TabsTrigger value="logs">Admin Logları</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4 space-y-3">
          {loading ? <div className="flex justify-center py-16"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-[#5b68f6]" /></div> : (
            <>
              {pendingReports.length === 0 && reports.length === 0 && (
                <div className="text-center py-16 text-gray-400"><Flag className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Rapor bulunamadı.</p></div>
              )}
              {reports.map(r => (
                <Card key={r.id} className={`bg-[#1a1b23] border-white/10 ${!r.status || r.status === 'pending' ? 'border-l-2 border-l-red-500/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Flag className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span className="text-white font-medium">{r.reason || 'Neden belirtilmedi'}</span>
                          <Badge variant="outline" className={!r.status || r.status === 'pending' ? 'border-amber-500/20 text-amber-400' : r.status === 'resolved' ? 'border-emerald-500/20 text-emerald-400' : 'border-gray-500/20 text-gray-400'}>{r.status || 'pending'}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 space-x-2">
                          <span>Tür: {r.type || 'içerik'}</span>
                          <span>•</span>
                          <span>Raporlayan: {r.reporterId?.slice(0, 8) || '-'}</span>
                          <span>•</span>
                          <span>Hedef: {r.targetId?.slice(0, 8) || '-'}</span>
                          <span>•</span>
                          <span>{r.createdAt?.toDate?.() ? format(r.createdAt.toDate(), 'dd.MM.yy HH:mm', { locale: tr }) : '-'}</span>
                        </div>
                      </div>
                      {(!r.status || r.status === 'pending') && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 h-7 px-2" onClick={() => resolveReport(r, 'resolved')}><CheckCircle className="w-3 h-3 mr-1" />Çöz</Button>
                          <Button size="sm" variant="outline" className="border-gray-500/20 text-gray-400 h-7 px-2" onClick={() => resolveReport(r, 'dismissed')}><XCircle className="w-3 h-3 mr-1" />Reddet</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="bannedwords" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1b23] border-white/10">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Plus className="w-4 h-4 text-[#5b68f6]" />Kelime Ekle</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newWord}
                    onChange={e => setNewWord(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addWord()}
                    placeholder="Yasaklı kelime..."
                    className="bg-[#111218] border-white/10 text-white"
                    disabled={!isAdmin}
                  />
                  <Button onClick={addWord} disabled={!isAdmin || !newWord.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90 px-3">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {!isAdmin && <p className="text-xs text-gray-500">Sadece admin ekleyebilir.</p>}
                <p className="text-gray-500 text-xs">Bu kelimeler içeriklerde otomatik filtrelenir. Enter ile hızlı ekleme yapabilirsiniz.</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1b23] border-white/10">
              <CardHeader><CardTitle className="text-white">Mevcut Yasaklı Kelimeler ({bannedWords.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="flex flex-wrap gap-2">
                    {bannedWords.map(word => (
                      <div key={word} className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="text-red-400 text-sm">{word}</span>
                        <button onClick={() => removeWord(word)} disabled={!isAdmin} className="text-red-400 hover:text-red-300 ml-1 disabled:opacity-50">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {bannedWords.length === 0 && <p className="text-gray-500 text-sm w-full text-center py-8">Yasaklı kelime yok.</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-[#1a1b23] border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-400">Tarih</TableHead>
                  <TableHead className="text-gray-400">Rol</TableHead>
                  <TableHead className="text-gray-400">İşlem</TableHead>
                  <TableHead className="text-gray-400">Alan</TableHead>
                  <TableHead className="text-gray-400">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-gray-500 text-xs">{log.createdAt?.toDate?.() ? format(log.createdAt.toDate(), 'dd.MM.yy HH:mm:ss', { locale: tr }) : '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-[#5b68f6]/30 text-[#8b95ff]">{log.actorRole || 'admin'}</Badge>
                    </TableCell>
                    <TableCell className="text-white text-sm font-medium">{log.action}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{log.entity || '-'}</TableCell>
                    <TableCell className="text-gray-600 text-xs font-mono">{log.entityId?.slice(0, 12) || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {logs.length === 0 && <p className="text-center py-10 text-gray-400">Log bulunamadı.</p>}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
