import { useState } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  'Tümü',
  'Roblox',
  'Steam',
  'Valorant Random Hesap',
  'Valorant VP',
  'PUBG Mobile UC',
  'PUBG Mobile Hesap',
  'League of Legends Hesap',
  'LoL RP',
  'Mobile Legends Diamond',
  'CS2 Prime Hesap',
  'Discord Nitro',
  'Discord Hesap',
  'Instagram Hesap',
  'TikTok Hesap',
  'Twitch Hesap',
  'YouTube Hesap',
  'Twitter Hesap',
  'Netflix Hesap',
  'Spotify Premium',
  'ChatGPT Plus',
  'Microsoft Office',
  'Windows Key',
  'Antivirus Yazılımı',
  'VPN Hesap',
  'Brawl Stars',
  'Clash of Clans',
  'Clash Royale',
  'Free Fire',
  'Fortnite',
  'Genshin Impact',
  'Honkai Star Rail',
  'Valorant Hesap',
  'Metin2',
  'Knight Online',
  'Zula',
  'Wolfteam',
  'Point Blank',
  'SAMP Server',
  'Minecraft Hesap',
  'Steam Cüzdan Kodu',
  'Riot Points',
  'Xbox Game Pass',
  'PlayStation Plus',
  'Nintendo Online',
  'EA Play',
  'Ubisoft+',
  'Oyun İtem',
  'Oyun Skin',
  'Boost Hizmeti',
  'Elo Boost',
  'Koçluk Hizmeti',
  'Hesap Güvenlik',
  'API Hizmeti',
  'Web Hosting',
  'Domain',
  'Sunucu Kiralama',
  'VPS Server',
  'Yazılım Lisansı',
  'Premium Hesap',
  'Abonelik Hizmeti',
  'Eğitim İçeriği',
  'Kurs Üyeliği',
  'Tasarım Hizmeti',
  'Video Düzenleme',
  'Seslendirme',
  'Çeviri Hizmeti',
  'Danışmanlık',
  'Reklam Hizmeti',
  'SEO Hizmeti',
  'Sosyal Medya Yönetimi',
];

export default function CategoryFilterButtons() {
  const [showAll, setShowAll] = useState(false);
  const visibleCategories = showAll ? categories : categories.slice(0, 20);

  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {visibleCategories.map((category) => (
            <Link
              key={category}
              to={category === 'Tümü' ? '/ilan-pazari' : `/ilan-pazari?q=${encodeURIComponent(category)}`}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#2d3041] text-white/70 hover:bg-[#363a4f] hover:text-white border border-white/5 hover:border-white/10 transition-all whitespace-nowrap"
            >
              {category}
            </Link>
          ))}
        </div>
        {categories.length > 20 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            {showAll ? 'Daha Az Göster' : `+${categories.length - 20} Kategori Daha`}
          </button>
        )}
      </div>
    </section>
  );
}
