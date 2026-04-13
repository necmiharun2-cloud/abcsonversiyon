import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import toast from 'react-hot-toast';
import { Settings, Save, RefreshCw, AlertTriangle, Globe, Lock, CreditCard, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SiteSettings {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  supportPhone: string;
  logoUrl: string;
  faviconUrl: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  storeApplicationsOpen: boolean;
  minWithdrawalAmount: number;
  defaultCommissionRate: number;
  maxListingsPerUser: number;
  requireEmailVerification: boolean;
  requireKycForSelling: boolean;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialYoutube: string;
}

const DEFAULT: SiteSettings = {
  siteName: '', siteUrl: '', contactEmail: '', supportPhone: '',
  logoUrl: '', faviconUrl: '',
  maintenanceMode: false, registrationOpen: true, storeApplicationsOpen: true,
  minWithdrawalAmount: 50, defaultCommissionRate: 10, maxListingsPerUser: 100,
  requireEmailVerification: false, requireKycForSelling: false,
  socialFacebook: '', socialTwitter: '', socialInstagram: '', socialYoutube: '',
};

export default function AdminSettings() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changeLogs, setChangeLogs] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'siteSettings'));
      const merged: any = { ...DEFAULT };
      snap.docs.forEach(d => { Object.assign(merged, d.data()); });
      setSettings(merged);
    } catch { /* use defaults */ }
    try {
      const logsSnap = await getDocs(collection(db, 'adminLogs'));
      const logs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((l: any) => l.entity === 'siteSettings').slice(0, 20);
      setChangeLogs(logs);
    } catch { /* no-op */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (section: string, patch: Partial<SiteSettings>) => {
    if (!isAdmin) { toast.error('Sadece admin ayar değiştirebilir.'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteSettings', section), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
      await addDoc(collection(db, 'adminLogs'), { actorId: user?.uid, actorRole: profile?.role, action: `settings.${section}.update`, entity: 'siteSettings', entityId: section, details: patch, createdAt: serverTimestamp() });
      toast.success('Ayarlar kaydedildi.');
      setSettings(prev => ({ ...prev, ...patch }));
    } catch { toast.error('Kayıt başarısız.'); }
    finally { setSaving(false); }
  };

  const set = (k: keyof SiteSettings, v: any) => setSettings(prev => ({ ...prev, [k]: v }));

  const SectionCard = ({ title, icon: Icon, children, onSave, patch }: { title: string; icon: any; children: React.ReactNode; onSave?: string; patch?: Partial<SiteSettings> }) => (
    <Card className="bg-[#1a1b23] border-white/10">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-white flex items-center gap-2 text-base"><Icon className="w-4 h-4 text-[#5b68f6]" />{title}</CardTitle>
        {onSave && patch && (
          <Button size="sm" className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" disabled={saving || !isAdmin} onClick={() => save(onSave, patch)}>
            <Save className="w-3.5 h-3.5 mr-1" />{saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">{children}</CardContent>
    </Card>
  );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-[#5b68f6]" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Site Ayarları</h2><p className="text-gray-400 text-sm mt-1">Sistem geneli konfigürasyon</p></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
      </div>

      {!isAdmin && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-400 text-sm">Ayarları değiştirmek için admin yetkisi gereklidir.</p>
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList className="bg-[#1a1b23] border border-white/10">
          <TabsTrigger value="general"><Globe className="w-3.5 h-3.5 mr-1.5" />Genel</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-3.5 h-3.5 mr-1.5" />Güvenlik</TabsTrigger>
          <TabsTrigger value="finance"><CreditCard className="w-3.5 h-3.5 mr-1.5" />Finans</TabsTrigger>
          <TabsTrigger value="social"><Bell className="w-3.5 h-3.5 mr-1.5" />Sosyal / Diğer</TabsTrigger>
          <TabsTrigger value="logs">Değişiklik Logu</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <SectionCard title="Site Bilgileri" icon={Globe} onSave="general" patch={{ siteName: settings.siteName, siteUrl: settings.siteUrl, contactEmail: settings.contactEmail, supportPhone: settings.supportPhone, logoUrl: settings.logoUrl, faviconUrl: settings.faviconUrl }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-white text-sm">Site Adı</Label><Input value={settings.siteName} onChange={e => set('siteName', e.target.value)} className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} /></div>
              <div className="space-y-1.5"><Label className="text-white text-sm">Site URL</Label><Input value={settings.siteUrl} onChange={e => set('siteUrl', e.target.value)} placeholder="https://..." className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} /></div>
              <div className="space-y-1.5"><Label className="text-white text-sm">İletişim E-postası</Label><Input value={settings.contactEmail} onChange={e => set('contactEmail', e.target.value)} className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} /></div>
              <div className="space-y-1.5"><Label className="text-white text-sm">Destek Telefonu</Label><Input value={settings.supportPhone} onChange={e => set('supportPhone', e.target.value)} className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} /></div>
              <div className="space-y-1.5"><Label className="text-white text-sm">Logo URL</Label><Input value={settings.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} /></div>
              <div className="space-y-1.5"><Label className="text-white text-sm">Favicon URL</Label><Input value={settings.faviconUrl} onChange={e => set('faviconUrl', e.target.value)} placeholder="https://..." className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} /></div>
            </div>
          </SectionCard>

          <SectionCard title="Site Modu" icon={Settings} onSave="mode" patch={{ maintenanceMode: settings.maintenanceMode, registrationOpen: settings.registrationOpen, storeApplicationsOpen: settings.storeApplicationsOpen }}>
            <div className="space-y-4">
              {[
                { key: 'maintenanceMode' as keyof SiteSettings, label: 'Bakım Modu', desc: 'Aktif olduğunda site sadece admin erişimine açık olur.', danger: true },
                { key: 'registrationOpen' as keyof SiteSettings, label: 'Kayıt Açık', desc: 'Kapalıyken yeni kullanıcı kaydı yapılamaz.', danger: false },
                { key: 'storeApplicationsOpen' as keyof SiteSettings, label: 'Mağaza Başvurusu Açık', desc: 'Kapalıyken mağaza başvurusu yapılamaz.', danger: false },
              ].map(({ key, label, desc, danger }) => (
                <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${danger && settings[key] ? 'bg-red-500/10 border-red-500/20' : 'bg-[#111218] border-white/5'}`}>
                  <div>
                    <p className={`font-medium text-sm ${danger && settings[key] ? 'text-red-400' : 'text-white'}`}>{label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                  </div>
                  <Switch checked={settings[key] as boolean} onCheckedChange={v => set(key, v)} disabled={!isAdmin} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <SectionCard title="Kullanıcı Güvenlik Ayarları" icon={Lock} onSave="security" patch={{ requireEmailVerification: settings.requireEmailVerification, requireKycForSelling: settings.requireKycForSelling, maxListingsPerUser: settings.maxListingsPerUser }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#111218] border border-white/5">
                <div><p className="text-white text-sm font-medium">E-posta Doğrulama Zorunlu</p><p className="text-gray-500 text-xs">İşlem yapabilmek için e-posta doğrulaması gereksin</p></div>
                <Switch checked={settings.requireEmailVerification} onCheckedChange={v => set('requireEmailVerification', v)} disabled={!isAdmin} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#111218] border border-white/5">
                <div><p className="text-white text-sm font-medium">Satış için KYC Zorunlu</p><p className="text-gray-500 text-xs">Satıcıların KYC doğrulaması tamamlaması gereksin</p></div>
                <Switch checked={settings.requireKycForSelling} onCheckedChange={v => set('requireKycForSelling', v)} disabled={!isAdmin} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white text-sm">Kullanıcı Başına Max. İlan</Label>
                <Input type="number" value={settings.maxListingsPerUser} onChange={e => set('maxListingsPerUser', Number(e.target.value))} className="bg-[#111218] border-white/10 text-white w-40" disabled={!isAdmin} min={1} />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="finance" className="mt-4 space-y-4">
          <SectionCard title="Finansal Ayarlar" icon={CreditCard} onSave="finance" patch={{ minWithdrawalAmount: settings.minWithdrawalAmount, defaultCommissionRate: settings.defaultCommissionRate }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white text-sm">Minimum Çekim Tutarı (₺)</Label>
                <Input type="number" value={settings.minWithdrawalAmount} onChange={e => set('minWithdrawalAmount', Number(e.target.value))} className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} min={0} />
                <p className="text-gray-500 text-xs">Kullanıcıların en az bu tutarı çekebileceği</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white text-sm">Varsayılan Komisyon Oranı (%)</Label>
                <Input type="number" value={settings.defaultCommissionRate} onChange={e => set('defaultCommissionRate', Number(e.target.value))} className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} min={0} max={100} />
                <p className="text-gray-500 text-xs">Kategori bazlı oran yoksa bu kullanılır</p>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="social" className="mt-4 space-y-4">
          <SectionCard title="Sosyal Medya" icon={Bell} onSave="social" patch={{ socialFacebook: settings.socialFacebook, socialTwitter: settings.socialTwitter, socialInstagram: settings.socialInstagram, socialYoutube: settings.socialYoutube }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'socialFacebook' as keyof SiteSettings, label: 'Facebook' },
                { key: 'socialTwitter' as keyof SiteSettings, label: 'X / Twitter' },
                { key: 'socialInstagram' as keyof SiteSettings, label: 'Instagram' },
                { key: 'socialYoutube' as keyof SiteSettings, label: 'YouTube' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-white text-sm">{label}</Label>
                  <Input value={settings[key] as string} onChange={e => set(key, e.target.value)} placeholder="https://..." className="bg-[#111218] border-white/10 text-white" disabled={!isAdmin} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-[#1a1b23] border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Ayar Değişiklik Logu</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {changeLogs.length === 0 ? <p className="text-center py-8 text-gray-400 text-sm">Değişiklik logu yok.</p> : (
                  <div className="space-y-2">
                    {changeLogs.map(log => (
                      <div key={log.id} className="p-3 rounded-lg bg-[#111218] border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-medium">{log.action}</span>
                          <span className="text-gray-500 text-xs">{log.createdAt?.toDate?.() ? log.createdAt.toDate().toLocaleString('tr-TR') : '-'}</span>
                        </div>
                        <p className="text-gray-500 text-xs">{log.actorRole} • {log.actorId?.slice(0, 12)}</p>
                        {log.details && <pre className="text-gray-600 text-xs mt-1 bg-black/20 p-2 rounded overflow-auto">{JSON.stringify(log.details, null, 2).slice(0, 200)}</pre>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
