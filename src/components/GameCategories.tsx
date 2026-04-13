import { Link } from "react-router-dom";
import { marketplaceCategoryHref } from "../lib/marketplaceLinks";

const categories = [
  { emoji: "🔫", name: "CS2", count: "12.5K", slug: "cs2" },
  { emoji: "🎯", name: "Valorant", count: "8.3K", slug: "valorant" },
  { emoji: "🎮", name: "Roblox", count: "6.7K", slug: "roblox" },
  { emoji: "📱", name: "Pubg Mobile", count: "4.2K", slug: "pubg-mobile" },
  { emoji: "⭐", name: "Brawl Stars", count: "3.8K", slug: "brawl-stars" },
  { emoji: "💬", name: "Discord", count: "5.1K", slug: "discord" },
  { emoji: "🌱", name: "Growtopia", count: "2.9K", slug: "growtopia" },
  { emoji: "👑", name: "LoL", count: "7.4K", slug: "lol" },
  { emoji: "🎮", name: "Steam", count: "9.2K", slug: "steam" },
  { emoji: "⚽", name: "FC 26", count: "3.1K", slug: "fc-26" },
  { emoji: "📸", name: "Instagram", count: "4.5K", slug: "instagram" },
  { emoji: "🎵", name: "TikTok", count: "3.6K", slug: "tiktok" },
  { emoji: "⛏️", name: "Minecraft", count: "3.1K", slug: "minecraft" },
  { emoji: "⚔️", name: "Mobile Legends", count: "2.1K", slug: "mobile-legends" },
  { emoji: "🏰", name: "Clash of Clans", count: "1.8K", slug: "clash-of-clans" },
];

const GameCategories = () => {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-5 min-w-max px-2">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={marketplaceCategoryHref(cat.name, cat.slug)}
            className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-all group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-lg">{cat.emoji}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium whitespace-nowrap">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground/60">{cat.count} ilan</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GameCategories;
