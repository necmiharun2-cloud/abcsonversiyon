import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, doc, updateDoc, serverTimestamp, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ScrollArea } from '../../components/ui/scroll-area';
import toast from 'react-hot-toast';
import { Tag, Plus, Trash2, Edit3, RefreshCw, Layers, ChevronRight, Percent } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminCategories() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newParent, setNewParent] = useState('');
  const [newCommission, setNewCommission] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editCommission, setEditCommission] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'categories'), limit(200)));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, id: string, details?: any) => {
    await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action, entity: 'categories', entityId: id, details: details || {}, createdAt: serverTimestamp() });
  };

  const slugify = (text: string) => text.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const addCategory = async () => {
    if (!newName.trim()) { toast.error('Kategori adı zorunlu.'); return; }
    setSaving(true);
    const slug = newSlug.trim() || slugify(newName.trim());
    const id = `${Date.now()}`;
    try {
      await setDoc(doc(db, 'categories', id), {
        name: newName.trim(), slug, parentId: newParent || null,
        commissionRate: newCommission ? Number(newCommission) : null,
        active: true, sortOrder: categories.length, createdAt: serverTimestamp(),
      });
      await logAction('category.add', id, { name: newName });
      toast.success('Kategori eklendi.');
      setNewName(''); setNewSlug(''); setNewParent(''); setNewCommission('');
      load();
    } catch { toast.error('Ekleme başarısız.'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (cat: any) => {
    await updateDoc(doc(db, 'categories', cat.id), { active: !cat.active, updatedAt: serverTimestamp() });
    await logAction('category.toggle', cat.id, { active: !cat.active });
    toast.success(`Kategori ${!cat.active ? 'aktif edildi' : 'pasif edildi'}.`);
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, active: !cat.active } : c));
  };

  const deleteCategory = async (cat: any) => {
    if (!window.confirm(`"${cat.name}" kategorisini silmek istediğinizden emin misiniz?`)) return;
    await deleteDoc(doc(db, 'categories', cat.id));
    await logAction('category.delete', cat.id, { name: cat.name });
    toast.success('Kategori silindi.');
    setCategories(prev => prev.filter(c => c.id !== cat.id));
  };

  const saveEdit = async () => {
    if (!editTarget || !editName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'categories', editTarget.id), {
        name: editName.trim(),
        commissionRate: editCommission ? Number(editCommission) : null,
        updatedAt: serverTimestamp(),
      });
      await logAction('category.edit', editTarget.id, { name: editName });
      toast.success('Kategori güncellendi.');
      setCategories(prev => prev.map(c => c.id === editTarget.id ? { ...c, name: editName, commissionRate: editCommission ? Number(editCommission) : null } : c));
      setEditDialog(false);
    } finally { setSaving(false); }
  };

  const roots = categories.filter(c => !c.parentId);
  const subs = (parentId: string) => categories.filter(c => c.parentId === parentId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Kategori Yönetimi</h2><p className="text-gray-400 text-sm mt-1">{categories.filter(c => c.active !== false).length} aktif kategori</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Plus className="w-4 h-4 text-[#5b68f6]" />Yeni Kategori</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Kategori Adı *</Label>
              <Input value={newName} onChange={e => { setNewName(e.target.value); if (!newSlug) setNewSlug(slugify(e.target.value)); }} placeholder="Elektronik, Giyim..." className="bg-[#111218] border-white/10 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Slug (URL)</Label>
              <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="otomatik-olusturulur" className="bg-[#111218] border-white/10 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Üst Kategori (opsiyonel)</Label>
              <select value={newParent} onChange={e => setNewParent(e.target.value)} className="w-full bg-[#111218] border border-white/10 rounded-md text-white px-3 py-2 text-sm">
                <option value="">Ana Kategori</option>
                {roots.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Komisyon Oranı (%)</Label>
              <Input type="number" value={newCommission} onChange={e => setNewCommission(e.target.value)} placeholder="Boş = varsayılan" className="bg-[#111218] border-white/10 text-white" min={0} max={100} />
            </div>
            <Button className="w-full bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={addCategory} disabled={!isAdmin || saving || !newName.trim()}>
              <Plus className="w-4 h-4 mr-2" />{saving ? 'Ekleniyor...' : 'Kategori Ekle'}
            </Button>
            {!isAdmin && <p className="text-xs text-gray-500 text-center">Sadece admin ekleyebilir.</p>}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="bg-[#1a1b23] border-white/10">
            <CardHeader><CardTitle className="text-white">Kategori Ağacı</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center py-8"><div className="animate-spin w-5 h-5 rounded-full border-b-2 border-[#5b68f6]" /></div> : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {roots.map(cat => (
                      <div key={cat.id}>
                        <div className={`flex items-center justify-between p-3 rounded-lg border ${cat.active !== false ? 'bg-[#111218] border-white/10' : 'bg-[#111218]/50 border-white/5 opacity-60'}`}>
                          <div className="flex items-center gap-2.5">
                            <Layers className="w-4 h-4 text-[#5b68f6]" />
                            <div>
                              <span className="text-white font-medium text-sm">{cat.name}</span>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-gray-600 text-xs">{cat.slug}</span>
                                {cat.commissionRate != null && <span className="text-amber-400 text-xs flex items-center gap-0.5"><Percent className="w-2.5 h-2.5" />{cat.commissionRate}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={cat.active !== false} onCheckedChange={() => toggleActive(cat)} disabled={!isAdmin} />
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-white/10 text-gray-400" onClick={() => { setEditTarget(cat); setEditName(cat.name); setEditCommission(cat.commissionRate?.toString() || ''); setEditDialog(true); }}><Edit3 className="w-3 h-3" /></Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => deleteCategory(cat)} disabled={!isAdmin}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </div>
                        {subs(cat.id).map(sub => (
                          <div key={sub.id} className={`flex items-center justify-between p-2.5 ml-6 mt-1 rounded-lg border ${sub.active !== false ? 'bg-[#111218]/70 border-white/5' : 'bg-[#111218]/30 border-white/5 opacity-60'}`}>
                            <div className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-gray-600" />
                              <Tag className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-gray-300 text-sm">{sub.name}</span>
                              {sub.commissionRate != null && <span className="text-amber-400 text-xs">%{sub.commissionRate}</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Switch checked={sub.active !== false} onCheckedChange={() => toggleActive(sub)} disabled={!isAdmin} />
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0 border-white/10 text-gray-400" onClick={() => { setEditTarget(sub); setEditName(sub.name); setEditCommission(sub.commissionRate?.toString() || ''); setEditDialog(true); }}><Edit3 className="w-3 h-3" /></Button>
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0 border-red-500/20 text-red-400" onClick={() => deleteCategory(sub)} disabled={!isAdmin}><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    {roots.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Henüz kategori yok.</p>}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white">
          <DialogHeader><DialogTitle>Kategoriyi Düzenle</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Kategori Adı</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-[#111218] border-white/10 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Komisyon Oranı (%)</Label>
              <Input type="number" value={editCommission} onChange={e => setEditCommission(e.target.value)} placeholder="Boş = varsayılan" className="bg-[#111218] border-white/10 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} className="border-white/10 text-white">İptal</Button>
            <Button onClick={saveEdit} disabled={saving || !editName.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">{saving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
