import { Link } from 'react-router-dom';

type Category = {
  id: string;
  title: string;
  count: string;
  icon: string;
  color: string;
  link: string;
};

const categories: Category[] = [
  { id: '1', title: 'MMO Oyunlar', count: '2,890 ilan', icon: '⚔️', color: 'bg-emerald-700', link: '/ilan-pazari?q=MMO' },
  { id: '2', title: 'Mobil Oyunlar', count: '6,540 ilan', icon: '📱', color: 'bg-orange-500', link: '/ilan-pazari?q=Mobil' },
  { id: '3', title: 'Platformlar', count: '3,780 ilan', icon: '🖥️', color: 'bg-purple-700', link: '/ilan-pazari?q=Platform' },
  { id: '4', title: 'Boost Hizmetleri', count: '2,150 ilan', icon: '⚡', color: 'bg-red-600', link: '/ilan-pazari?q=Boost' },
  { id: '5', title: 'League of Legends', count: '7,430 ilan', icon: '👑', color: 'bg-yellow-600', link: '/ilan-pazari?q=LoL' },
  { id: '6', title: 'Roblox', count: '6,700 ilan', icon: '🎮', color: 'bg-emerald-600', link: '/roblox' },
  { id: '7', title: 'Valorant', count: '8,320 ilan', icon: '🎯', color: 'bg-red-500', link: '/ilan-pazari?q=Valorant' },
  { id: '8', title: 'Pubg Mobile', count: '4,200 ilan', icon: '🔫', color: 'bg-orange-600', link: '/ilan-pazari?q=PUBG' },
  { id: '9', title: 'Brawl Stars', count: '3,800 ilan', icon: '⭐', color: 'bg-blue-600', link: '/ilan-pazari?q=Brawl' },
  { id: '10', title: 'Discord', count: '5,100 ilan', icon: '💬', color: 'bg-indigo-500', link: '/ilan-pazari?q=Discord' },
  { id: '11', title: 'Growtopia', count: '2,900 ilan', icon: '🌱', color: 'bg-green-600', link: '/ilan-pazari?q=Growtopia' },
  { id: '12', title: 'Steam', count: '9,200 ilan', icon: '🎮', color: 'bg-slate-700', link: '/ilan-pazari?q=Steam' },
  { id: '13', title: 'Mobile Legends', count: '2,100 ilan', icon: '⚔️', color: 'bg-blue-700', link: '/ilan-pazari?q=Mobile+Legends' },
  { id: '14', title: 'Clash of Clans', count: '1,800 ilan', icon: '🏰', color: 'bg-green-700', link: '/ilan-pazari?q=Clash' },
  { id: '15', title: 'Minecraft', count: '3,100 ilan', icon: '⛏️', color: 'bg-emerald-800', link: '/ilan-pazari?q=Minecraft' },
];

export default function PopularCategories() {
  return (
    <section className="pt-2 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Popüler Kategoriler</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.link}
            className={`${category.color} rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform duration-300 shadow-lg relative overflow-hidden`}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-50"></div>
            
            <div className="text-4xl mb-3 relative z-10 group-hover:scale-110 transition-transform drop-shadow-lg">
              {category.icon}
            </div>
            <h3 className="text-white font-bold text-sm mb-1 relative z-10">
              {category.title}
            </h3>
            <span className="text-white/70 text-[11px] relative z-10">
              {category.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
