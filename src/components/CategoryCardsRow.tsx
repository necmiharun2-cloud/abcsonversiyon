import { Link } from 'react-router-dom';

type CategoryCard = {
  key: string;
  label: string;
  q: string;
  img: string;
};

const cards: CategoryCard[] = [
  { key: 'roblox', label: 'Roblox', q: 'Roblox', img: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=300&q=80' },
  { key: 'valorant', label: 'Valorant', q: 'Valorant', img: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=300&q=80' },
  { key: 'pes', label: 'Pes Mobile', q: 'PES', img: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?auto=format&fit=crop&w=300&q=80' },
  { key: 'pubg', label: 'Pubg Mobile', q: 'PUBG', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80' },
  { key: 'brawl', label: 'Brawl Stars', q: 'Brawl Stars', img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=300&q=80' },
  { key: 'discord', label: 'Discord', q: 'Discord', img: 'https://images.unsplash.com/photo-1614684556447-6bf9a4cbfc69?auto=format&fit=crop&w=300&q=80' },
  { key: 'growtopia', label: 'Growtopia', q: 'Growtopia', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80' },
  { key: 'steam', label: 'Steam', q: 'Steam', img: 'https://images.unsplash.com/photo-1563013544-824ae1ddbafc?auto=format&fit=crop&w=300&q=80' },
  { key: 'mlbb', label: 'Mobile Legends', q: 'Mobile Legends', img: 'https://images.unsplash.com/photo-1542751110-974ba40c1e20?auto=format&fit=crop&w=300&q=80' },
  { key: 'coc', label: 'Clash of Clans', q: 'Clash of Clans', img: 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?auto=format&fit=crop&w=300&q=80' },
  { key: 'cs2', label: 'CS2', q: 'CS2', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80' },
  { key: 'cdkey', label: 'CD Key', q: 'CD Key', img: 'https://images.unsplash.com/photo-1485846234645-a626fd7bbebf?auto=format&fit=crop&w=300&q=80' },
  { key: 'giftcards', label: 'Hediye Kartı', q: 'Gift Card', img: 'https://images.unsplash.com/photo-1513885535103-1d9675159f58?auto=format&fit=crop&w=300&q=80' },
  { key: 'social', label: 'Sosyal Medya', q: 'Sosyal Medya', img: 'https://images.unsplash.com/photo-1611164535920-59a65cdfbe30?auto=format&fit=crop&w=300&q=80' },
  { key: 'random', label: 'Random Hesap', q: 'Random Hesap', img: 'https://images.unsplash.com/photo-1558618666fcd2-2f0cfe567f84?auto=format&fit=crop&w=300&q=80' },
  { key: 'mmo', label: 'MMO Oyunlar', q: 'MMO', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=300&q=80' },
  { key: 'mobile', label: 'Mobil Oyunlar', q: 'Mobil Oyun', img: 'https://images.unsplash.com/photo-1512941937354-749cac0b14f3?auto=format&fit=crop&w=300&q=80' },
  { key: 'platforms', label: 'Platformlar', q: 'Platform', img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=300&q=80' },
  { key: 'boost', label: 'Boost Hizmetleri', q: 'Boost', img: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?auto=format&fit=crop&w=300&q=80' },
  { key: 'lol', label: 'League of Legends', q: 'League of Legends', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80' },
];

export default function CategoryCardsRow() {
  return (
    <section className="py-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-white text-lg font-bold mb-4">KATEGORİLER</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {cards.map((card) => (
            <Link
              key={card.key}
              to={`/ilan-pazari?q=${encodeURIComponent(card.q)}`}
              className="group relative rounded-xl overflow-hidden bg-[#2d3041] border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <div className="aspect-[16/10]">
                <img
                  src={card.img}
                  alt={card.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2 bg-[#2d3041]">
                <div className="text-white text-xs sm:text-sm font-semibold text-center">{card.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
