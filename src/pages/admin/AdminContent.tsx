import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, doc, updateDoc, serverTimestamp, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';
import { FileText, Plus, Trash2, Edit3, RefreshCw, Image, BookOpen, HelpCircle, Megaphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function AdminContent() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [banners, setBanners] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [bDialog, setBDialog] = useState(false);
  const [bTitle, setBTitle] = useState('');
  const [bImage, setBImage] = useState('');
  const [bLink, setBLink] = useState('');

  const [aDialog, setADialog] = useState(false);
  const [aTitle, setATitle] = useState('');
  const [aBody, setABody] = useState('');
  const [aType, setAType] = useState('info');

  const [fDialog, setFDialog] = useState(false);
  const [fQuestion, setFQuestion] = useState('');
  const [fAnswer, setFAnswer] = useState('');
  const [editTarget, setEditTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const safe = async (col: string) => {
      try { return (await getDocs(query(collection(db, col), limit(100)))).docs.map(d => ({ id: d.id, ...d.data() })); }
      catch { return []; }
    };
    const [b, a, f] = await Promise.all([safe('banners'), safe('announcements'), safe('faqs')]);
    setBanners(b); setAnnouncements(a); setFaqs(f);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const log = async (action: string, id: string) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'content', entityId: id, createdAt: serverTimestamp() });
  };

  const saveBanner = async () => {
    if (!bTitle.trim()) return;
    setSaving(true);
    const id = editTarget?.id || `banner_${Date.now()}`;
    try {
      await setDoc(doc(db, 'banners', id), { title: bTitle.trim(), imageUrl: bImage.trim(), link: bLink.trim(), active: true, createdBy: user?.uid, updatedAt: serverTimestamp() }, { merge: true });
      await log(editTarget ? 'banner.edit' : 'banner.add', id);
      toast.success('Banner kaydedildi.');
      setBDialog(false); setBTitle(''); setBImage(''); setBLink(''); setEditTarget(null);
      load();
    } finally { setSaving(false); }
  };

  const saveAnnouncement = async () => {
    if (!aTitle.trim() || !aBody.trim()) return;
    setSaving(true);
    const id = editTarget?.id || `ann_${Date.now()}`;
    try {
      await setDoc(doc(db, 'announcements', id), { title: aTitle.trim(), body: aBody.trim(), type: aType, active: true, createdBy: user?.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
      await log(editTarget ? 'announcement.edit' : 'announcement.add', id);
      toast.success('Duyuru kaydedildi.');
      setADialog(false); setATitle(''); setABody(''); setAType('info'); setEditTarget(null);
      load();
    } finally { setSaving(false); }
  };

  const saveFaq = async () => {
    if (!fQuestion.trim() || !fAnswer.trim()) return;
    setSaving(true);
    const id = editTarget?.id || `faq_${Date.now()}`;
    try {
      await setDoc(doc(db, 'faqs', id), { question: fQuestion.trim(), answer: fAnswer.trim(), active: true, sortOrder: faqs.length, updatedAt: serverTimestamp() }, { merge: true });
      await log(editTarget ? 'faq.edit' : 'faq.add', id);
      toast.success('SSS kaydedildi.');
      setFDialog(false); setFQuestion(''); setFAnswer(''); setEditTarget(null);
      load();
    } finally { setSaving(false); }
  };

  const toggleItem = async (colName: string, item: any, setter: any) => {
    await updateDoc(doc(db, colName, item.id), { active: !item.active, updatedAt: serverTimestamp() });
    setter((prev: any[]) => prev.map(x => x.id === item.id ? { ...x, active: !item.active } : x));
    toast.success(item.active ? 'Pasife alındı.' : 'Aktif edildi.');
  };

  const deleteItem = async (colName: string, id: string, setter: any) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    await deleteDoc(doc(db, colName, id));
    setter((prev: any[]) => prev.filter(x => x.id !== id));
    toast.success('Silindi.');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">İçerik Yönetimi</h2><p className="text-gray-400 text-sm mt-1">Banner, duyuru, SSS ve sözleşmeler</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <Tabs defaultValue="banners">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="banners"><Image className="w-3.5 h-3.5 mr-1.5" />Bannerlar ({banners.length})</TabsTrigger>
          <TabsTrigger value="announcements"><Megaphone className="w-3.5 h-3.5 mr-1.5" />Duyurular ({announcements.length})</TabsTrigger>
          <TabsTrigger value="faq"><HelpCircle className="w-3.5 h-3.5 mr-1.5" />SSS ({faqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={() => { setEditTarget(null); setBTitle(''); setBImage(''); setBLink(''); setBDialog(true); }} disabled={!isAdmin}><Plus className="w-4 h-4 mr-1" />Yeni Banner</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(b => (
              <Card key={b.id} className={`bg-[#1a1b23] border-white/10 ${!b.active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  {b.imageUrl && <img src={b.imageUrl} className="w-full h-32 object-cover rounded-lg mb-3" alt={b.title} />}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{b.title}</p>
                      {b.link && <p className="text-gray-500 text-xs mt-0.5 truncate">{b.link}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <Switch checked={b.active !== false} onCheckedChange={() => toggleItem('banners', b, setBanners)} disabled={!isAdmin} />
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-white/10 text-gray-400" onClick={() => { setEditTarget(b); setBTitle(b.title); setBImage(b.imageUrl || ''); setBLink(b.link || ''); setBDialog(true); }}><Edit3 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-red-500/20 text-red-400" onClick={() => deleteItem('banners', b.id, setBanners)} disabled={!isAdmin}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {banners.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400"><Image className="w-10 h-10 mx-auto mb-2 text-gray-600" /><p>Banner yok.</p></div>}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={() => { setEditTarget(null); setATitle(''); setABody(''); setAType('info'); setADialog(true); }} disabled={!isAdmin}><Plus className="w-4 h-4 mr-1" />Yeni Duyuru</Button>
          </div>
          <div className="space-y-3">
            {announcements.map(a => (
              <Card key={a.id} className={`bg-[#1a1b23] border-white/10 ${!a.active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={a.type === 'warning' ? 'border-amber-500/20 text-amber-400' : a.type === 'error' ? 'border-red-500/20 text-red-400' : a.type === 'success' ? 'border-emerald-500/20 text-emerald-400' : 'border-blue-500/20 text-blue-400'}>{a.type || 'info'}</Badge>
                        <p className="text-white font-medium">{a.title}</p>
                      </div>
                      <p className="text-gray-400 text-sm">{a.body?.slice(0, 120)}{a.body?.length > 120 ? '...' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch checked={a.active !== false} onCheckedChange={() => toggleItem('announcements', a, setAnnouncements)} disabled={!isAdmin} />
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-white/10 text-gray-400" onClick={() => { setEditTarget(a); setATitle(a.title); setABody(a.body); setAType(a.type || 'info'); setADialog(true); }}><Edit3 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-red-500/20 text-red-400" onClick={() => deleteItem('announcements', a.id, setAnnouncements)} disabled={!isAdmin}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {announcements.length === 0 && <div className="text-center py-12 text-gray-400"><Megaphone className="w-10 h-10 mx-auto mb-2 text-gray-600" /><p>Duyuru yok.</p></div>}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={() => { setEditTarget(null); setFQuestion(''); setFAnswer(''); setFDialog(true); }} disabled={!isAdmin}><Plus className="w-4 h-4 mr-1" />Yeni SSS</Button>
          </div>
          <div className="space-y-2">
            {faqs.map(f => (
              <Card key={f.id} className={`bg-[#1a1b23] border-white/10 ${!f.active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{f.question}</p>
                      <p className="text-gray-400 text-sm mt-1">{f.answer?.slice(0, 150)}{f.answer?.length > 150 ? '...' : ''}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Switch checked={f.active !== false} onCheckedChange={() => toggleItem('faqs', f, setFaqs)} disabled={!isAdmin} />
                      <Button size="sm" variant="outline" className="h-6 w-6 p-0 border-white/10 text-gray-400" onClick={() => { setEditTarget(f); setFQuestion(f.question); setFAnswer(f.answer); setFDialog(true); }}><Edit3 className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" className="h-6 w-6 p-0 border-red-500/20 text-red-400" onClick={() => deleteItem('faqs', f.id, setFaqs)} disabled={!isAdmin}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {faqs.length === 0 && <div className="text-center py-12 text-gray-400"><HelpCircle className="w-10 h-10 mx-auto mb-2 text-gray-600" /><p>SSS yok.</p></div>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={bDialog} onOpenChange={setBDialog}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white">
          <DialogHeader><DialogTitle>{editTarget ? 'Banner Düzenle' : 'Yeni Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-white text-sm">Başlık *</Label><Input value={bTitle} onChange={e => setBTitle(e.target.value)} className="bg-[#111218] border-white/10 text-white" /></div>
            <div className="space-y-1.5"><Label className="text-white text-sm">Görsel URL</Label><Input value={bImage} onChange={e => setBImage(e.target.value)} placeholder="https://..." className="bg-[#111218] border-white/10 text-white" /></div>
            <div className="space-y-1.5"><Label className="text-white text-sm">Bağlantı</Label><Input value={bLink} onChange={e => setBLink(e.target.value)} placeholder="/kampanya veya https://..." className="bg-[#111218] border-white/10 text-white" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBDialog(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={saveBanner} disabled={saving || !bTitle.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aDialog} onOpenChange={setADialog}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white">
          <DialogHeader><DialogTitle>{editTarget ? 'Duyuru Düzenle' : 'Yeni Duyuru'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-white text-sm">Başlık *</Label><Input value={aTitle} onChange={e => setATitle(e.target.value)} className="bg-[#111218] border-white/10 text-white" /></div>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Tür</Label>
              <select value={aType} onChange={e => setAType(e.target.value)} className="w-full bg-[#111218] border border-white/10 rounded-md text-white px-3 py-2 text-sm">
                <option value="info">Bilgi</option>
                <option value="warning">Uyarı</option>
                <option value="success">Başarı</option>
                <option value="error">Hata</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label className="text-white text-sm">İçerik *</Label><Textarea value={aBody} onChange={e => setABody(e.target.value)} rows={4} className="bg-[#111218] border-white/10 text-white" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setADialog(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={saveAnnouncement} disabled={saving || !aTitle.trim() || !aBody.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fDialog} onOpenChange={setFDialog}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white">
          <DialogHeader><DialogTitle>{editTarget ? 'SSS Düzenle' : 'Yeni SSS'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-white text-sm">Soru *</Label><Input value={fQuestion} onChange={e => setFQuestion(e.target.value)} className="bg-[#111218] border-white/10 text-white" /></div>
            <div className="space-y-1.5"><Label className="text-white text-sm">Cevap *</Label><Textarea value={fAnswer} onChange={e => setFAnswer(e.target.value)} rows={4} className="bg-[#111218] border-white/10 text-white" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFDialog(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={saveFaq} disabled={saving || !fQuestion.trim() || !fAnswer.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
