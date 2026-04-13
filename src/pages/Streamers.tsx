import { 
  Users, Star, Play, Heart, X, Search, Youtube, Twitch, Instagram, 
  Filter, ChevronDown, ExternalLink, Gift, Tv
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { avatarImage } from '../lib/media';

// Kick icon as SVG component
function KickIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 3h9v4.5h3v9h-3V21h-9v-4.5h-3v-9h3V3zm1.5 1.5v4.5H6v6h3v4.5h6v-4.5h3v-6h-3V4.5H9z"/>
    </svg>
  );
}

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  );
}

const PLATFORMS = [
  { id: 'all', label: 'Tümü', icon: Filter },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { id: 'twitch', label: 'Twitch', icon: Twitch, color: 'text-purple-500' },
  { id: 'kick', label: 'Kick', icon: Tv, color: 'text-green-500' },
  { id: 'tiktok', label: 'TikTok', icon: TikTokIcon, color: 'text-pink-500' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-orange-500' },
];

const STREAMERS_DATA = [
  { 
    id: 'creamofburak', 
    name: 'CreamOfBurak', 
    bio: 'Merhabalar, ben Burak ve 21 yaşındayım. İş olarak Youtube üzerinden Roblox oyununda içerik üretiyorum.',
    avatar: avatarImage('CB'), 
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    platforms: ['youtube'], 
    followers: '125K',
    giveaways: 15,
    supporters: 2340,
    isFeatured: true,
    isLive: false
  },
  { 
    id: 'barookitv', 
    name: 'Barookitv', 
    bio: 'Burada sıkılmak yok!',
    avatar: avatarImage('BA'), 
    cover: 'https://images.unsplash.com/photo-1538481199705-726c2e1c28f3?w=800',
    platforms: ['youtube', 'kick'], 
    followers: '89K',
    giveaways: 12,
    supporters: 1820,
    isFeatured: true,
    isLive: true
  },
  { 
    id: 'eren-akpinar', 
    name: 'Eren Akpınar', 
    bio: 'Burada sıkılmak yok!',
    avatar: avatarImage('EA'), 
    cover: 'https://images.unsplash.com/photo-1511512573710-622d67d49613?w=800',
    platforms: ['youtube', 'kick'], 
    followers: '45K',
    giveaways: 8,
    supporters: 980,
    isFeatured: false,
    isLive: true
  },
  { 
    id: 'xhzdury', 
    name: 'Xhzdury', 
    bio: 'Bilgisayar oyuncusuyum düzenli yayınlara başladım',
    avatar: avatarImage('XH'), 
    cover: 'https://images.unsplash.com/photo-1552820728-8b83bb6b-f745?w=800',
    platforms: ['kick', 'tiktok'], 
    followers: '32K',
    giveaways: 5,
    supporters: 650,
    isFeatured: false,
    isLive: false
  },
  { 
    id: 'specxgod', 
    name: 'SpecXGod', 
    bio: 'Instagram\'da SpecXGod adıyla Valorant odaklı eğlenceli ve rekabetçi içerikler üretiyorum',
    avatar: avatarImage('SX'), 
    cover: 'https://images.unsplash.com/photo-1542751110-97427ebec73a?w=800',
    platforms: ['instagram'], 
    followers: '78K',
    giveaways: 10,
    supporters: 1420,
    isFeatured: false,
    isLive: false
  },
  { 
    id: 'dortlupres', 
    name: 'DörtlüPres', 
    bio: 'Burada sıkılmak yok!',
    avatar: avatarImage('DP'), 
    cover: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=800',
    platforms: ['youtube', 'kick', 'instagram', 'tiktok'], 
    followers: '156K',
    giveaways: 22,
    supporters: 3100,
    isFeatured: false,
    isLive: true
  },
  { 
    id: 'mrbrown57', 
    name: 'MrBrown57', 
    bio: 'Ben sürekli Knight Online yayınları açarım.',
    avatar: avatarImage('MB'), 
    cover: 'https://images.unsplash.com/photo-1518709268483-bd4a1c647ac6?w=800',
    platforms: ['youtube'], 
    followers: '23K',
    giveaways: 3,
    supporters: 480,
    isFeatured: false,
    isLive: false
  },
  { 
    id: 'xbalex24', 
    name: 'xBalex24', 
    bio: 'Merhabalar Ben Mert',
    avatar: avatarImage('XB'), 
    cover: 'https://images.unsplash.com/photo-1560419595-20c566e4c26e?w=800',
    platforms: ['youtube', 'kick', 'twitch'], 
    followers: '67K',
    giveaways: 9,
    supporters: 1250,
    isFeatured: false,
    isLive: false
  },
  { 
    id: 'aleratha', 
    name: 'Aleratha', 
    bio: 'Müzik önerilerinize açığım, yayınlara beklerim.',
    avatar: avatarImage('AL'), 
    cover: 'https://images.unsplash.com/photo-1493225457124-a3b07e4a23b8?w=800',
    platforms: ['kick', 'twitch', 'youtube'], 
    followers: '41K',
    giveaways: 7,
    supporters: 890,
    isFeatured: false,
    isLive: true
  },
  { 
    id: 'flight-doctor', 
    name: 'Flight Doctor', 
    bio: 'Microsoft Flight Simulator, Grand Theft Auto V ve Counter-Strike yayını yapıyor.',
    avatar: avatarImage('FD'), 
    cover: 'https://images.unsplash.com/photo-1569161031678-f49b4b8ca1d2?w=800',
    platforms: ['kick', 'tiktok', 'instagram', 'youtube'], 
    followers: '94K',
    giveaways: 18,
    supporters: 2150,
    isFeatured: false,
    isLive: true
  },
  { 
    id: 'biuenelol', 
    name: 'Biuene', 
    bio: 'Merhaba, ben Ömer. Sezon 3\'ten beri League of Legends oynuyorum. Kafa dağıtma odaklı yayınlar yapıyorum.',
    avatar: avatarImage('BI'), 
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    platforms: ['twitch', 'kick', 'instagram'], 
    followers: '38K',
    giveaways: 6,
    supporters: 720,
    isFeatured: false,
    isLive: false
  },
  { 
    id: 'canxplode', 
    name: 'CanXplode', 
    bio: 'Taklit Misali Canlı Yayın',
    avatar: avatarImage('CX'), 
    cover: 'https://images.unsplash.com/photo-1511512573710-622d67d49613?w=800',
    platforms: ['kick', 'tiktok', 'instagram'], 
    followers: '52K',
    giveaways: 11,
    supporters: 1680,
    isFeatured: false,
    isLive: true
  },
];

function getPlatformIcon(platform: string, className: string = 'w-4 h-4') {
  switch (platform) {
    case 'youtube':
      return <Youtube className={`${className} text-red-500`} />;
    case 'twitch':
      return <Twitch className={`${className} text-purple-500`} />;
    case 'kick':
      return <Tv className={`${className} text-green-500`} />;
    case 'tiktok':
      return <TikTokIcon className={`${className} text-pink-500`} />;
    case 'instagram':
      return <Instagram className={`${className} text-orange-500`} />;
    default:
      return null;
  }
}

export default function Streamers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [application, setApplication] = useState({
    platform: 'Twitch',
    channelUrl: '',
    followers: '',
    message: ''
  });

  const filteredStreamers = useMemo(() => {
    let result = STREAMERS_DATA;
    
    if (activePlatform !== 'all') {
      result = result.filter(s => s.platforms.includes(activePlatform));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.bio.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [searchQuery, activePlatform]);

  const featuredStreamers = STREAMERS_DATA.filter(s => s.isFeatured);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!application.channelUrl || !application.followers) {
      toast.error('Lütfen gerekli alanları doldurun.');
      return;
    }
    toast.success('Başvurunuz başarıyla alındı! Ekibimiz en kısa sürede sizinle iletişime geçecektir.');
    setIsModalOpen(false);
    setApplication({ platform: 'Twitch', channelUrl: '', followers: '', message: '' });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1a1b23] via-[#2a3050] to-[#1a1b23] rounded-2xl border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Favori Yayıncılarını Keşfet
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                En iyi içerik üreticilerini takip et, canlı yayınlarını izle ve destekle
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all"
            >
              <Play className="w-5 h-5" />
              Yeni Yayıncı Başvurusu
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#111218] rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">2,032</p>
              <p className="text-xs text-gray-400">Aktif Yayıncı</p>
            </div>
            <div className="bg-[#111218] rounded-xl p-4 text-center">
              <Gift className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">4,445</p>
              <p className="text-xs text-gray-400">Çekiliş</p>
            </div>
            <div className="bg-[#111218] rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">102</p>
              <p className="text-xs text-gray-400">İş Birliği</p>
            </div>
            <div className="bg-[#111218] rounded-xl p-4 text-center">
              <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">50K+</p>
              <p className="text-xs text-gray-400">Destekleyen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Platform Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full sm:w-auto">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activePlatform === platform.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-[#1a1b23] text-gray-300 hover:bg-[#23242f] hover:text-white border border-white/5'
              }`}
            >
              {platform.id !== 'all' && <platform.icon className={`w-4 h-4 ${activePlatform === platform.id ? 'text-white' : platform.color}`} />}
              {platform.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Yayıncı ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1b23] border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors" 
          />
        </div>
      </div>

      {/* Featured Streamers */}
      {activePlatform === 'all' && !searchQuery && featuredStreamers.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Öne Çıkan Yayıncılar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredStreamers.map((streamer) => (
              <Link
                key={streamer.id}
                to={`/destekle/${streamer.id}`}
                className="group bg-[#1a1b23] hover:bg-[#23242f] border border-white/5 hover:border-purple-500/30 rounded-xl overflow-hidden transition-all"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="relative shrink-0">
                    <img 
                      src={streamer.avatar} 
                      alt={streamer.name} 
                      className="w-16 h-16 rounded-full border-2 border-purple-500/30 group-hover:border-purple-500 transition-colors" 
                    />
                    {streamer.isLive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        CANLI
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold group-hover:text-purple-400 transition-colors">{streamer.name}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2 mt-1">{streamer.bio}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {streamer.platforms.map(p => getPlatformIcon(p))}
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-600 rotate-[-90deg] group-hover:text-purple-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Streamers */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {activePlatform !== 'all' || searchQuery ? 'Arama Sonuçları' : 'Tüm Yayıncılar'}
        </h2>
        
        {filteredStreamers.length === 0 ? (
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-8 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Yayıncı bulunamadı</p>
            <p className="text-gray-500 text-sm mt-1">Farklı filtreler deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStreamers.map((streamer) => (
              <Link
                key={streamer.id}
                to={`/destekle/${streamer.id}`}
                className="group bg-[#1a1b23] hover:bg-[#23242f] border border-white/5 hover:border-purple-500/30 rounded-xl overflow-hidden transition-all"
              >
                {/* Cover Image */}
                <div className="relative h-24 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                  <img 
                    src={streamer.cover} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                  />
                  {streamer.isLive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      CANLI
                    </div>
                  )}
                  {/* Avatar */}
                  <div className="absolute -bottom-6 left-4">
                    <img 
                      src={streamer.avatar} 
                      alt={streamer.name} 
                      className="w-12 h-12 rounded-full border-4 border-[#1a1b23] group-hover:border-purple-500 transition-colors" 
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="pt-8 pb-4 px-4">
                  <h3 className="text-white font-bold text-sm group-hover:text-purple-400 transition-colors truncate">
                    {streamer.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">{streamer.bio}</p>
                  
                  {/* Platform Icons */}
                  <div className="flex items-center gap-1.5 mt-3">
                    {streamer.platforms.map(p => getPlatformIcon(p, 'w-4 h-4'))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-white font-bold text-xs">{streamer.followers}</p>
                      <p className="text-gray-500 text-[10px]">Takipçi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-xs">{streamer.giveaways}</p>
                      <p className="text-gray-500 text-[10px]">Çekiliş</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-xs">{streamer.supporters}</p>
                      <p className="text-gray-500 text-[10px]">Destekleyen</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Application CTA */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Play className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yayıncı mı olmak istiyorsunuz?</h3>
              <p className="text-gray-400 text-sm">Hemen başvurun ve binlerce kullanıcıya ulaşın!</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all"
          >
            <Heart className="w-5 h-5" />
            Başvuru Yap
          </button>
        </div>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1b23] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <h3 className="text-xl font-bold text-white">Yayıncı Başvurusu</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Platform</label>
                <select 
                  value={application.platform}
                  onChange={(e) => setApplication({...application, platform: e.target.value})}
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Twitch">Twitch</option>
                  <option value="Kick">Kick</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Kanal Linki</label>
                <input 
                  type="url"
                  placeholder="https://youtube.com/kanaliniz"
                  value={application.channelUrl}
                  onChange={(e) => setApplication({...application, channelUrl: e.target.value})}
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Takipçi Sayısı</label>
                <input 
                  type="text"
                  placeholder="Örn: 10.000"
                  value={application.followers}
                  onChange={(e) => setApplication({...application, followers: e.target.value})}
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mesajınız (Opsiyonel)</label>
                <textarea 
                  rows={3}
                  placeholder="Bize kendinizden bahsedin..."
                  value={application.message}
                  onChange={(e) => setApplication({...application, message: e.target.value})}
                  className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-purple-500/25"
              >
                Başvuruyu Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
