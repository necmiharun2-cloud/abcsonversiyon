import { 
  Youtube, Twitch, Instagram, Gift, AlertTriangle, Heart, 
  ChevronRight, ExternalLink, Star, Users, Play
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { avatarImage } from '../lib/media';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

// Platform icons
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  );
}

function KickIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 3h9v4.5h3v9h-3V21h-9v-4.5h-3v-9h3V3zm1.5 1.5v4.5H6v6h3v4.5h6v-4.5h3v-6h-3V4.5H9z"/>
    </svg>
  );
}

// Mock streamer data - in real app, this would come from Firestore
const STREAMER_DATA: Record<string, {
  name: string;
  bio: string;
  avatar: string;
  cover: string;
  platforms: { type: string; url: string }[];
  followers: string;
  giveaways: number;
  supporters: number;
  totalSupport: string;
  products: { id: string; title: string; image: string; price: number }[];
}> = {
  'eren-akpinar': {
    name: 'Eren Akpınar',
    bio: 'Burada sıkılmak yok!',
    avatar: avatarImage('EA'),
    cover: 'https://images.unsplash.com/photo-1511512573710-622d67d49613?w=1200',
    platforms: [
      { type: 'youtube', url: 'https://youtube.com/@erenakpinar' },
      { type: 'kick', url: 'https://kick.com/erenakpinar' },
    ],
    followers: '45K',
    giveaways: 8,
    supporters: 980,
    totalSupport: '12,500 ₺',
    products: [
      { id: '1', title: 'Valorant VP 1000', image: 'https://placehold.co/100x100/1a1d27/fff?text=VP', price: 99.99 },
      { id: '2', title: 'Steam 50 TL', image: 'https://placehold.co/100x100/1a1d27/fff?text=Steam', price: 50 },
    ],
  },
  'creamofburak': {
    name: 'CreamOfBurak',
    bio: 'Merhabalar, ben Burak ve 21 yaşındayım. İş olarak Youtube üzerinden Roblox oyununda içerik üretiyorum.',
    avatar: avatarImage('CB'),
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    platforms: [
      { type: 'youtube', url: 'https://youtube.com/@creamofburak' },
    ],
    followers: '125K',
    giveaways: 15,
    supporters: 2340,
    totalSupport: '45,200 ₺',
    products: [
      { id: '3', title: 'Roblox 800 Robux', image: 'https://placehold.co/100x100/1a1d27/fff?text=RBX', price: 119.99 },
    ],
  },
  'barookitv': {
    name: 'Barookitv',
    bio: 'Burada sıkılmak yok!',
    avatar: avatarImage('BA'),
    cover: 'https://images.unsplash.com/photo-1538481199705-726c2e1c28f3?w=1200',
    platforms: [
      { type: 'youtube', url: 'https://youtube.com/@barookitv' },
      { type: 'kick', url: 'https://kick.com/barookitv' },
    ],
    followers: '89K',
    giveaways: 12,
    supporters: 1820,
    totalSupport: '28,900 ₺',
    products: [],
  },
};

const QUICK_AMOUNTS = [10, 25, 50, 100, 250];

function getPlatformIcon(type: string, className: string = 'w-5 h-5') {
  switch (type) {
    case 'youtube':
      return <Youtube className={`${className} text-red-500`} />;
    case 'twitch':
      return <Twitch className={`${className} text-purple-500`} />;
    case 'kick':
      return <KickIcon className={`${className} text-green-500`} />;
    case 'tiktok':
      return <TikTokIcon className={`${className} text-pink-500`} />;
    case 'instagram':
      return <Instagram className={`${className} text-orange-500`} />;
    default:
      return null;
  }
}

function getPlatformName(type: string) {
  switch (type) {
    case 'youtube': return 'YouTube';
    case 'twitch': return 'Twitch';
    case 'kick': return 'Kick';
    case 'tiktok': return 'TikTok';
    case 'instagram': return 'Instagram';
    default: return type;
  }
}

export default function StreamerProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const streamer = slug ? STREAMER_DATA[slug] : null;

  useEffect(() => {
    if (profile?.username) {
      setDonorName(profile.username);
    } else if (user?.displayName) {
      setDonorName(user.displayName);
    }
  }, [profile, user]);

  if (!streamer) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-[#1a1b23] rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Yayıncı Bulunamadı</h1>
        <p className="text-gray-400 mb-6">Aradığınız yayıncı mevcut değil veya kaldırılmış olabilir.</p>
        <Link 
          to="/yayincilar" 
          className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          Yayıncılara Dön
        </Link>
      </div>
    );
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = amount || customAmount;
    if (!finalAmount || Number(finalAmount) < 1) {
      toast.error('Lütfen geçerli bir tutar girin.');
      return;
    }

    if (!message.trim() && !isAnonymous) {
      toast.error('Lütfen bir mesaj girin.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'donations'), {
        streamerId: slug,
        streamerName: streamer.name,
        donorId: user?.uid || null,
        donorName: isAnonymous ? 'Anonim' : donorName,
        message: message.trim(),
        amount: Number(finalAmount),
        createdAt: serverTimestamp(),
      });
      
      toast.success(`${streamer.name} adlı yayıncıyı ${finalAmount} ₺ ile desteklediniz!`);
      setMessage('');
      setAmount('');
      setCustomAmount('');
    } catch (error) {
      toast.error('Destek işlemi sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/" className="hover:text-white transition-colors">Anasayfa</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/yayincilar" className="hover:text-white transition-colors">Yayıncılar</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{streamer.name}</span>
      </div>

      {/* Cover & Profile Header */}
      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
          <img 
            src={streamer.cover} 
            alt="" 
            className="w-full h-full object-cover opacity-70" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] via-transparent to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            <img 
              src={streamer.avatar} 
              alt={streamer.name} 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#1a1b23]" 
            />
          </div>

          {/* Info Row */}
          <div className="pt-16 sm:pt-20 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{streamer.name}</h1>
              <p className="text-purple-400 text-sm mt-1">İtemSatış Yayıncısı</p>
              <p className="text-gray-400 text-sm mt-2 max-w-md">{streamer.bio}</p>

              {/* Platform Links */}
              <div className="flex items-center gap-3 mt-4">
                {streamer.platforms.map((platform) => (
                  <a
                    key={platform.type}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#111218] hover:bg-[#23242f] border border-white/5 px-4 py-2 rounded-lg transition-colors"
                  >
                    {getPlatformIcon(platform.type)}
                    <span className="text-sm text-gray-300">{getPlatformName(platform.type)}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  </a>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 bg-[#111218] rounded-xl px-6 py-4">
              <div className="text-center">
                <p className="text-xl font-bold text-white">{streamer.followers}</p>
                <p className="text-xs text-gray-400">Takipçi</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-white">{streamer.giveaways}</p>
                <p className="text-xs text-gray-400">Çekiliş</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-white">{streamer.supporters}</p>
                <p className="text-xs text-gray-400">Destekleyen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-red-400 font-medium">Uyarı</p>
          <p className="text-gray-400 mt-1">
            Donate aracılığıyla yayıncılara hakaret etmeniz durumunda hakkınızda Cumhuriyet savcılığı aracılığı ile soruşturma süreci başlatılır, bilgileriniz adli makamlar ile paylaşılır!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Yayıncıyı Destekle
              </h2>
            </div>

            <form onSubmit={handleDonate} className="p-6 space-y-5">
              {/* Donor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Destekleyen İsim <span className="text-gray-500">(Ekranda Görünecektir)</span>
                </label>
                <input 
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  placeholder="İsminiz..."
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isAnonymous ? 'bg-purple-500 border-purple-500' : 'border-white/20 bg-[#111218]'}`}>
                    {isAnonymous && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-gray-400">Anonim olarak destekle</span>
                </label>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mesajınız</label>
                <textarea 
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Yayıncıya iletmek istediğiniz mesaj..."
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                />
              </div>

              {/* Quick Amounts */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Hızlı Tutar Seçimi</label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setAmount(amt.toString()); setCustomAmount(''); }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        amount === amt.toString()
                          ? 'bg-purple-500 text-white'
                          : 'bg-[#111218] text-gray-300 hover:bg-[#23242f] border border-white/5'
                      }`}
                    >
                      {amt} ₺
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bağış Tutarı</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
                    placeholder="Tutar girin..."
                    min="1"
                    className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
              >
                {isSubmitting ? 'İşleniyor...' : 'Hemen Destekle!'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Total Support */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Toplam Destek</p>
                <p className="text-xl font-bold text-white">{streamer.totalSupport}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              {streamer.supporters} kişi bu yayıncıyı destekledi!
            </p>
          </div>

          {/* Products Used */}
          {streamer.products.length > 0 && (
            <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  Yayıncının Kullandığı Ürünler
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {streamer.products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-400">{product.price.toFixed(2)} ₺</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* More Streamers */}
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-bold text-white">Diğer Yayıncılar</h3>
            </div>
            <div className="p-3 space-y-2">
              {Object.entries(STREAMER_DATA)
                .filter(([id]) => id !== slug)
                .slice(0, 3)
                .map(([id, data]) => (
                  <Link
                    key={id}
                    to={`/destekle/${id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <img 
                      src={data.avatar} 
                      alt={data.name}
                      className="w-10 h-10 rounded-full" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                        {data.name}
                      </p>
                      <p className="text-xs text-gray-500">{data.followers} takipçi</p>
                    </div>
                  </Link>
                ))}
            </div>
            <div className="p-3 border-t border-white/5">
              <Link 
                to="/yayincilar"
                className="flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                <Users className="w-4 h-4" />
                Tüm Yayıncıları Gör
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
