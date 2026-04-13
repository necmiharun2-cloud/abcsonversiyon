import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import toast from 'react-hot-toast';
import {
  Bot, Play, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Shield, ShoppingBag, MessageSquare, Gift, Wallet, Bell,
  Users, Package, Zap, Clock, Settings
} from 'lucide-react';
import {
  runAllAutomations, loadAutomationConfig, saveAutomationConfig,
  DEFAULT_CONFIG, type AutomationConfig, type AutomationResult
} from '../../services/automationService';
import { useAuth } from '../../contexts/AuthContext';

const RULE_META: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  'listing.bannedWordCheck':  { label: 'Yasaklı Kelime Taraması',     icon: Shield,      color: 'text-red-400',    desc: 'İlanlardaki yasaklı kelimeleri tespit eder ve işaretler' },
  'listing.duplicateCheck':   { label: 'Tekrar Eden İlan Tespiti',    icon: Package,     color: 'text-amber-400',  desc: 'Aynı satıcıdan aynı başlıklı ilanları işaretler' },
  'listing.priceAnomaly':     { label: 'Fiyat Anormalliği',           icon: AlertTriangle,color: 'text-orange-400', desc: 'Kategorideki ortalamaya göre aşırı fiyatları tespit eder' },
  'user.riskScore':           { label: 'Kullanıcı Risk Puanı',        icon: Users,       color: 'text-purple-400', desc: 'Her kullanıcıya aktiviteye göre risk puanı atar' },
  'user.multiAccount':        { label: 'Çoklu Hesap Şüphesi',         icon: Users,       color: 'text-red-400',    desc: 'Aynı telefon/IP ile birden fazla hesap açanları tespit eder' },
  'payment.failedTracking':   { label: 'Başarısız Ödeme Takibi',      icon: Wallet,      color: 'text-amber-400',  desc: 'Tekrarlı başarısız ödemeleri izler ve uyarır' },
  'order.autoComplete':       { label: 'Otomatik Sipariş Tamamlama',  icon: ShoppingBag, color: 'text-emerald-400', desc: 'Belirtilen gün sonra teslim edilen siparişleri tamamlar' },
  'ticket.autoAssign':        { label: 'Ticket Departman Atama',      icon: MessageSquare,color: 'text-blue-400',  desc: 'Ticket içeriğine göre ilgili departmana yönlendirir' },
  'ticket.faqAutoReply':      { label: 'SSS Otomatik Yanıt',          icon: MessageSquare,color: 'text-cyan-400',  desc: 'Sık sorulan sorulara otomatik yanıt gönderir' },
  'giveaway.autoClose':       { label: 'Çekiliş Otomatik Kapanma',    icon: Gift,        color: 'text-pink-400',   desc: 'Süresi dolan çekilişleri kapatır, kazanan seçer' },
  'campaign.autoActivate':    { label: 'Kampanya Oto Aktif/Pasif',    icon: Gift,        color: 'text-purple-400', desc: 'Başlangıç/bitiş tarihine göre kampanyaları ayarlar' },
  'withdrawal.autoQueue':     { label: 'Çekim Oto Onay Kuyruğu',      icon: Wallet,      color: 'text-emerald-400', desc: 'Kriterleri karşılayan çekim taleplerini kuyruğa alır' },
  'system.criticalAlerts':    { label: 'Kritik Olay Alarmları',        icon: Bell,        color: 'text-red-400',   desc: 'Anormal sipariş hacmi, büyük çekimler vb. için alarm üretir' },
};

export default function AdminAutomation() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [config, setConfig] = useState<AutomationConfig>(DEFAULT_CONFIG);
  const [results, setResults] = useState<AutomationResult[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    loadAutomationConfig().then(setConfig);
    loadAlerts();
    loadLogs();
  }, []);

  const loadAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const snap = await getDocs(query(collection(db, 'adminAlerts'), orderBy('createdAt', 'desc'), limit(50)));
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(query(collection(db, 'adminAlerts'), limit(50)));
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally { setLoadingAlerts(false); }
  };

  const loadLogs = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'adminLogs'), orderBy('createdAt', 'desc'), limit(100)));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      setLogs(all.filter(l => l.entity === 'automation' || l.actorId === 'system'));
    } catch { /* no-op */ }
  };

  const run = async () => {
    if (!isAdmin) { toast.error('Sadece admin çalıştırabilir.'); return; }
    setRunning(true);
    setResults([]);
    try {
      toast.loading('Otomasyon kuralları çalışıyor...', { id: 'auto' });
      const r = await runAllAutomations(config);
      setResults(r);
      setLastRun(new Date());
      const total = r.reduce((s, x) => s + x.count, 0);
      const errors = r.filter(x => x.errors.length > 0);
      toast.dismiss('auto');
      toast.success(`Tamamlandı: ${total} işlem${errors.length > 0 ? `, ${errors.length} hata` : ''}`);
      loadAlerts();
      loadLogs();
    } catch (e: any) {
      toast.dismiss('auto');
      toast.error('Otomasyon hatası: ' + e.message);
    } finally { setRunning(false); }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await saveAutomationConfig(config);
      toast.success('Ayarlar kaydedildi.');
    } catch { toast.error('Kayıt başarısız.'); }
    finally { setSaving(false); }
  };

  const resolveAlert = async (alert: any) => {
    await updateDoc(doc(db, 'adminAlerts', alert.id), { resolved: true, resolvedAt: serverTimestamp() });
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, resolved: true } : a));
    toast.success('Alarm çözüldü.');
  };

  const setConfigVal = <K extends keyof AutomationConfig>(key: K, val: AutomationConfig[K]) =>
    setConfig(prev => ({ ...prev, [key]: val }));

  const CONFIG_TOGGLES: { key: keyof AutomationConfig; label: string; desc: string }[] = [
    { key: 'listingBannedWordCheck', label: 'Yasaklı Kelime Taraması', desc: 'Onaylı ilanlarda yasaklı kelime varsa işaretle' },
    { key: 'listingDuplicateCheck', label: 'Tekrar Eden İlan', desc: 'Aynı satıcı + başlık kombinasyonu' },
    { key: 'listingPriceAnomaly', label: 'Fiyat Anormalliği', desc: 'Kategori ortalamasına göre sapma kontrolü' },
    { key: 'userRiskScore', label: 'Kullanıcı Risk Puanı', desc: 'Aktivite bazlı risk skoru hesapla' },
    { key: 'multiAccountDetection', label: 'Çoklu Hesap Tespiti', desc: 'Aynı telefon / IP kontrolü' },
    { key: 'failedPaymentTracking', label: 'Başarısız Ödeme Takibi', desc: '3+ başarısız ödeme uyarısı' },
    { key: 'autoOrderComplete', label: 'Oto Sipariş Tamamlama', desc: `Teslim edilen siparişleri ${config.autoOrderCompleteDays} gün sonra tamamla` },
    { key: 'ticketAutoAssign', label: 'Ticket Departman Atama', desc: 'İçeriğe göre otomatik yönlendir' },
    { key: 'ticketFaqAutoReply', label: 'SSS Oto Yanıt', desc: 'Sık sorulara otomatik cevap ver' },
    { key: 'giveawayAutoClose', label: 'Çekiliş Oto Kapanma', desc: 'Süresi dolan çekilişleri kapat + kazanan seç' },
    { key: 'campaignAutoActivate', label: 'Kampanya Oto Aktif/Pasif', desc: 'Tarih bazlı kupon yönetimi' },
    { key: 'withdrawalAutoQueue', label: 'Çekim Oto Kuyruğu', desc: `Koşulları sağlayanları oto kuyruğa al (max ${config.withdrawalAutoMaxAmount}₺)` },
    { key: 'criticalAlerts', label: 'Kritik Olay Alarmları', desc: 'Admin panele anlık uyarılar gönder' },
  ];

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const totalProcessed = results.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#5b68f6]" />Otomasyon Merkezi
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {CONFIG_TOGGLES.filter(t => config[t.key] as boolean).length} aktif kural
            {lastRun && <span className="ml-2 text-gray-600">• Son çalışma: {format(lastRun, 'HH:mm:ss', { locale: tr })}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadAlerts(); loadLogs(); }} className="border-white/10 text-white hover:bg-white/5">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={run} disabled={running || !isAdmin} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90 min-w-[130px]">
            {running ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Çalışıyor...</> : <><Play className="w-4 h-4 mr-2" />Tümünü Çalıştır</>}
          </Button>
        </div>
      </div>

      {unresolvedAlerts.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">{unresolvedAlerts.length} Çözümlenmemiş Kritik Alarm</span>
            </div>
            <div className="space-y-2">
              {unresolvedAlerts.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div>
                    <p className="text-white text-sm font-medium">{a.message}</p>
                    <p className="text-gray-500 text-xs">{a.createdAt?.toDate?.() ? format(a.createdAt.toDate(), 'dd.MM HH:mm', { locale: tr }) : ''}</p>
                  </div>
                  <Button size="sm" className="h-7 px-2 bg-red-500/20 text-red-300 border border-red-500/30 flex-shrink-0" onClick={() => resolveAlert(a)}>
                    <CheckCircle className="w-3 h-3 mr-1" />Çöz
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="rules">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="rules"><Zap className="w-3.5 h-3.5 mr-1.5" />Kurallar</TabsTrigger>
          <TabsTrigger value="results"><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Son Sonuçlar {totalProcessed > 0 && `(${totalProcessed})`}</TabsTrigger>
          <TabsTrigger value="alerts"><Bell className="w-3.5 h-3.5 mr-1.5" />Alarmlar {unresolvedAlerts.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">{unresolvedAlerts.length}</span>}</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-3.5 h-3.5 mr-1.5" />Ayarlar</TabsTrigger>
          <TabsTrigger value="logs"><Clock className="w-3.5 h-3.5 mr-1.5" />İşlem Logu</TabsTrigger>
        </TabsList>

        {/* RULES TAB */}
        <TabsContent value="rules" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {CONFIG_TOGGLES.map(toggle => {
              const meta = RULE_META[Object.entries({
                listingBannedWordCheck: 'listing.bannedWordCheck',
                listingDuplicateCheck: 'listing.duplicateCheck',
                listingPriceAnomaly: 'listing.priceAnomaly',
                userRiskScore: 'user.riskScore',
                multiAccountDetection: 'user.multiAccount',
                failedPaymentTracking: 'payment.failedTracking',
                autoOrderComplete: 'order.autoComplete',
                ticketAutoAssign: 'ticket.autoAssign',
                ticketFaqAutoReply: 'ticket.faqAutoReply',
                giveawayAutoClose: 'giveaway.autoClose',
                campaignAutoActivate: 'campaign.autoActivate',
                withdrawalAutoQueue: 'withdrawal.autoQueue',
                criticalAlerts: 'system.criticalAlerts',
              }).find(([k]) => k === toggle.key)?.[1] || ''] || { label: toggle.label, icon: Zap, color: 'text-gray-400', desc: toggle.desc };
              const Icon = meta.icon;
              const isActive = config[toggle.key] as boolean;
              const lastResult = results.find(r => r.rule === Object.entries({
                listingBannedWordCheck: 'listing.bannedWordCheck',
                listingDuplicateCheck: 'listing.duplicateCheck',
                listingPriceAnomaly: 'listing.priceAnomaly',
                userRiskScore: 'user.riskScore',
                multiAccountDetection: 'user.multiAccount',
                failedPaymentTracking: 'payment.failedTracking',
                autoOrderComplete: 'order.autoComplete',
                ticketAutoAssign: 'ticket.autoAssign',
                ticketFaqAutoReply: 'ticket.faqAutoReply',
                giveawayAutoClose: 'giveaway.autoClose',
                campaignAutoActivate: 'campaign.autoActivate',
                withdrawalAutoQueue: 'withdrawal.autoQueue',
                criticalAlerts: 'system.criticalAlerts',
              }).find(([k]) => k === toggle.key)?.[1]);

              return (
                <Card key={toggle.key} className={`bg-[#1a1b23] border-white/10 transition-all ${isActive ? '' : 'opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-white/5`}>
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                        </div>
                        <span className="text-white text-sm font-medium leading-tight">{meta.label}</span>
                      </div>
                      <Switch checked={isActive} onCheckedChange={v => setConfigVal(toggle.key, v as any)} disabled={!isAdmin} />
                    </div>
                    <p className="text-gray-500 text-xs mb-3">{meta.desc}</p>
                    {lastResult && (
                      <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${lastResult.errors.length > 0 ? 'bg-red-500/10 text-red-400' : lastResult.count > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {lastResult.errors.length > 0 ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {lastResult.errors.length > 0 ? `Hata: ${lastResult.errors[0].slice(0, 40)}` : lastResult.count > 0 ? `${lastResult.count} işlem yapıldı` : 'Değişiklik yok'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" className="border-white/10 text-white" onClick={() => setConfig(DEFAULT_CONFIG)} disabled={!isAdmin}>Varsayılana Sıfırla</Button>
            <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={saveConfig} disabled={saving || !isAdmin}>
              {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </Button>
          </div>
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results" className="mt-4 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>Henüz çalıştırılmadı. "Tümünü Çalıştır" butonuna basın.</p>
            </div>
          ) : (
            results.map((r, i) => {
              const meta = RULE_META[r.rule];
              const Icon = meta?.icon || Zap;
              return (
                <Card key={i} className={`bg-[#1a1b23] ${r.errors.length > 0 ? 'border-red-500/20' : r.count > 0 ? 'border-emerald-500/20' : 'border-white/10'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${meta?.color || 'text-gray-400'}`} />
                        <span className="text-white font-medium text-sm">{meta?.label || r.rule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.errors.length > 0 && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{r.errors.length} hata</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.count > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>{r.count} işlem</span>
                      </div>
                    </div>
                    {r.details.length > 0 && (
                      <div className="space-y-1">
                        {r.details.slice(0, 5).map((d, j) => <p key={j} className="text-gray-400 text-xs pl-2 border-l border-white/10">• {d}</p>)}
                        {r.details.length > 5 && <p className="text-gray-600 text-xs pl-2">+{r.details.length - 5} daha...</p>}
                      </div>
                    )}
                    {r.errors.map((e, j) => <p key={j} className="text-red-400 text-xs mt-1 pl-2 border-l border-red-500/30">⚠ {e}</p>)}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ALERTS TAB */}
        <TabsContent value="alerts" className="mt-4">
          <div className="space-y-2">
            {loadingAlerts ? <div className="flex justify-center py-10"><div className="animate-spin w-5 h-5 rounded-full border-b-2 border-[#5b68f6]" /></div> : (
              alerts.map(a => (
                <Card key={a.id} className={`bg-[#1a1b23] ${a.resolved ? 'border-white/5 opacity-50' : a.severity === 'high' ? 'border-red-500/30' : 'border-amber-500/20'}`}>
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${a.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.type}</span>
                        <span className="text-white text-sm">{a.message}</span>
                      </div>
                      <p className="text-gray-500 text-xs">{a.createdAt?.toDate?.() ? format(a.createdAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : ''}</p>
                    </div>
                    {!a.resolved && (
                      <Button size="sm" className="h-7 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0" onClick={() => resolveAlert(a)}>
                        <CheckCircle className="w-3 h-3 mr-1" />Çöz
                      </Button>
                    )}
                    {a.resolved && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  </CardContent>
                </Card>
              ))
            )}
            {!loadingAlerts && alerts.length === 0 && <div className="text-center py-16 text-gray-400"><Bell className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p>Alarm yok.</p></div>}
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card className="bg-[#1a1b23] border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Kural Parametreleri</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-white text-sm">Oto Sipariş Tamamlama (gün)</Label>
                  <Input type="number" value={config.autoOrderCompleteDays} onChange={e => setConfigVal('autoOrderCompleteDays', Number(e.target.value))} className="bg-[#111218] border-white/10 text-white" min={1} max={30} disabled={!isAdmin} />
                  <p className="text-gray-500 text-xs">Teslim edilen siparişler kaç gün sonra otomatik tamamlansın</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-sm">Çekim Oto Onay Max Tutar (₺)</Label>
                  <Input type="number" value={config.withdrawalAutoMaxAmount} onChange={e => setConfigVal('withdrawalAutoMaxAmount', Number(e.target.value))} className="bg-[#111218] border-white/10 text-white" min={0} disabled={!isAdmin} />
                  <p className="text-gray-500 text-xs">Bu tutarın üzerindeki çekimler manual incelemeye gider</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-sm">Fiyat Anomali Min Çarpanı</Label>
                  <Input type="number" step="0.01" value={config.priceAnomalyMinMultiplier} onChange={e => setConfigVal('priceAnomalyMinMultiplier', Number(e.target.value))} className="bg-[#111218] border-white/10 text-white" min={0.01} max={1} disabled={!isAdmin} />
                  <p className="text-gray-500 text-xs">Kategori ortalamasının bu oranının altındaki fiyatlar anormal sayılır (örn: 0.05 = %5)</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white text-sm">Fiyat Anomali Max Çarpanı</Label>
                  <Input type="number" value={config.priceAnomalyMaxMultiplier} onChange={e => setConfigVal('priceAnomalyMaxMultiplier', Number(e.target.value))} className="bg-[#111218] border-white/10 text-white" min={2} max={100} disabled={!isAdmin} />
                  <p className="text-gray-500 text-xs">Kategori ortalamasının bu katından fazlası anormal sayılır (örn: 20 = 20x)</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={saveConfig} disabled={saving || !isAdmin}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGS TAB */}
        <TabsContent value="logs" className="mt-4">
          <Card className="bg-[#1a1b23] border-white/10">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#111218] border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#5b68f6] mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-xs font-medium">{log.action}</span>
                          <span className="text-gray-600 text-xs">{log.entityId?.slice(0, 10)}</span>
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <p className="text-gray-500 text-xs mt-0.5 truncate">{JSON.stringify(log.details).slice(0, 80)}</p>
                        )}
                      </div>
                      <span className="text-gray-600 text-xs flex-shrink-0">{log.createdAt?.toDate?.() ? format(log.createdAt.toDate(), 'dd.MM HH:mm', { locale: tr }) : ''}</span>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Log bulunamadı.</p>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
