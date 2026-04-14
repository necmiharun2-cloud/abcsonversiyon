import { 
  MessageSquare, PlusCircle, Headphones, ChevronRight, ChevronDown, Clock, 
  CheckCircle2, AlertCircle, X, HelpCircle, BookOpen, Shield, CreditCard,
  Package, User, Search, Mail, Phone, MessageCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, addDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const QUICK_LINKS = [
  { 
    title: 'Yardım Merkezi', 
    description: 'Sıkça sorulan sorular ve cevapları', 
    icon: HelpCircle, 
    to: '/sss',
    color: 'from-amber-500 to-orange-500',
    iconColor: 'text-amber-400'
  },
  { 
    title: 'Destek Talebi', 
    description: 'Yeni destek talebi oluşturun', 
    icon: PlusCircle, 
    to: '#create-ticket',
    color: 'from-blue-500 to-indigo-500',
    iconColor: 'text-blue-400'
  },
  { 
    title: 'Canlı Destek', 
    description: 'Anında canlı destek alın', 
    icon: MessageCircle, 
    to: '#live-support',
    color: 'from-emerald-500 to-teal-500',
    iconColor: 'text-emerald-400'
  },
  { 
    title: 'İade Talebi', 
    description: 'Ürün iadesi ve para çekme', 
    icon: CreditCard, 
    to: '/para-cekme',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-400'
  },
];

const HELP_CATEGORIES = [
  { icon: Package, label: 'İlan Satın Alma', count: 6, color: 'text-blue-400' },
  { icon: CreditCard, label: 'Para Yükleme', count: 15, color: 'text-emerald-400' },
  { icon: CashWithdrawIcon, label: 'Para Çekme', count: 4, color: 'text-amber-400' },
  { icon: User, label: 'Profil ve Hesap', count: 18, color: 'text-purple-400' },
  { icon: Shield, label: 'Güvenlik', count: 7, color: 'text-red-400' },
  { icon: BookOpen, label: 'İpuçları', count: 20, color: 'text-cyan-400' },
];

function CashWithdrawIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return <CreditCard {...props} />;
}

export default function Support() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'Genel', message: '' });
  const [tickets, setTickets] = useState<any[]>([]);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'supportTickets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(fetchedTickets);
    }, () => {
      setTickets([]);
      toast.error('Destek talepleri yüklenemedi.');
    });

    return unsubscribe;
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('Giriş yapmalısınız.');
      return;
    }
    if (!newTicket.subject.trim()) {
      toast.error('Konu alanı zorunludur.');
      return;
    }
    if (!newTicket.category.trim()) {
      toast.error('Kategori alanı zorunludur.');
      return;
    }
    if (!newTicket.message.trim()) {
      toast.error('Mesaj alanı zorunludur.');
      return;
    }

    try {
      await addDoc(collection(db, 'supportTickets'), {
        userId: user.uid,
        subject: newTicket.subject.trim(),
        category: newTicket.category.trim(),
        message: newTicket.message.trim(),
        status: 'Beklemede',
        channel: 'ticket',
        createdAt: serverTimestamp()
      });

      setIsModalOpen(false);
      setNewTicket({ subject: '', category: 'Genel', message: '' });
      toast.success('Destek talebiniz başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('Destek talebi oluşturulurken bir hata oluştu.');
    }
  };

  const handleLiveSupport = async () => {
    if (!user) {
      toast.error('Giriş yapmalısınız.');
      return;
    }
    try {
      await addDoc(collection(db, 'supportTickets'), {
        userId: user.uid,
        category: 'Canlı Destek',
        subject: 'Canlı Destek Talebi',
        message: 'Kullanıcı canlı destek talebi başlattı.',
        status: 'queue',
        channel: 'live',
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'chats'), {
        participants: [user.uid, 'support-agent'],
        participantNames: {
          [user.uid]: user.displayName || user.email || 'Kullanıcı',
          'support-agent': 'Destek Ekibi',
        },
        participantAvatars: {
          [user.uid]: '',
          'support-agent': '',
        },
        createdAt: serverTimestamp(),
        lastMessage: 'Canlı destek talebi oluşturuldu.',
        lastMessageAt: serverTimestamp(),
      });
      toast.success('Canlı destek talebiniz kuyruğa alındı.');
      navigate('/mesajlarim');
    } catch (error) {
      toast.error('Canlı destek başlatılamadı.');
    }
  };

  return (
    <>
    <SEOHead title="Destek Sistemi" description="itemTR destek sistemi: yardım talepleri, sıkça sorulan sorular ve canlı destek." canonical="/destek-sistemi" />
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1a1b23] via-[#2a3050] to-[#1a1b23] rounded-2xl border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                  DESTEK MERKEZİ
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  7/24 Aktif
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Size Nasıl Yardımcı Olabiliriz?
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Destek taleplerinizi oluşturabilir, sıkça sorulan soruları inceleyebilir veya canlı destek ile iletişime geçebilirsiniz.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Destek Talebi Oluştur
              </button>
              <button 
                onClick={handleLiveSupport}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Canlı Destek
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Yardım konusu ara... (örn: bakiye yükleme, iade, ilan oluşturma)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111218] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_LINKS.map((link, i) => (
          <Link
            key={i}
            to={link.to}
            onClick={link.to === '#create-ticket' ? () => setIsModalOpen(true) : link.to === '#live-support' ? handleLiveSupport : undefined}
            className="group bg-[#1a1b23] hover:bg-[#23242f] border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-1">{link.title}</h3>
            <p className="text-sm text-gray-400">{link.description}</p>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1b23] p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{tickets.length}</div>
            <div className="text-xs text-gray-400">Toplam Talep</div>
          </div>
        </div>
        <div className="bg-[#1a1b23] p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'Cevaplandı').length}</div>
            <div className="text-xs text-gray-400">Cevaplanan</div>
          </div>
        </div>
        <div className="bg-[#1a1b23] p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{tickets.filter(t => t.status === 'Beklemede').length}</div>
            <div className="text-xs text-gray-400">Bekleyen</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Help Categories */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Yardım Kategorileri
              </h2>
            </div>
            <div className="p-3">
              {HELP_CATEGORIES.map((cat, i) => (
                <Link
                  key={i}
                  to="/sss"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                    <span className="text-gray-300 group-hover:text-white text-sm font-medium">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{cat.count}</span>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-white/5">
              <Link 
                to="/sss" 
                className="flex items-center justify-center gap-2 w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Tüm SSS Sayfasına Git
              </Link>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-white">Geçmiş Destek Taleplerim</h2>
              <div className="text-xs text-gray-500">Son 30 gün</div>
            </div>
            
            <div className="divide-y divide-white/5">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer" onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#111218] rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-gray-500">#{ticket.id.slice(0, 6)}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">{ticket.subject}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString('tr-TR') : 'Yeni'}
                          </span>
                          <span className={`flex items-center gap-1 font-bold ${ticket.status === 'Cevaplandı' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Cevaplandı' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {ticket.status}
                          </span>
                          <span className="text-gray-600 bg-white/5 px-2 py-0.5 rounded">{ticket.category}</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-medium shrink-0">
                      {expandedTicket === ticket.id ? 'Kapat' : 'Görüntüle'}
                      {expandedTicket === ticket.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {expandedTicket === ticket.id && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-[#111218]/50">
                      <div className="text-sm text-gray-300 whitespace-pre-wrap">
                        <span className="font-bold text-white block mb-2">Mesajınız:</span>
                        {ticket.message}
                      </div>
                      {ticket.reply && (
                        <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-sm text-gray-300 whitespace-pre-wrap">
                          <span className="font-bold text-amber-400 block mb-2">Destek Ekibi:</span>
                          {ticket.reply}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#111218] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium">Henüz destek talebiniz bulunmuyor</p>
                  <p className="text-gray-500 text-sm mt-1">Yeni talep oluşturmak için yukarıdaki butonu kullanın</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">E-posta</p>
            <p className="text-white font-bold">destek@itemtr.com</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Telefon</p>
            <p className="text-white font-bold">0850 123 45 67</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Canlı Destek</p>
            <p className="text-white font-bold">7/24 Aktif</p>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
              <h2 className="text-xl font-bold text-white">Yeni Destek Talebi</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Konu</label>
                <input 
                  type="text" 
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="Talebinizin konusunu giriniz..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Kategori</label>
                <select 
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="Genel">Genel</option>
                  <option value="Ödeme İşlemleri">Ödeme İşlemleri</option>
                  <option value="İlan İşlemleri">İlan İşlemleri</option>
                  <option value="Hesap Güvenliği">Hesap Güvenliği</option>
                  <option value="Şikayet">Şikayet</option>
                  <option value="Teknik Sorun">Teknik Sorun</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mesajınız</label>
                <textarea 
                  rows={5}
                  value={newTicket.message}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                  placeholder="Sorununuzu detaylıca açıklayınız..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-amber-500/25"
              >
                Talebi Oluştur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
