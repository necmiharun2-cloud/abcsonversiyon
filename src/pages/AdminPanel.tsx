import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query,
  runTransaction, serverTimestamp, setDoc, updateDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Users, DollarSign, ShoppingCart, Package, FileCheck, Search,
  RefreshCw, LogOut, Shield, Wallet, MessageSquare, Gift,
  BarChart3, Activity, Settings, CheckCircle, XCircle, Filter,
  TrendingUp, TrendingDown, Eye, Ban, UserCheck, Gavel,
  ChevronLeft, ChevronRight, Edit, Plus, Calendar, Bell,
  Star, Store, Tag, Globe, Lock, AlertTriangle, Hash,
  Layers, ShoppingBag, CreditCard, Award, Megaphone, Flag,
  Inbox, UserX, Percent, Trash2, ArrowUp, ArrowDown, BookOpen
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type TabKey = 'dashboard' | 'withdrawals' | 'support' | 'moderation' | 'kyc' | 'users' | 'disputes' | 'finance' | 'logs' | 'settings' | 'giveaways' | 'orders' | 'stores' | 'campaigns' | 'categories' | 'notifications' | 'security' | 'reviews' | 'reports';

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    banned: 'bg-red-500/10 text-red-400 border-red-500/20',
    frozen: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  const normalizedStatus = status?.toLowerCase() || 'pending';
  return (
    <Badge variant="outline" className={variants[normalizedStatus] || variants.pending}>
      {status?.toUpperCase()}
    </Badge>
  );
};

// Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
  const variants: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    moderator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    user: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <Badge variant="outline" className={variants[role] || variants.user}>
      {role?.toUpperCase()}
    </Badge>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
  <Card className="bg-[#1a1b23] border-white/10">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminPanel() {
  const { user, profile, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<TabKey>((searchParams.get('tab') as TabKey) || 'dashboard');

  // Data states
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [storeApplications, setStoreApplications] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reportedContent, setReportedContent] = useState<any[]>([]);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [userFilter, setUserFilter] = useState({ role: 'all', status: 'all', search: '' });
  const [withdrawalFilter, setWithdrawalFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [listingFilter, setListingFilter] = useState('all');

  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [ticketReplyOpen, setTicketReplyOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBannedWord, setNewBannedWord] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifTarget, setNotifTarget] = useState('all');
  const [userNote, setUserNote] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<any>({
    maintenanceMode: false,
    maintenanceMessage: '',
    topBarMessage: '',
    floatingChatEnabled: true,
    banners: [
      { label: 'PUBG MOBILE', text: 'RP A18 Simdi Oyunda!', accent: 'amber', active: true },
      { label: 'Valorant', text: 'Karacali Koleksiyonu Simdi Oyunda', accent: 'red', active: true },
    ],
    heroSlides: [],
  });

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';
  const isAdmin = profile?.role === 'admin';

  const openDisputesCount = useMemo(() => disputes.filter((d) => ['open', 'active', 'pending'].includes(String(d.status || '').toLowerCase())).length, [disputes]);

  const setTabParam = (nextTab: TabKey) => {
    setTab(nextTab);
    setSearchParams({ tab: nextTab });
  };

  const safeFetchCollection = async (collectionName: string, max = 100) => {
    try {
      return await getDocs(query(collection(db, collectionName), orderBy('createdAt', 'desc'), limit(max)));
    } catch (error) {
      console.warn(`Falling back to unordered query for ${collectionName}`, error);
      return await getDocs(query(collection(db, collectionName), limit(max)));
    }
  };

  // Load all data
  const loadAll = async () => {
    if (!user || !isStaff) return;
    setLoadingData(true);
    try {
      const [
        wdSnap, ticketSnap, productSnap, kycSnap, userSnap,
        disputeSnap, txSnap, logSnap, giveawaySnap,
        orderSnap, storeSnap, storeAppSnap, reviewSnap,
        categorySnap, reportSnap
      ] = await Promise.all([
        safeFetchCollection('withdrawals', 100),
        safeFetchCollection('supportTickets', 100),
        safeFetchCollection('products', 200),
        safeFetchCollection('kycRequests', 100),
        safeFetchCollection('users', 200),
        safeFetchCollection('disputes', 100),
        safeFetchCollection('transactions', 200),
        safeFetchCollection('adminLogs', 200),
        safeFetchCollection('giveaways', 50),
        safeFetchCollection('orders', 200),
        safeFetchCollection('stores', 100),
        safeFetchCollection('storeApplications', 100),
        safeFetchCollection('reviews', 100),
        safeFetchCollection('categories', 50),
        safeFetchCollection('reports', 100),
      ]);

      setWithdrawals(wdSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTickets(ticketSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setProducts(productSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setKycQueue(kycSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setUsers(userSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setDisputes(disputeSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTransactions(txSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setAdminLogs(logSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setGiveaways(giveawaySnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setOrders(orderSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setStores(storeSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setStoreApplications(storeAppSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReviews(reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCategories(categorySnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReportedContent(reportSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Admin verileri yuklenemedi', error);
      toast.error('Admin verileri yuklenemedi. Firestore index veya izinlerini kontrol edin.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [user, profile?.role]);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user || !isStaff) return;
      try {
        const ref = doc(db, 'siteSettings', 'global');
        const snap = await getDoc(ref);
        if (snap.exists()) setSiteSettings((prev: any) => ({ ...prev, ...(snap.data() as any) }));
      } catch { /* no-op */ }
    };
    loadSettings();
  }, [user, profile?.role]);

  // Helper functions
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
    toast.success('Veriler yenilendi');
  };

  const logAction = async (action: string, entity: string, entityId: string, details?: any) => {
    if (!user) return;
    await addDoc(collection(db, 'adminLogs'), {
      actorId: user.uid,
      actorRole: profile?.role || 'unknown',
      action,
      entity,
      entityId,
      details: details || {},
      createdAt: serverTimestamp(),
    });
  };

  const updateWithdrawalStatus = async (row: any, status: 'Onaylandi' | 'Reddedildi') => {
    if (!isStaff) return;
    const rejectionReason = status === 'Reddedildi' ? window.prompt('Red nedeni girin:') || '' : '';
    try {
      await updateDoc(doc(db, 'withdrawals', row.id), {
        status,
        rejectionReason,
        processedBy: user?.uid || '',
        processedAt: serverTimestamp(),
      });
      await logAction('withdrawal.updateStatus', 'withdrawals', row.id, { status, rejectionReason });
      toast.success('Cekim durumu guncellendi.');
      loadAll();
    } catch {
      toast.error('Cekim islemi guncellenemedi.');
    }
  };

  const updateUser = async (u: any, patch: any, action: string) => {
    if (!isStaff) return;
    try {
      await updateDoc(doc(db, 'users', u.id), { ...patch, updatedAt: serverTimestamp() });
      await logAction(action, 'users', u.id, patch);
      toast.success('Kullanici kaydi guncellendi.');
      loadAll();
    } catch {
      toast.error('Kullanici guncellemesi basarisiz.');
    }
  };

  const reviewKyc = async (request: any, status: 'verified' | 'rejected' | 'needs_more_documents') => {
    if (!isStaff) return;
    const note = status !== 'verified' ? window.prompt('Inceleme notu girin:') || '' : '';
    try {
      await updateDoc(doc(db, 'kycRequests', request.id), {
        status,
        reviewedBy: user?.uid || '',
        reviewNote: note,
        reviewedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', request.userId), {
        kycStatus: status === 'needs_more_documents' ? 'pending' : status,
        isVerifiedSeller: status === 'verified',
        storeLevel: status === 'verified' ? 'corporate' : 'standard',
      });
      await logAction('kyc.review', 'kycRequests', request.id, { status, note, userId: request.userId });
      toast.success('KYC basvurusu guncellendi.');
      loadAll();
    } catch {
      toast.error('KYC guncellemesi basarisiz.');
    }
  };

  const moderateProduct = async (item: any, moderationStatus: string) => {
    if (!isStaff) return;
    const reason = window.prompt('Moderasyon notu / sebep girin:') || '';
    try {
      await updateDoc(doc(db, 'products', item.id), {
        moderationStatus,
        moderationReason: reason,
        status: moderationStatus === 'approved' ? 'active' : moderationStatus === 'suspended' ? 'inactive' : item.status || 'inactive',
        updatedAt: serverTimestamp(),
      });
      await logAction('product.moderation', 'products', item.id, { moderationStatus, reason });
      toast.success('Ilan moderasyonu guncellendi.');
      loadAll();
    } catch {
      toast.error('Ilan moderasyonu basarisiz.');
    }
  };

  const closeTicket = async (ticket: any) => {
    if (!isStaff) return;
    try {
      await updateDoc(doc(db, 'supportTickets', ticket.id), {
        status: 'closed',
        updatedAt: serverTimestamp(),
        closedAt: serverTimestamp(),
        closedBy: user?.uid || '',
      });
      await logAction('support.close', 'supportTickets', ticket.id, { subject: ticket.subject || '' });
      toast.success('Ticket kapatildi.');
      await loadAll();
    } catch (error) {
      console.error('Ticket kapatma hatasi', error);
      toast.error('Ticket kapatilamadi.');
    }
  };

  const resolveDispute = async (dispute: any, status: 'resolved' | 'rejected') => {
    if (!isStaff) return;
    const note = window.prompt('Karar / not girin:') || '';
    try {
      await updateDoc(doc(db, 'disputes', dispute.id), {
        status,
        resolutionNote: note,
        reviewedBy: user?.uid || '',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (dispute.orderId) {
        await updateDoc(doc(db, 'orders', String(dispute.orderId)), {
          disputeStatus: status,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
      await logAction('dispute.resolve', 'disputes', dispute.id, { status, note, orderId: dispute.orderId || '' });
      toast.success('Uyusmazlik guncellendi.');
      await loadAll();
    } catch (error) {
      console.error('Uyusmazlik guncelleme hatasi', error);
      toast.error('Uyusmazlik guncellenemedi.');
    }
  };

  const createGiveaway = async () => {
    if (!isStaff) return;
    const title = window.prompt('Cekilis basligi:');
    const prize = window.prompt('Odul:');
    if (!title || !prize) return;
    try {
      const ref = await addDoc(collection(db, 'giveaways'), {
        title: title.trim(),
        prize: prize.trim(),
        status: 'active',
        participants: [],
        winner: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid || '',
        endDate: null,
      });
      await logAction('giveaway.create', 'giveaways', ref.id, { title: title.trim(), prize: prize.trim() });
      toast.success('Cekilis olusturuldu.');
      await loadAll();
    } catch (error) {
      console.error('Cekilis olusturma hatasi', error);
      toast.error('Cekilis olusturulamadi.');
    }
  };

  const pickGiveawayWinner = async (giveaway: any) => {
    if (!isStaff) return;
    const parts = Array.isArray(giveaway.participants) ? giveaway.participants : [];
    if (parts.length === 0) {
      toast.error('Katilimci yok.');
      return;
    }
    const winner = parts[Math.floor(Math.random() * parts.length)];
    try {
      await updateDoc(doc(db, 'giveaways', giveaway.id), {
        winner,
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logAction('giveaway.pickWinner', 'giveaways', giveaway.id, { winner });
      toast.success(`Kazanan: ${winner}`);
      await loadAll();
    } catch (error) {
      console.error('Kazanan secme hatasi', error);
      toast.error('Kazanan secilemedi.');
    }
  };

  const createManualTransaction = async () => {
    if (!isStaff) return;
    const userId = (window.prompt('Kullanici ID:') || '').trim();
    const amount = Number(window.prompt('Tutar (+/-):'));
    const reason = (window.prompt('Aciklama:') || 'Manual duzeltme').trim();
    if (!userId || !Number.isFinite(amount) || amount === 0) {
      toast.error('Gecerli kullanici ve tutar girin.');
      return;
    }
    try {
      await runTransaction(db, async (tx) => {
        const userRef = doc(db, 'users', userId);
        const txRef = doc(collection(db, 'transactions'));
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Kullanici bulunamadi');

        const raw = userSnap.data() as any;
        const currentAvailableCents = typeof raw.balanceAvailableCents === 'number'
          ? Number(raw.balanceAvailableCents || 0)
          : Math.round(Number(raw.balance || 0) * 100);
        const nextAvailableCents = currentAvailableCents + Math.round(amount * 100);
        if (nextAvailableCents < 0) throw new Error('Bakiye eksiye dusuyor');

        tx.update(userRef, {
          balanceAvailableCents: nextAvailableCents,
          balanceHeldCents: typeof raw.balanceHeldCents === 'number' ? Number(raw.balanceHeldCents || 0) : 0,
          balance: nextAvailableCents / 100,
          updatedAt: serverTimestamp(),
        });
        tx.set(txRef, {
          userId,
          type: 'manual_adjustment',
          amount,
          fee: 0,
          status: 'completed',
          direction: amount >= 0 ? 'credit' : 'debit',
          reason,
          createdAt: serverTimestamp(),
          actorId: user?.uid || '',
        });
      });
      await logAction('finance.manualAdjustment', 'users', userId, { amount, reason });
      toast.success('Manuel islem kaydedildi.');
      await loadAll();
    } catch (error: any) {
      console.error('Manuel islem hatasi', error);
      toast.error(error?.message || 'Manuel islem kaydedilemedi.');
    }
  };

  const updateOrderStatus = async (order: any, status: string) => {
    if (!isStaff) return;
    try {
      await updateDoc(doc(db, 'orders', order.id), { status, updatedAt: serverTimestamp(), reviewedBy: user?.uid });
      await logAction('order.updateStatus', 'orders', order.id, { status });
      toast.success('Siparis durumu guncellendi.');
      loadAll();
    } catch { toast.error('Guncelleme basarisiz.'); }
  };

  const replyToTicket = async () => {
    if (!isStaff || !selectedTicket || !ticketReply.trim()) return;
    try {
      const replyRef = collection(db, 'supportTickets', selectedTicket.id, 'messages');
      await addDoc(replyRef, { message: ticketReply.trim(), senderId: user?.uid, senderRole: profile?.role, createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), { status: 'answered', updatedAt: serverTimestamp() });
      await logAction('support.reply', 'supportTickets', selectedTicket.id, { reply: ticketReply.trim() });
      toast.success('Cevap gonderildi.');
      setTicketReply('');
      setTicketReplyOpen(false);
      loadAll();
    } catch { toast.error('Cevap gonderilemedi.'); }
  };

  const approveStore = async (app: any, status: 'approved' | 'rejected') => {
    if (!isStaff) return;
    const note = status === 'rejected' ? window.prompt('Red nedeni:') || '' : '';
    try {
      await updateDoc(doc(db, 'storeApplications', app.id), { status, reviewNote: note, reviewedBy: user?.uid, reviewedAt: serverTimestamp() });
      if (status === 'approved' && app.userId) {
        await updateDoc(doc(db, 'users', app.userId), { hasStore: true, storeApproved: true, storeLevel: 'standard' });
        await setDoc(doc(db, 'stores', app.userId), { ownerId: app.userId, storeName: app.storeName || '', status: 'active', level: 'standard', badge: '', createdAt: serverTimestamp() }, { merge: true });
      }
      await logAction('store.review', 'storeApplications', app.id, { status, note });
      toast.success('Magaza basvurusu guncellendi.');
      loadAll();
    } catch { toast.error('Guncelleme basarisiz.'); }
  };

  const updateStore = async (store: any, patch: any) => {
    if (!isStaff) return;
    try {
      await updateDoc(doc(db, 'stores', store.id), { ...patch, updatedAt: serverTimestamp() });
      await logAction('store.update', 'stores', store.id, patch);
      toast.success('Magaza guncellendi.');
      loadAll();
    } catch { toast.error('Guncelleme basarisiz.'); }
  };

  const addCategory = async () => {
    if (!isAdmin || !newCategoryName.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCategoryName.trim(), slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'), active: true, createdAt: serverTimestamp() });
      await logAction('category.add', 'categories', 'new', { name: newCategoryName.trim() });
      toast.success('Kategori eklendi.');
      setNewCategoryName('');
      loadAll();
    } catch { toast.error('Kategori eklenemedi.'); }
  };

  const deleteCategory = async (cat: any) => {
    if (!isAdmin) return;
    if (!window.confirm(`"${cat.name}" kategorisini silmek istediginizden emin misiniz?`)) return;
    try {
      await updateDoc(doc(db, 'categories', cat.id), { active: false, deletedAt: serverTimestamp() });
      await logAction('category.delete', 'categories', cat.id, { name: cat.name });
      toast.success('Kategori silindi.');
      loadAll();
    } catch { toast.error('Kategori silinemedi.'); }
  };

  const sendSystemNotification = async () => {
    if (!isAdmin || !notifTitle.trim() || !notifBody.trim()) return;
    try {
      await addDoc(collection(db, 'systemNotifications'), { title: notifTitle.trim(), body: notifBody.trim(), target: notifTarget, sentBy: user?.uid, sentAt: serverTimestamp(), read: [] });
      await logAction('notification.send', 'systemNotifications', 'broadcast', { title: notifTitle.trim(), target: notifTarget });
      toast.success('Bildirim gonderildi.');
      setNotifTitle('');
      setNotifBody('');
      loadAll();
    } catch { toast.error('Bildirim gonderilemedi.'); }
  };

  const addBannedWord = async () => {
    if (!isAdmin || !newBannedWord.trim()) return;
    try {
      await setDoc(doc(db, 'siteSettings', 'bannedWords'), { words: [...bannedWords, newBannedWord.trim().toLowerCase()], updatedAt: serverTimestamp() }, { merge: true });
      setBannedWords(prev => [...prev, newBannedWord.trim().toLowerCase()]);
      await logAction('security.addBannedWord', 'siteSettings', 'bannedWords', { word: newBannedWord.trim() });
      toast.success('Yasakli kelime eklendi.');
      setNewBannedWord('');
    } catch { toast.error('Eklenemedi.'); }
  };

  const removeBannedWord = async (word: string) => {
    if (!isAdmin) return;
    const updated = bannedWords.filter(w => w !== word);
    try {
      await setDoc(doc(db, 'siteSettings', 'bannedWords'), { words: updated, updatedAt: serverTimestamp() }, { merge: true });
      setBannedWords(updated);
      toast.success('Yasakli kelime kaldirildi.');
    } catch { toast.error('Kaldirilamadi.'); }
  };

  const moderateReview = async (review: any, action: 'approved' | 'deleted') => {
    if (!isStaff) return;
    try {
      await updateDoc(doc(db, 'reviews', review.id), { status: action, moderatedBy: user?.uid, moderatedAt: serverTimestamp() });
      await logAction('review.moderate', 'reviews', review.id, { action });
      toast.success('Yorum guncellendi.');
      loadAll();
    } catch { toast.error('Guncelleme basarisiz.'); }
  };

  const resolveReport = async (report: any, action: 'resolved' | 'dismissed') => {
    if (!isStaff) return;
    try {
      await updateDoc(doc(db, 'reports', report.id), { status: action, resolvedBy: user?.uid, resolvedAt: serverTimestamp() });
      await logAction('report.resolve', 'reports', report.id, { action });
      toast.success('Rapor guncellendi.');
      loadAll();
    } catch { toast.error('Guncelleme basarisiz.'); }
  };

  const addUserNote = async (u: any) => {
    if (!isStaff || !userNote.trim()) return;
    const existingNotes = Array.isArray(u.adminNotes) ? u.adminNotes : [];
    const newNote = { note: userNote.trim(), addedBy: user?.uid, addedAt: new Date().toISOString() };
    try {
      await updateDoc(doc(db, 'users', u.id), { adminNotes: [...existingNotes, newNote], updatedAt: serverTimestamp() });
      await logAction('user.addNote', 'users', u.id, newNote);
      toast.success('Not eklendi.');
      setUserNote('');
      loadAll();
    } catch { toast.error('Not eklenemedi.'); }
  };

  const createCoupon = async () => {
    const code = window.prompt('Kupon kodu:');
    const discount = Number(window.prompt('Indirim orani (%):'));
    if (!code || !discount) return;
    try {
      await addDoc(collection(db, 'coupons'), { code: code.trim().toUpperCase(), discount, type: 'percent', active: true, usedCount: 0, createdBy: user?.uid, createdAt: serverTimestamp() });
      await logAction('coupon.create', 'coupons', 'new', { code, discount });
      toast.success('Kupon olusturuldu.');
    } catch { toast.error('Kupon olusturulamadi.'); }
  };

  const saveSettings = async () => {
    if (!isStaff) return;
    try {
      await setDoc(doc(db, 'siteSettings', 'global'), { ...siteSettings, updatedAt: serverTimestamp(), updatedBy: user?.uid || '' }, { merge: true });
      await logAction('siteSettings.update', 'siteSettings', 'global', siteSettings);
      toast.success('Site ayarlari kaydedildi.');
    } catch {
      toast.error('Site ayarlari kaydedilemedi.');
    }
  };

  // Filtered data
  const filteredUsers = useMemo(() => {
    let result = users;
    if (userFilter.search) {
      result = result.filter((u) =>
        (u.username || '').toLowerCase().includes(userFilter.search.toLowerCase()) ||
        u.id.includes(userFilter.search) ||
        (u.email || '').toLowerCase().includes(userFilter.search.toLowerCase())
      );
    }
    if (userFilter.role !== 'all') result = result.filter((u) => u.role === userFilter.role);
    if (userFilter.status !== 'all') result = result.filter((u) => (u.accountStatus || 'active') === userFilter.status);
    return result;
  }, [users, userFilter]);

  if (loading) return <div className="text-center py-20 text-white">Yukleniyor...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStaff) {
    return (
      <div className="max-w-2xl mx-auto bg-[#1a1b23] border border-white/10 rounded-2xl p-8 text-center mt-20">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <div className="text-2xl font-bold text-white mb-2">Yetkisiz Erisim</div>
        <p className="text-gray-400 mb-5">Admin paneline sadece moderator veya admin hesaplar erisebilir.</p>
        <Link to="/">
          <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">Ana Sayfaya Don</Button>
        </Link>
      </div>
    );
  }

  const sidebarGroups = [
    {
      label: 'GENEL',
      items: [
        { k: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { k: 'reports', label: 'Raporlar', icon: TrendingUp },
      ]
    },
    {
      label: 'KULLANICILAR',
      items: [
        { k: 'users', label: 'Kullanicilar', icon: Users, badge: users.filter(u => u.kycStatus === 'pending').length },
        { k: 'kyc', label: 'KYC / Kimlik', icon: FileCheck, badge: kycQueue.filter(k => k.status === 'pending').length },
      ]
    },
    {
      label: 'PAZAR',
      items: [
        { k: 'moderation', label: 'Ilan Moderasyon', icon: Package, badge: products.filter(p => p.moderationStatus === 'pending').length },
        { k: 'orders', label: 'Siparisler', icon: ShoppingBag, badge: orders.filter(o => o.status === 'pending').length },
        { k: 'reviews', label: 'Yorumlar', icon: Star },
        { k: 'stores', label: 'Magazalar', icon: Store, badge: storeApplications.filter(s => s.status === 'pending').length },
      ]
    },
    {
      label: 'FİNANS',
      items: [
        { k: 'withdrawals', label: 'Cekim Talepleri', icon: Wallet, badge: withdrawals.filter(w => w.status === 'Beklemede').length },
        { k: 'finance', label: 'Finans & Islemler', icon: CreditCard },
      ]
    },
    {
      label: 'DESTEK',
      items: [
        { k: 'support', label: 'Destek Ticketlari', icon: MessageSquare, badge: tickets.filter(t => t.status === 'open').length },
        { k: 'disputes', label: 'Uyusmazliklar', icon: Gavel, badge: openDisputesCount },
      ]
    },
    {
      label: 'İÇERİK',
      items: [
        { k: 'categories', label: 'Kategoriler', icon: Layers },
        { k: 'campaigns', label: 'Kampanya & Cekilis', icon: Gift },
        { k: 'notifications', label: 'Bildirimler', icon: Bell },
      ]
    },
    {
      label: 'GÜVENLİK',
      items: [
        { k: 'security', label: 'Guvenlik & Raporlar', icon: Shield, badge: reportedContent.filter(r => r.status === 'pending').length },
        { k: 'logs', label: 'Admin Loglari', icon: Activity },
      ]
    },
    {
      label: 'SİSTEM',
      items: [
        { k: 'settings', label: 'Site Ayarlari', icon: Settings },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#111218] flex flex-col">
      {/* Top Header */}
      <div className="bg-[#1a1b23] border-b border-white/10 sticky top-0 z-50 h-14 flex items-center px-4 gap-4">
        <button onClick={() => setSidebarOpen(p => !p)} className="text-gray-400 hover:text-white transition-colors">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        <Shield className="w-6 h-6 text-[#5b68f6]" />
        <h1 className="text-lg font-bold text-white">Admin Panel</h1>
        <RoleBadge role={profile?.role || 'user'} />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="border-white/10 text-white hover:bg-white/5">
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} /> Yenile
          </Button>
          <Link to="/">
            <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
              <LogOut className="w-4 h-4 mr-1" /> Siteye Don
            </Button>
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'} bg-[#1a1b23] border-r border-white/10 flex-shrink-0 transition-all duration-200 flex flex-col`}>
          <ScrollArea className="flex-1 py-3">
            {sidebarGroups.map(group => (
              <div key={group.label} className="mb-4">
                <p className="text-[10px] font-semibold text-gray-500 px-4 mb-1 tracking-wider">{group.label}</p>
                {group.items.map(({ k, label, icon: Icon, badge }: any) => (
                  <button
                    key={k}
                    onClick={() => setTabParam(k as TabKey)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-all ${
                      tab === k
                        ? 'bg-[#5b68f6]/15 text-[#8b95ff] border-r-2 border-[#5b68f6]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{label}</span>
                    {badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">{badge}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </ScrollArea>
        </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
      <div className="p-6">
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b68f6]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* DASHBOARD TAB */}
            {tab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Toplam Kullanici" value={users.length.toLocaleString()} icon={Users} color="blue" />
                  <StatCard title="Bekleyen Cekim" value={withdrawals.filter(w => w.status === 'Beklemede').length} icon={Wallet} color="amber" />
                  <StatCard title="Onay Bekleyen Ilan" value={products.filter(p => p.moderationStatus === 'pending').length} icon={Package} color="purple" />
                  <StatCard title="Acik Ticket" value={tickets.filter(t => t.status === 'open').length} icon={MessageSquare} color="red" />
                </div>

                <Card className="bg-[#1a1b23] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Hizli Erisim</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button onClick={() => setTabParam('users')} className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
                      <Users className="w-6 h-6" /><span>Kullanicilar</span>
                    </Button>
                    <Button onClick={() => setTabParam('withdrawals')} className="h-20 flex flex-col items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20">
                      <Wallet className="w-6 h-6" /><span>Cekimler</span>
                    </Button>
                    <Button onClick={() => setTabParam('moderation')} className="h-20 flex flex-col items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20">
                      <Package className="w-6 h-6" /><span>Ilanlar</span>
                    </Button>
                    <Button onClick={() => setTabParam('support')} className="h-20 flex flex-col items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                      <MessageSquare className="w-6 h-6" /><span>Destek</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1b23] border-white/10">
                  <CardHeader><CardTitle className="text-white">Son Aktiviteler</CardTitle></CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {adminLogs.slice(0, 20).map((log) => (
                          <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#111218]">
                            <div className="w-2 h-2 rounded-full bg-[#5b68f6] mt-2" />
                            <div className="flex-1">
                              <p className="text-sm text-white"><span className="font-medium">{log.action}</span> <span className="text-gray-400">{log.entity}</span></p>
                              <p className="text-xs text-gray-500">{log.createdAt?.toDate?.() ? format(log.createdAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Kullanici Yonetimi</CardTitle>
                    <CardDescription className="text-gray-400">Kullanicilari yonetin ve rollerini duzenleyin</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={userFilter.search}
                      onChange={(e) => setUserFilter(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Kullanici ara..."
                      className="w-[250px] bg-[#111218] border-white/10"
                    />
                    <Select value={userFilter.role} onValueChange={(v) => setUserFilter(prev => ({ ...prev, role: v }))}>
                      <SelectTrigger className="w-[140px] bg-[#111218] border-white/10"><SelectValue placeholder="Rol" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tum Roller</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="user">Kullanici</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={userFilter.status} onValueChange={(v) => setUserFilter(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger className="w-[140px] bg-[#111218] border-white/10"><SelectValue placeholder="Durum" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tum Durumlar</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="frozen">Dondurulmus</SelectItem>
                        <SelectItem value="banned">Banlanmis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-gray-400">Kullanici</TableHead>
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Rol</TableHead>
                        <TableHead className="text-gray-400">Durum</TableHead>
                        <TableHead className="text-gray-400">KYC</TableHead>
                        <TableHead className="text-gray-400 text-right">Islemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id} className="border-white/10">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#5b68f6] flex items-center justify-center text-white font-medium">
                                {(u.username || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{u.username}</p>
                                <p className="text-xs text-gray-500">{u.id.slice(0, 8)}...</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400">{u.email}</TableCell>
                          <TableCell><RoleBadge role={u.role} /></TableCell>
                          <TableCell><StatusBadge status={u.accountStatus || 'active'} /></TableCell>
                          <TableCell><StatusBadge status={u.kycStatus || 'none'} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline" className="border-white/10 text-gray-400 hover:text-white" onClick={() => { setSelectedUser(u); setUserModalOpen(true); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {u.accountStatus !== 'banned' && (
                                <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => updateUser(u, { accountStatus: 'banned' }, 'user.ban')}>
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              {u.accountStatus === 'banned' && (
                                <Button size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" onClick={() => updateUser(u, { accountStatus: 'active' }, 'user.unban')}>
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* WITHDRAWALS TAB */}
            {tab === 'withdrawals' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Para Cekim Talepleri</CardTitle>
                    <CardDescription className="text-gray-400">Kullanicilarin para cekim taleplerini yonetin</CardDescription>
                  </div>
                  <Select value={withdrawalFilter} onValueChange={setWithdrawalFilter}>
                    <SelectTrigger className="w-[150px] bg-[#111218] border-white/10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tumu</SelectItem>
                      <SelectItem value="Beklemede">Bekleyen</SelectItem>
                      <SelectItem value="Onaylandi">Onaylanan</SelectItem>
                      <SelectItem value="Reddedildi">Reddedilen</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-gray-400">Kullanici</TableHead>
                        <TableHead className="text-gray-400">Tutar</TableHead>
                        <TableHead className="text-gray-400">IBAN</TableHead>
                        <TableHead className="text-gray-400">Tarih</TableHead>
                        <TableHead className="text-gray-400">Durum</TableHead>
                        <TableHead className="text-gray-400 text-right">Islem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals
                        .filter(w => withdrawalFilter === 'all' || w.status === withdrawalFilter)
                        .map((w) => (
                        <TableRow key={w.id} className="border-white/10">
                          <TableCell className="text-white">{w.userId?.slice(0, 8)}...</TableCell>
                          <TableCell className="text-white font-medium">{(Number(w.amount) || 0).toFixed(2)} TL</TableCell>
                          <TableCell className="text-gray-400">{w.iban || 'N/A'}</TableCell>
                          <TableCell className="text-gray-400">
                            {w.createdAt?.toDate?.() ? format(w.createdAt.toDate(), 'dd.MM.yyyy', { locale: tr }) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={w.status === 'Beklemede' ? 'pending' : w.status === 'Onaylandi' ? 'completed' : 'rejected'} />
                          </TableCell>
                          <TableCell className="text-right">
                            {w.status === 'Beklemede' && (
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" onClick={() => updateWithdrawalStatus(w, 'Onaylandi')}>
                                  <CheckCircle className="w-4 h-4 mr-1" /> Onayla
                                </Button>
                                <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => updateWithdrawalStatus(w, 'Reddedildi')}>
                                  <XCircle className="w-4 h-4 mr-1" /> Reddet
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* MODERATION TAB */}
            {tab === 'moderation' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Ilan Moderasyonu</CardTitle>
                  <CardDescription className="text-gray-400">Onay bekleyen ilanlari inceleyin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {products.filter(p => p.moderationStatus === 'pending').map((p) => (
                      <Card key={p.id} className="bg-[#111218] border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              {p.imageUrls?.[0] && (
                                <img src={p.imageUrls[0]} alt="" className="w-20 h-20 rounded-lg object-cover" />
                              )}
                              <div>
                                <h3 className="text-white font-medium">{p.title}</h3>
                                <p className="text-sm text-gray-400">{p.description?.slice(0, 100)}...</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400">{p.price} TL</Badge>
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400">{p.category}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" onClick={() => moderateProduct(p, 'approved')}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Onayla
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => moderateProduct(p, 'rejected')}>
                                <XCircle className="w-4 h-4 mr-1" /> Reddet
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {products.filter(p => p.moderationStatus === 'pending').length === 0 && (
                      <div className="text-center py-10 text-gray-400">Onay bekleyen ilan bulunmuyor.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* KYC TAB */}
            {tab === 'kyc' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">KYC Basvurulari</CardTitle>
                  <CardDescription className="text-gray-400">Kimlik dogrulama basvurularini inceleyin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {kycQueue.filter(k => k.status === 'pending').map((k) => (
                      <Card key={k.id} className="bg-[#111218] border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#5b68f6] flex items-center justify-center text-white font-bold">
                                {(k.fullName || 'K')[0]}
                              </div>
                              <div>
                                <h3 className="text-white font-medium">{k.fullName}</h3>
                                <p className="text-sm text-gray-400">{k.userId?.slice(0, 8)}...</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" onClick={() => reviewKyc(k, 'verified')}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Onayla
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => reviewKyc(k, 'rejected')}>
                                <XCircle className="w-4 h-4 mr-1" /> Reddet
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {kycQueue.filter(k => k.status === 'pending').length === 0 && (
                      <div className="text-center py-10 text-gray-400">Bekleyen KYC basvurusu bulunmuyor.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUPPORT TAB */}
            {tab === 'support' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Destek Talepleri</CardTitle>
                  <CardDescription className="text-gray-400">Kullanici destek ticketlerini yonetin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {tickets.filter(t => t.status === 'open').map((t) => (
                      <Card key={t.id} className="bg-[#111218] border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-white font-medium">{t.subject}</h3>
                              <p className="text-sm text-gray-400 mt-1">{t.description?.slice(0, 150)}...</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400">{t.priority || 'Normal'}</Badge>
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-400">{t.category}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20" onClick={() => { setSelectedTicket(t); setTicketReplyOpen(true); }}>
                                <MessageSquare className="w-4 h-4 mr-1" /> Cevap Ver
                              </Button>
                              <Button size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" onClick={() => closeTicket(t)}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Kapat
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {tickets.filter(t => t.status === 'open').length === 0 && (
                      <div className="text-center py-10 text-gray-400">Acik destek talebi bulunmuyor.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* GIVEAWAYS TAB */}
            {tab === 'giveaways' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Cekilis Yonetimi</CardTitle>
                    <CardDescription className="text-gray-400">Cekilisleri olusturun ve yonetin</CardDescription>
                  </div>
                  <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={createGiveaway}>
                    <Plus className="w-4 h-4 mr-2" /> Yeni Cekilis
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {giveaways.map((g) => (
                      <Card key={g.id} className="bg-[#111218] border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-white font-medium">{g.title}</h3>
                              <p className="text-sm text-gray-400">Odul: {g.prize}</p>
                              <p className="text-xs text-gray-500 mt-1">Katilimci: {(g.participants || []).length}</p>
                            </div>
                            <div className="flex gap-2">
                              {g.status === 'active' && !g.winner && (
                                <Button size="sm" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20" onClick={() => pickGiveawayWinner(g)}>
                                  <Gift className="w-4 h-4 mr-1" /> Kazanan Sec
                                </Button>
                              )}
                              {g.winner && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Kazanan: {g.winner.slice(0, 8)}...</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {giveaways.length === 0 && (
                      <div className="text-center py-10 text-gray-400">Henüz cekilis bulunmuyor.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DISPUTES TAB */}
            {tab === 'disputes' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Uyusmazlik Yonetimi</CardTitle>
                  <CardDescription className="text-gray-400">Acilan uyusmazlik kayitlarini inceleyin ve sonuclandirin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {disputes.map((d) => {
                      const disputeStatus = String(d.status || 'open').toLowerCase();
                      const isOpen = ['open', 'active', 'pending'].includes(disputeStatus);
                      return (
                        <Card key={d.id} className="bg-[#111218] border-white/10">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Siparis</Badge>
                                  <span className="text-sm text-gray-400">{d.orderId || 'Siparis baglantisi yok'}</span>
                                </div>
                                <h3 className="text-white font-medium">{d.reason || 'Uyuşmazlık nedeni belirtilmemiş.'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div className="text-gray-400">Alici: <span className="text-white">{d.buyerId || '-'}</span></div>
                                  <div className="text-gray-400">Satici: <span className="text-white">{d.sellerId || '-'}</span></div>
                                  <div className="text-gray-400">Durum: <span className="text-white">{disputeStatus}</span></div>
                                  <div className="text-gray-400">Tarih: <span className="text-white">{d.createdAt?.toDate?.() ? format(d.createdAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : 'N/A'}</span></div>
                                </div>
                                {d.resolutionNote && (
                                  <p className="text-xs text-gray-500 border border-white/5 rounded-lg p-3">Karar notu: {d.resolutionNote}</p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 lg:justify-end">
                                <StatusBadge status={isOpen ? 'open' : disputeStatus} />
                                {isOpen && (
                                  <>
                                    <Button size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" onClick={() => resolveDispute(d, 'resolved')}>
                                      <CheckCircle className="w-4 h-4 mr-1" /> Coz
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => resolveDispute(d, 'rejected')}>
                                      <XCircle className="w-4 h-4 mr-1" /> Reddet
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {disputes.length === 0 && (
                      <div className="text-center py-10 text-gray-400">Uyusmazlik kaydi bulunmuyor.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FINANCE TAB */}
            {tab === 'finance' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Finans Islemleri</CardTitle>
                    <CardDescription className="text-gray-400">Tum finansal islemleri goruntuleyin</CardDescription>
                  </div>
                  <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={createManualTransaction}>
                    <Plus className="w-4 h-4 mr-2" /> Manuel Islem
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-gray-400">Tarih</TableHead>
                        <TableHead className="text-gray-400">Kullanici</TableHead>
                        <TableHead className="text-gray-400">Tur</TableHead>
                        <TableHead className="text-gray-400">Tutar</TableHead>
                        <TableHead className="text-gray-400">Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 50).map((t) => (
                        <TableRow key={t.id} className="border-white/10">
                          <TableCell className="text-gray-400">
                            {t.createdAt?.toDate?.() ? format(t.createdAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: tr }) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-white">{t.userId?.slice(0, 8)}...</TableCell>
                          <TableCell className="text-gray-400">{t.type}</TableCell>
                          <TableCell className={`font-medium ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.amount > 0 ? '+' : ''}{(Number(t.amount) || 0).toFixed(2)} TL
                          </TableCell>
                          <TableCell><StatusBadge status={t.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* LOGS TAB */}
            {tab === 'logs' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Admin Loglari</CardTitle>
                  <CardDescription className="text-gray-400">Admin ve moderator aktiviteleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {adminLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-[#111218] border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-[#5b68f6]" />
                          <div className="flex-1">
                            <p className="text-sm text-white">
                              <span className="font-medium text-[#5b68f6]">{log.action}</span>
                              <span className="text-gray-400"> on </span>
                              <span className="text-gray-300">{log.entity}</span>
                              <span className="text-gray-400"> ({log.entityId?.slice(0, 8)}...)</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.actorRole} • {log.createdAt?.toDate?.() ? format(log.createdAt.toDate(), 'dd.MM.yyyy HH:mm:ss', { locale: tr }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* ORDERS TAB */}
            {tab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Sipariş Yönetimi</h2>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-40 bg-[#1a1b23] border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="pending">Bekleyen</SelectItem>
                      <SelectItem value="completed">Tamamlanan</SelectItem>
                      <SelectItem value="cancelled">İptal</SelectItem>
                      <SelectItem value="disputed">İhtilaf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard title="Toplam Sipariş" value={orders.length} icon={ShoppingBag} color="blue" />
                  <StatCard title="Bekleyen" value={orders.filter(o=>o.status==='pending').length} icon={Inbox} color="amber" />
                  <StatCard title="Tamamlanan" value={orders.filter(o=>o.status==='completed').length} icon={CheckCircle} color="green" />
                  <StatCard title="İhtilaf" value={orders.filter(o=>o.status==='disputed').length} icon={AlertTriangle} color="red" />
                </div>
                <Card className="bg-[#1a1b23] border-white/10">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-gray-400">Sipariş ID</TableHead>
                          <TableHead className="text-gray-400">Alıcı</TableHead>
                          <TableHead className="text-gray-400">Satıcı</TableHead>
                          <TableHead className="text-gray-400">Tutar</TableHead>
                          <TableHead className="text-gray-400">Durum</TableHead>
                          <TableHead className="text-gray-400">Tarih</TableHead>
                          <TableHead className="text-gray-400 text-right">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).map(o => (
                          <TableRow key={o.id} className="border-white/10">
                            <TableCell className="text-gray-400 font-mono text-xs">{o.id.slice(0,10)}...</TableCell>
                            <TableCell className="text-white">{o.buyerId?.slice(0,8) || '-'}</TableCell>
                            <TableCell className="text-white">{o.sellerId?.slice(0,8) || '-'}</TableCell>
                            <TableCell className="text-white font-medium">{(Number(o.amount||o.total)||0).toFixed(2)} TL</TableCell>
                            <TableCell><StatusBadge status={o.status || 'pending'} /></TableCell>
                            <TableCell className="text-gray-400 text-sm">{o.createdAt?.toDate?.() ? format(o.createdAt.toDate(), 'dd.MM.yy HH:mm', {locale:tr}) : '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                {o.status === 'pending' && <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" onClick={() => updateOrderStatus(o,'completed')}><CheckCircle className="w-3 h-3 mr-1"/>Tamamla</Button>}
                                {o.status === 'pending' && <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => updateOrderStatus(o,'cancelled')}><XCircle className="w-3 h-3 mr-1"/>İptal</Button>}
                                {o.status === 'disputed' && <Button size="sm" className="bg-amber-500/10 text-amber-400 border border-amber-500/20" onClick={() => updateOrderStatus(o,'resolved')}><Gavel className="w-3 h-3 mr-1"/>Çöz</Button>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 && <p className="text-center py-10 text-gray-400">Sipariş bulunamadı.</p>}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STORES TAB */}
            {tab === 'stores' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Mağaza Yönetimi</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Store Applications */}
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2"><Inbox className="w-5 h-5 text-amber-400"/>Bekleyen Başvurular <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{storeApplications.filter(s=>s.status==='pending').length}</span></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {storeApplications.filter(s=>s.status==='pending').map(app => (
                        <div key={app.id} className="p-4 rounded-lg bg-[#111218] border border-white/10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-white font-medium">{app.storeName || 'İsimsiz Mağaza'}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Kullanıcı: {app.userId?.slice(0,8)}</p>
                              <p className="text-xs text-gray-500 mt-1">{app.description?.slice(0,80)}</p>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" onClick={() => approveStore(app,'approved')}><CheckCircle className="w-3 h-3 mr-1"/>Onayla</Button>
                              <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => approveStore(app,'rejected')}><XCircle className="w-3 h-3 mr-1"/>Reddet</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {storeApplications.filter(s=>s.status==='pending').length === 0 && <p className="text-center py-6 text-gray-400 text-sm">Bekleyen başvuru yok.</p>}
                    </CardContent>
                  </Card>
                  {/* Active Stores */}
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2"><Store className="w-5 h-5 text-blue-400"/>Aktif Mağazalar ({stores.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ScrollArea className="h-[350px]">
                        {stores.map(s => (
                          <div key={s.id} className="p-3 rounded-lg bg-[#111218] border border-white/5 mb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{s.storeName || s.id.slice(0,8)}</p>
                                <div className="flex gap-2 mt-1">
                                  <StatusBadge status={s.status || 'active'} />
                                  <span className="text-xs text-gray-500">Seviye: {s.level || 'standart'}</span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {s.status !== 'suspended' && <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => updateStore(s,{status:'suspended'})}><Ban className="w-3 h-3"/></Button>}
                                {s.status === 'suspended' && <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => updateStore(s,{status:'active'})}><CheckCircle className="w-3 h-3"/></Button>}
                              </div>
                            </div>
                          </div>
                        ))}
                        {stores.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">Henüz mağaza yok.</p>}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* CAMPAIGNS TAB */}
            {tab === 'campaigns' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Kampanya & Çekiliş</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Giveaways */}
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2"><Gift className="w-5 h-5 text-purple-400"/>Çekilişler</CardTitle>
                      <Button size="sm" className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={createGiveaway}><Plus className="w-4 h-4 mr-1"/>Yeni</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {giveaways.map(g => (
                        <div key={g.id} className="p-4 rounded-lg bg-[#111218] border border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{g.title}</p>
                              <p className="text-sm text-gray-400">Ödül: {g.prize}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Katılımcı: {(g.participants||[]).length}</p>
                            </div>
                            <div className="flex gap-2">
                              <StatusBadge status={g.status || 'active'} />
                              {g.status === 'active' && !g.winner && <Button size="sm" className="bg-purple-500/10 text-purple-400 border border-purple-500/20" onClick={() => pickGiveawayWinner(g)}><Award className="w-3 h-3 mr-1"/>Seç</Button>}
                              {g.winner && <span className="text-xs text-emerald-400">🏆 {g.winner.slice(0,8)}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                      {giveaways.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">Henüz çekiliş yok.</p>}
                    </CardContent>
                  </Card>
                  {/* Coupon Codes */}
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2"><Percent className="w-5 h-5 text-amber-400"/>Kupon Kodları</CardTitle>
                      <Button size="sm" className="bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={createCoupon}><Plus className="w-4 h-4 mr-1"/>Yeni</Button>
                    </CardHeader>
                    <CardContent>
                      <div className="p-6 text-center text-gray-400 border border-dashed border-white/10 rounded-lg">
                        <Percent className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm">Kupon kodları Firebase'de <span className="text-white font-mono">coupons</span> koleksiyonunda saklanır.</p>
                        <Button className="mt-3 bg-amber-500/10 text-amber-400 border border-amber-500/20" onClick={createCoupon}><Plus className="w-4 h-4 mr-1"/>Kupon Oluştur</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* CATEGORIES TAB */}
            {tab === 'categories' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Kategori Yönetimi</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader><CardTitle className="text-white">Yeni Kategori</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Kategori adı..." className="bg-[#111218] border-white/10 text-white" />
                      <Button className="w-full bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={addCategory} disabled={!isAdmin}><Plus className="w-4 h-4 mr-2"/>Ekle</Button>
                      {!isAdmin && <p className="text-xs text-gray-500 text-center">Sadece admin ekleyebilir.</p>}
                    </CardContent>
                  </Card>
                  <div className="lg:col-span-2">
                    <Card className="bg-[#1a1b23] border-white/10">
                      <CardHeader><CardTitle className="text-white">Mevcut Kategoriler ({categories.filter(c=>c.active!==false).length})</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {categories.filter(c=>c.active!==false).map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-[#111218] border border-white/5">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-[#5b68f6]" />
                                <span className="text-white text-sm">{cat.name}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-7 w-7 p-0" onClick={() => deleteCategory(cat)} disabled={!isAdmin}><Trash2 className="w-3 h-3"/></Button>
                              </div>
                            </div>
                          ))}
                          {categories.filter(c=>c.active!==false).length === 0 && <p className="text-gray-400 text-sm col-span-2 text-center py-8">Henüz kategori yok.</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {tab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Bildirim Yönetimi</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><Megaphone className="w-5 h-5 text-[#5b68f6]"/>Sistem Bildirimi Gönder</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Başlık</Label>
                        <Input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeholder="Bildirim başlığı..." className="bg-[#111218] border-white/10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">İçerik</Label>
                        <Textarea value={notifBody} onChange={e=>setNotifBody(e.target.value)} placeholder="Bildirim içeriği..." rows={4} className="bg-[#111218] border-white/10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Hedef Kitle</Label>
                        <Select value={notifTarget} onValueChange={setNotifTarget}>
                          <SelectTrigger className="bg-[#111218] border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                            <SelectItem value="sellers">Satıcılar</SelectItem>
                            <SelectItem value="buyers">Alıcılar</SelectItem>
                            <SelectItem value="verified">Doğrulanmış</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full bg-[#5b68f6] hover:bg-[#5b68f6]/90" onClick={sendSystemNotification} disabled={!isAdmin || !notifTitle.trim() || !notifBody.trim()}><Bell className="w-4 h-4 mr-2"/>Gönder</Button>
                      {!isAdmin && <p className="text-xs text-gray-500 text-center">Sadece admin gönderebilir.</p>}
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader><CardTitle className="text-white">Son Bildirimler</CardTitle></CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[350px]">
                        <div className="space-y-2">
                          {systemNotifications.map(n => (
                            <div key={n.id} className="p-3 rounded-lg bg-[#111218] border border-white/5">
                              <p className="text-white font-medium text-sm">{n.title}</p>
                              <p className="text-gray-400 text-xs mt-1">{n.body?.slice(0,80)}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-600">Hedef: {n.target || 'all'}</span>
                                <span className="text-xs text-gray-600">{n.sentAt?.toDate?.() ? format(n.sentAt.toDate(), 'dd.MM.yy HH:mm', {locale:tr}) : '-'}</span>
                              </div>
                            </div>
                          ))}
                          {systemNotifications.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Henüz bildirim gönderilmedi.</p>}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {tab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Güvenlik & Moderasyon</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Reported Content */}
                  <div className="lg:col-span-2">
                    <Card className="bg-[#1a1b23] border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Flag className="w-5 h-5 text-red-400"/>Raporlanan İçerikler
                          <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{reportedContent.filter(r=>r.status==='pending').length}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {reportedContent.map(r => (
                          <div key={r.id} className="p-4 rounded-lg bg-[#111218] border border-white/10">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <StatusBadge status={r.status || 'pending'} />
                                  <span className="text-xs text-gray-500">{r.type || 'içerik'}</span>
                                </div>
                                <p className="text-white text-sm">{r.reason || 'Neden belirtilmedi'}</p>
                                <p className="text-gray-500 text-xs mt-1">Rapor eden: {r.reporterId?.slice(0,8) || '-'} • Hedef: {r.targetId?.slice(0,8) || '-'}</p>
                              </div>
                              {r.status === 'pending' && (
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => resolveReport(r,'resolved')}><CheckCircle className="w-3 h-3"/></Button>
                                  <Button size="sm" variant="outline" className="border-gray-500/20 text-gray-400" onClick={() => resolveReport(r,'dismissed')}><XCircle className="w-3 h-3"/></Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {reportedContent.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Rapor yok.</p>}
                      </CardContent>
                    </Card>
                  </div>
                  {/* Banned Words */}
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><Hash className="w-5 h-5 text-orange-400"/>Yasaklı Kelimeler</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Input value={newBannedWord} onChange={e=>setNewBannedWord(e.target.value)} placeholder="Kelime..." className="bg-[#111218] border-white/10 text-white" onKeyDown={e=>e.key==='Enter'&&addBannedWord()} />
                        <Button className="bg-[#5b68f6] hover:bg-[#5b68f6]/90 px-3" onClick={addBannedWord} disabled={!isAdmin}><Plus className="w-4 h-4"/></Button>
                      </div>
                      <ScrollArea className="h-[280px]">
                        <div className="flex flex-wrap gap-2">
                          {bannedWords.map(word => (
                            <div key={word} className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                              <span className="text-red-400 text-xs">{word}</span>
                              <button onClick={() => removeBannedWord(word)} className="text-red-400 hover:text-red-300 ml-0.5"><XCircle className="w-3 h-3"/></button>
                            </div>
                          ))}
                          {bannedWords.length === 0 && <p className="text-gray-400 text-sm w-full text-center py-4">Yasaklı kelime yok.</p>}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {tab === 'reviews' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Yorum & Puan Yönetimi</h2>
                <Card className="bg-[#1a1b23] border-white/10">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-gray-400">Kullanıcı</TableHead>
                          <TableHead className="text-gray-400">Hedef</TableHead>
                          <TableHead className="text-gray-400">Puan</TableHead>
                          <TableHead className="text-gray-400">Yorum</TableHead>
                          <TableHead className="text-gray-400">Durum</TableHead>
                          <TableHead className="text-gray-400 text-right">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map(r => (
                          <TableRow key={r.id} className="border-white/10">
                            <TableCell className="text-white">{r.reviewerId?.slice(0,8) || '-'}</TableCell>
                            <TableCell className="text-white">{r.targetId?.slice(0,8) || r.productId?.slice(0,8) || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-white text-sm">{r.rating || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm max-w-[200px] truncate">{r.comment || r.text || '-'}</TableCell>
                            <TableCell><StatusBadge status={r.status || 'active'} /></TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                {r.status !== 'deleted' && <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => moderateReview(r,'deleted')}><Trash2 className="w-3 h-3"/></Button>}
                                {r.status === 'deleted' && <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => moderateReview(r,'approved')}><CheckCircle className="w-3 h-3"/></Button>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {reviews.length === 0 && <p className="text-center py-10 text-gray-400">Henüz yorum yok.</p>}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* REPORTS TAB */}
            {tab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Raporlama & Analiz</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard title="Toplam Kullanıcı" value={users.length} icon={Users} color="blue" />
                  <StatCard title="Toplam İlan" value={products.length} icon={Package} color="purple" />
                  <StatCard title="Toplam Sipariş" value={orders.length} icon={ShoppingBag} color="green" />
                  <StatCard title="Toplam İşlem" value={transactions.length} icon={CreditCard} color="amber" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader><CardTitle className="text-white">Kullanıcı Büyüme Trendi</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={[
                          ...Array.from({length:7},(_,i)=>{
                            const d = new Date(); d.setDate(d.getDate()-6+i);
                            const label = format(d,'dd.MM',{locale:tr});
                            const count = users.filter(u => { try { const cd = u.createdAt?.toDate?.(); return cd && format(cd,'dd.MM',{locale:tr}) === label; } catch { return false; } }).length;
                            return {label, count};
                          })
                        ]} margin={{top:5,right:10,left:-10,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="label" tick={{fill:'#9ca3af',fontSize:11}} />
                          <YAxis tick={{fill:'#9ca3af',fontSize:11}} />
                          <Tooltip contentStyle={{background:'#1a1b23',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'#fff'}} />
                          <Area type="monotone" dataKey="count" stroke="#5b68f6" fill="#5b68f620" strokeWidth={2} name="Yeni Kullanıcı" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader><CardTitle className="text-white">Sipariş Durumu Dağılımı</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={[
                          {name:'Bekleyen', value: orders.filter(o=>o.status==='pending').length},
                          {name:'Tamamlanan', value: orders.filter(o=>o.status==='completed').length},
                          {name:'İptal', value: orders.filter(o=>o.status==='cancelled').length},
                          {name:'İhtilaf', value: orders.filter(o=>o.status==='disputed').length},
                        ]} margin={{top:5,right:10,left:-10,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="name" tick={{fill:'#9ca3af',fontSize:11}} />
                          <YAxis tick={{fill:'#9ca3af',fontSize:11}} />
                          <Tooltip contentStyle={{background:'#1a1b23',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'#fff'}} />
                          <Bar dataKey="value" fill="#5b68f6" radius={[4,4,0,0]} name="Sipariş" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader><CardTitle className="text-white">En Aktif Kategoriler</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from(products.reduce((acc,p)=>{const k=p.category||'Diğer';acc.set(k,(acc.get(k)||0)+1);return acc;},new Map<string,number>())).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([cat,count])=>(
                          <div key={cat} className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm flex-1 truncate">{cat}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#5b68f6] rounded-full" style={{width:`${Math.min(100,(count/Math.max(products.length,1))*100*5)}%`}} />
                            </div>
                            <span className="text-white text-sm w-8 text-right">{count}</span>
                          </div>
                        ))}
                        {products.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Veri yok.</p>}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#1a1b23] border-white/10">
                    <CardHeader><CardTitle className="text-white">Finansal Özet</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {label:'Toplam İşlem Hacmi', value: transactions.reduce((s,t)=>s+Math.abs(Number(t.amount||0)),0).toFixed(2)+' TL', icon: TrendingUp, color:'text-emerald-400'},
                        {label:'Bekleyen Çekim', value: withdrawals.filter(w=>w.status==='Beklemede').reduce((s,w)=>s+Number(w.amount||0),0).toFixed(2)+' TL', icon: Wallet, color:'text-amber-400'},
                        {label:'Onaylanan Çekim', value: withdrawals.filter(w=>w.status==='Onaylandi').reduce((s,w)=>s+Number(w.amount||0),0).toFixed(2)+' TL', icon: CheckCircle, color:'text-blue-400'},
                        {label:'İptal Edilen Sipariş', value: orders.filter(o=>o.status==='cancelled').length+' adet', icon: XCircle, color:'text-red-400'},
                      ].map(({label,value,icon:Icon,color})=>(
                        <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-[#111218]">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className="text-gray-400 text-sm">{label}</span>
                          </div>
                          <span className={`font-medium ${color}`}>{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {tab === 'settings' && (
              <Card className="bg-[#1a1b23] border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Site Ayarlari</CardTitle>
                    <CardDescription className="text-gray-400">Genel site ayarlarini duzenleyin</CardDescription>
                  </div>
                  <Button onClick={saveSettings} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">Kaydet</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-[#111218] border-white/10">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-white">Bakim Modu</Label>
                          <Switch
                            checked={siteSettings.maintenanceMode}
                            onCheckedChange={(v) => setSiteSettings((p: any) => ({ ...p, maintenanceMode: v }))}
                          />
                        </div>
                        <Textarea
                          value={siteSettings.maintenanceMessage || ''}
                          onChange={(e) => setSiteSettings((p: any) => ({ ...p, maintenanceMessage: e.target.value }))}
                          placeholder="Bakim mesaji"
                          className="bg-[#1a1b23] border-white/10 text-white"
                        />
                      </CardContent>
                    </Card>
                    <Card className="bg-[#111218] border-white/10">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-white">Canli Destek</Label>
                          <Switch
                            checked={siteSettings.floatingChatEnabled}
                            onCheckedChange={(v) => setSiteSettings((p: any) => ({ ...p, floatingChatEnabled: v }))}
                          />
                        </div>
                        <Input
                          value={siteSettings.topBarMessage || ''}
                          onChange={(e) => setSiteSettings((p: any) => ({ ...p, topBarMessage: e.target.value }))}
                          placeholder="TopBar mesaji"
                          className="bg-[#1a1b23] border-white/10 text-white"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      </div>
      </div>

      {/* User Detail Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Kullanici Detayi</DialogTitle>
            <DialogDescription className="text-gray-400">Kullanici bilgilerini goruntuleyin ve duzenleyin</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#5b68f6] flex items-center justify-center text-2xl font-bold">
                  {(selectedUser.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.username}</h3>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-1">
                    <RoleBadge role={selectedUser.role} />
                    <StatusBadge status={selectedUser.accountStatus || 'active'} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[#111218] border-white/10 p-3">
                  <p className="text-sm text-gray-400">Bakiye</p>
                  <p className="text-xl font-bold text-white">{(selectedUser.balance || 0).toFixed(2)} TL</p>
                </Card>
                <Card className="bg-[#111218] border-white/10 p-3">
                  <p className="text-sm text-gray-400">KYC Durumu</p>
                  <StatusBadge status={selectedUser.kycStatus || 'none'} />
                </Card>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Rol Atama</Label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateUser(selectedUser, { role: 'admin' }, 'user.roleToAdmin')} disabled={!isAdmin} className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20">Admin Yap</Button>
                  <Button size="sm" onClick={() => updateUser(selectedUser, { role: 'moderator' }, 'user.roleToModerator')} disabled={!isAdmin} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">Moderator Yap</Button>
                  <Button size="sm" onClick={() => updateUser(selectedUser, { role: 'user' }, 'user.roleToUser')} className="bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border border-gray-500/20">Standart Kullanici</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Hesap Durumu</Label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateUser(selectedUser, { accountStatus: 'active' }, 'user.activate')} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20">Aktif Et</Button>
                  <Button size="sm" onClick={() => updateUser(selectedUser, { accountStatus: 'frozen' }, 'user.freeze')} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">Dondur</Button>
                  <Button size="sm" onClick={() => updateUser(selectedUser, { accountStatus: 'banned' }, 'user.ban')} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">Banla</Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserModalOpen(false)} className="border-white/10 text-white hover:bg-white/5">Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Reply Modal */}
      <Dialog open={ticketReplyOpen} onOpenChange={setTicketReplyOpen}>
        <DialogContent className="bg-[#1a1b23] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket'a Cevap Ver</DialogTitle>
            <DialogDescription className="text-gray-400">{selectedTicket?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#111218] border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Kullanıcı Mesajı:</p>
              <p className="text-white text-sm">{selectedTicket?.description}</p>
            </div>
            <Textarea
              value={ticketReply}
              onChange={e => setTicketReply(e.target.value)}
              placeholder="Cevabınızı yazın..."
              rows={5}
              className="bg-[#111218] border-white/10 text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketReplyOpen(false)} className="border-white/10 text-white hover:bg-white/5">İptal</Button>
            <Button onClick={replyToTicket} disabled={!ticketReply.trim()} className="bg-[#5b68f6] hover:bg-[#5b68f6]/90">Gönder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
