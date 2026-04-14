import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  LayoutDashboard, Users, Shield, Package, ShoppingBag, Gavel,
  Wallet, MessageSquare, Store, Star, Bell, Gift, FileText, Tag,
  Settings, Lock, BarChart3, ChevronLeft, Menu, LogOut,
  AlertTriangle, Bot
} from 'lucide-react';
import { loadAutomationConfig, runAllAutomations } from '../services/automationService';

const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./admin/AdminUsers'));
const AdminRoles = lazy(() => import('./admin/AdminRoles'));
const AdminListings = lazy(() => import('./admin/AdminListings'));
const AdminOrders = lazy(() => import('./admin/AdminOrders'));
const AdminDisputes = lazy(() => import('./admin/AdminDisputes'));
const AdminFinance = lazy(() => import('./admin/AdminFinance'));
const AdminSupport = lazy(() => import('./admin/AdminSupport'));
const AdminStores = lazy(() => import('./admin/AdminStores'));
const AdminReviews = lazy(() => import('./admin/AdminReviews'));
const AdminNotifications = lazy(() => import('./admin/AdminNotifications'));
const AdminCampaigns = lazy(() => import('./admin/AdminCampaigns'));
const AdminContent = lazy(() => import('./admin/AdminContent'));
const AdminCategories = lazy(() => import('./admin/AdminCategories'));
const AdminSettings = lazy(() => import('./admin/AdminSettings'));
const AdminSecurity = lazy(() => import('./admin/AdminSecurity'));
const AdminAnalytics = lazy(() => import('./admin/AdminAnalytics'));
const AdminAutomation = lazy(() => import('./admin/AdminAutomation'));

type TabKey =
  | 'dashboard' | 'users' | 'roles' | 'listings' | 'orders' | 'disputes'
  | 'finance' | 'support' | 'stores' | 'reviews' | 'notifications'
  | 'campaigns' | 'content' | 'categories' | 'settings' | 'security' | 'analytics'
  | 'automation';

const NAV_GROUPS = [
  {
    label: 'Genel',
    items: [
      { key: 'dashboard' as TabKey, label: 'Dashboard', icon: LayoutDashboard },
      { key: 'analytics' as TabKey, label: 'Analitik & Rapor', icon: BarChart3 },
    ],
  },
  {
    label: 'Kullanıcılar',
    items: [
      { key: 'users' as TabKey, label: 'Kullanıcı Yönetimi', icon: Users, badge: 'pendingKyc' },
      { key: 'roles' as TabKey, label: 'Rol & Yetki', icon: Shield },
    ],
  },
  {
    label: 'Pazar Yeri',
    items: [
      { key: 'listings' as TabKey, label: 'İlan Yönetimi', icon: Package, badge: 'pendingListings' },
      { key: 'orders' as TabKey, label: 'Siparişler', icon: ShoppingBag, badge: 'pendingOrders' },
      { key: 'disputes' as TabKey, label: 'Uyuşmazlıklar', icon: Gavel, badge: 'openDisputes' },
    ],
  },
  {
    label: 'Finans & Destek',
    items: [
      { key: 'finance' as TabKey, label: 'Finans Paneli', icon: Wallet, badge: 'pendingWithdrawals' },
      { key: 'support' as TabKey, label: 'Destek Sistemi', icon: MessageSquare, badge: 'openTickets' },
    ],
  },
  {
    label: 'Mağaza & İçerik',
    items: [
      { key: 'stores' as TabKey, label: 'Mağaza Yönetimi', icon: Store, badge: 'pendingStores' },
      { key: 'reviews' as TabKey, label: 'Yorumlar', icon: Star },
      { key: 'notifications' as TabKey, label: 'Bildirimler', icon: Bell },
      { key: 'campaigns' as TabKey, label: 'Kampanya & Çekiliş', icon: Gift },
      { key: 'content' as TabKey, label: 'İçerik Yönetimi', icon: FileText },
      { key: 'categories' as TabKey, label: 'Kategoriler', icon: Tag },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { key: 'automation' as TabKey, label: 'Otomasyon', icon: Bot, badge: 'autoAlerts' },
      { key: 'settings' as TabKey, label: 'Site Ayarları', icon: Settings },
      { key: 'security' as TabKey, label: 'Güvenlik', icon: Lock },
    ],
  },
];

const SectionLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin w-8 h-8 rounded-full border-b-2 border-[#5b68f6]" />
  </div>
);

export default function AdminPanel() {
  const { user, profile, signOut } = useAuth() as any;
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(tabParam || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [badges, setBadges] = useState<Record<string, number>>({});

  const isAdmin = profile?.role === 'admin';
  const isStaff = isAdmin || ['moderator', 'support', 'finance', 'content'].includes(profile?.role || '');

  const navigateTo = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const safe = async (col: string, max = 100) => {
          try { return (await getDocs(query(collection(db, col), limit(max)))).docs.map(d => ({ id: d.id, ...d.data() as any })); }
          catch { return []; }
        };
        const [products, orders, disputes, withdrawals, tickets, storeApps, kycReqs, autoAlerts] = await Promise.all([
          safe('products', 100), safe('orders', 100), safe('disputes', 50),
          safe('withdrawals', 50), safe('supportTickets', 50),
          safe('storeApplications', 50), safe('kycRequests', 50),
          safe('adminAlerts', 50),
        ]);
        setBadges({
          pendingListings: products.filter((p: any) => p.moderationStatus === 'pending').length,
          pendingOrders: orders.filter((o: any) => ['pending','processing'].includes(o.status)).length,
          openDisputes: disputes.filter((d: any) => d.status === 'open' || d.status === 'in_review').length,
          pendingWithdrawals: withdrawals.filter((w: any) => w.status === 'Beklemede').length,
          openTickets: tickets.filter((t: any) => t.status === 'open').length,
          pendingStores: storeApps.filter((s: any) => s.status === 'pending').length,
          pendingKyc: kycReqs.filter((k: any) => k.status === 'pending').length,
          autoAlerts: autoAlerts.filter((a: any) => !a.resolved).length,
        });
      } catch { /* no-op */ }
    };
    if (isStaff) loadBadges();
  }, [isStaff]);

  useEffect(() => {
    if (!isAdmin) return;
    const runAutomation = async () => {
      try {
        const cfg = await loadAutomationConfig();
        await runAllAutomations(cfg);
      } catch { /* silent background run */ }
    };
    const firstRun = setTimeout(runAutomation, 5000);
    const interval = setInterval(runAutomation, 20 * 60 * 1000);
    return () => {
      clearTimeout(firstRun);
      clearInterval(interval);
    };
  }, [isAdmin]);

  if (!user) return <Navigate to="/login" replace />;
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-[#111218] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white text-xl font-bold">Erişim Reddedildi</h2>
          <p className="text-gray-400">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
          <Button variant="outline" className="border-white/10 text-white" onClick={() => window.history.back()}>Geri Dön</Button>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    const wrap = (node: ReactNode) => (
      <Suspense fallback={<SectionLoader />}>{node}</Suspense>
    );
    switch (activeTab) {
      case 'dashboard': return wrap(<AdminDashboard onNavigate={navigateTo} />);
      case 'users': return wrap(<AdminUsers />);
      case 'roles': return wrap(<AdminRoles />);
      case 'listings': return wrap(<AdminListings />);
      case 'orders': return wrap(<AdminOrders />);
      case 'disputes': return wrap(<AdminDisputes />);
      case 'finance': return wrap(<AdminFinance />);
      case 'support': return wrap(<AdminSupport />);
      case 'stores': return wrap(<AdminStores />);
      case 'reviews': return wrap(<AdminReviews />);
      case 'notifications': return wrap(<AdminNotifications />);
      case 'campaigns': return wrap(<AdminCampaigns />);
      case 'content': return wrap(<AdminContent />);
      case 'categories': return wrap(<AdminCategories />);
      case 'settings': return wrap(<AdminSettings />);
      case 'security': return wrap(<AdminSecurity />);
      case 'analytics': return wrap(<AdminAnalytics />);
      case 'automation': return wrap(<AdminAutomation />);
      default: return wrap(<AdminDashboard onNavigate={navigateTo} />);
    }
  };

  const totalAlerts = Object.values(badges).reduce<number>((s, v) => s + Number(v || 0), 0);

  return (
    <div className="flex h-screen bg-[#111218] overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col bg-[#0e0f15] border-r border-white/10 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
          {sidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5b68f6] to-[#8b35ef] flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-sm truncate">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="ml-auto text-gray-500 hover:text-white transition-colors p-1 rounded"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-4">
              {sidebarOpen && (
                <p className="text-[10px] uppercase tracking-widest text-gray-600 px-4 mb-1.5 font-medium">{group.label}</p>
              )}
              {group.items.map(item => {
                const Icon = item.icon;
                const badgeCount: number = item.badge ? Number(badges[item.badge] || 0) : 0;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigateTo(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all relative group ${
                      isActive
                        ? 'bg-[#5b68f6]/15 text-[#8b95ff] border-r-2 border-[#5b68f6]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#5b68f6]' : ''}`} />
                    {sidebarOpen ? (
                      <>
                        <span className="text-sm flex-1 truncate">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-medium flex-shrink-0">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </>
                    ) : (
                      badgeCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                      )
                    )}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label}{badgeCount > 0 && ` (${badgeCount})`}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-white/10 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b68f6] to-[#8b35ef] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(profile?.username || 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{profile?.username || 'Admin'}</p>
                <p className="text-gray-500 text-[10px] capitalize">{profile?.role || 'admin'}</p>
              </div>
              <button onClick={() => signOut()} className="text-gray-600 hover:text-red-400 transition-colors" title="Çıkış">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => signOut()} className="w-full flex justify-center text-gray-600 hover:text-red-400 transition-colors p-1" title="Çıkış">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-white/10 bg-[#0e0f15] flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h1 className="text-white font-semibold text-base">
              {NAV_GROUPS.flatMap(g => g.items).find(i => i.key === activeTab)?.label || 'Admin Panel'}
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Yönetim Paneli</p>
          </div>
          {totalAlerts > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">{totalAlerts} bekleyen işlem</span>
            </div>
          )}
        </header>

        {/* Section Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-[1600px] mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
