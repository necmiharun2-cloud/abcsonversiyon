import { Link } from "react-router-dom";
import { marketplaceCategoryHref } from "../lib/marketplaceLinks";

const categories = [
  { name: "CS2", slug: "cs2", count: "12,450", gradient: "from-orange-600 to-amber-700", emoji: "🔫" },
  { name: "CD Key", slug: "cd-key", count: "5,670", gradient: "from-blue-600 to-indigo-700", emoji: "🔑" },
  { name: "Hediye Kartı", slug: "hediye-kartlari", count: "3,210", gradient: "from-purple-600 to-fuchsia-700", emoji: "🎁" },
  { name: "Sosyal Medya", slug: "sosyal-medya", count: "9,870", gradient: "from-pink-500 to-rose-600", emoji: "📱" },
  { name: "Random Hesap", slug: "random-hesaplar", count: "4,320", gradient: "from-cyan-600 to-blue-700", emoji: "🎲" },
  { name: "MMO Oyunlar", slug: "mmo-oyunlar", count: "2,890", gradient: "from-emerald-600 to-green-700", emoji: "⚔️" },
  { name: "Mobil Oyunlar", slug: "mobil-oyunlar", count: "6,540", gradient: "from-yellow-500 to-orange-600", emoji: "📲" },
  { name: "Platformlar", slug: "platformlar", count: "3,780", gradient: "from-violet-600 to-purple-700", emoji: "🖥️" },
  { name: "Boost Hizmetleri", slug: "boost-hizmetleri", count: "2,150", gradient: "from-red-500 to-rose-600", emoji: "⚡" },
  { name: "League of Legends", slug: "lol", count: "7,430", gradient: "from-amber-500 to-yellow-600", emoji: "👑" },
  { name: "Roblox", slug: "roblox", count: "6,700", gradient: "from-green-500 to-emerald-600", emoji: "🎮" },
  { name: "Valorant", slug: "valorant", count: "8,320", gradient: "from-red-600 to-pink-600", emoji: "🎯" },
  { name: "Pubg Mobile", slug: "pubg-mobile", count: "4,200", gradient: "from-yellow-600 to-amber-700", emoji: "🔫" },
  { name: "Brawl Stars", slug: "brawl-stars", count: "3,800", gradient: "from-blue-500 to-cyan-600", emoji: "⭐" },
  { name: "Discord", slug: "discord", count: "5,100", gradient: "from-indigo-500 to-violet-600", emoji: "💬" },
  { name: "Growtopia", slug: "growtopia", count: "2,900", gradient: "from-lime-500 to-green-600", emoji: "🌱" },
  { name: "Steam", slug: "steam", count: "9,200", gradient: "from-slate-500 to-gray-700", emoji: "🎮" },
  { name: "Mobile Legends", slug: "mobile-legends", count: "2,100", gradient: "from-blue-600 to-sky-700", emoji: "⚔️" },
  { name: "Clash of Clans", slug: "clash-of-clans", count: "1,800", gradient: "from-yellow-500 to-green-600", emoji: "🏰" },
  { name: "Minecraft", slug: "minecraft", count: "3,100", gradient: "from-emerald-500 to-lime-600", emoji: "⛏️" },
];

const CategoryGrid = () => {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Popüler Kategoriler</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={marketplaceCategoryHref(cat.name, cat.slug)}
            className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 duration-200"
          >
            <div className={`bg-gradient-to-br ${cat.gradient} h-20 flex items-center justify-center relative`}>
              <span className="text-4xl opacity-70 group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="bg-card p-2.5 text-center">
              <p className="text-sm font-semibold text-foreground truncate">{cat.name}</p>
              <p className="text-[10px] text-muted-foreground">{cat.count} ilan</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
