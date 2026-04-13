import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';
import { Bell, Megaphone, Send, Users, RefreshCw, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminNotifications() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [channel, setChannel] = useState('in_app');
  const [link, setLink] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'systemNotifications'), orderBy('sentAt', 'desc'), limit(100)));
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(query(collection(db, 'systemNotifications'), limit(100)));
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) { toast.error('Başlık ve içerik zorunlu.'); return; }
    setSending(true);
    try {
      const ref = await addDoc(collection(db, 'systemNotifications'), {
        title: title.trim(), body: body.trim(), target, channel, link: link.trim() || null,
        sentBy: user?.uid, sentAt: serverTimestamp(), status: 'sent',
      });
      await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action: 'notification.send', entity: 'systemNotifications', entityId: ref.id, details: { title, target, channel }, createdAt: serverTimestamp() });
      toast.success('Bildirim gönderildi.');
      setTitle(''); setBody(''); setLink('');
      load();
    } catch { toast.error('Gönderim başarısız.'); }
    finally { setSending(false); }
  };

  const targetLabels: Record<string, string> = { all: 'Tüm Kullanıcılar', sellers: 'Satıcılar', buyers: 'Alıcılar', verified: 'Doğrulanmış', premium: 'Premium' };
  const channelLabels: Record<string, string> = { in_app: 'Uygulama İçi', email: 'E-posta', push: 'Push Bildirimi', sms: 'SMS' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Bildirim Yönetimi</h2><p className="text-gray-400 text-sm mt-1">{notifications.length} gönderim geçmişi</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Megaphone className="w-5 h-5 text-[#5b68f6]" />Yeni Bildirim Gönder</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Başlık *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bildirim başlığı..." className="bg-[#111218] border-white/10 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">İçerik *</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Bildirim metni..." rows={4} className="bg-[#111218] border-white/10 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white text-sm">Hedef Kitle</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="bg-[#111218] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                    <SelectItem value="sellers">Satıcılar</SelectItem>
                    <SelectItem value="buyers">Alıcılar</SelectItem>
                    <SelectItem value="verified">Doğrulanmış</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white text-sm">Kanal</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="bg-[#111218] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app">Uygulama İçi</SelectItem>
                    <SelectItem value="email">E-posta</SelectItem>
                    <SelectItem value="push">Push Bildirimi</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">Bağlantı URL (opsiyonel)</Label>
              <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://... veya /sayfa/yol" className="bg-[#111218] border-white/10 text-white" />
            </div>
            <Button onClick={sendNotification} disabled={sending || !isAdmin || !title.trim() || !body.trim()} className="w-full bg-[#5b68f6] hover:bg-[#5b68f6]/90">
              <Send className="w-4 h-4 mr-2" />{sending ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
            {!isAdmin && <p className="text-xs text-gray-500 text-center">Sadece admin gönderebilir.</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Bell className="w-5 h-5 text-gray-400" />Gönderim Geçmişi</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {loading ? <div className="flex justify-center py-10"><div className="animate-spin w-5 h-5 rounded-full border-b-2 border-[#5b68f6]" /></div> : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 rounded-lg bg-[#111218] border border-white/5 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white font-medium text-sm">{n.title}</p>
                        <div className="flex gap-1 flex-shrink-0">
                          <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400">{targetLabels[n.target] || n.target}</Badge>
                          <Badge variant="outline" className="text-[10px] border-purple-500/20 text-purple-400">{channelLabels[n.channel] || n.channel}</Badge>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs">{n.body?.slice(0, 100)}{n.body?.length > 100 ? '...' : ''}</p>
                      <p className="text-gray-600 text-xs">{n.sentAt?.toDate?.() ? format(n.sentAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-'}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Bildirim gönderilmedi.</p>}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
