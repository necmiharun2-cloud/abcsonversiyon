import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { marketplaceCategoryHref } from "../lib/marketplaceLinks";

const megaMenuCategories = [
  {
    icon: "🔫", name: "CS2", slug: "cs2", count: "12.5K",
    items: [
      { name: "Hesap Satışı", count: "3.2K" },
      { name: "Skin Satışı", count: "4.1K" },
      { name: "Item Satışı", count: "2.8K" },
      { name: "Rank Boost", count: "1.4K" },
      { name: "Prime Hesap", count: "980" },
    ],
  },
  {
    icon: "🎯", name: "Valorant", slug: "valorant", count: "8.3K",
    items: [
      { name: "Hesap Satışı", count: "2.1K" },
      { name: "VP Satışı", count: "1.8K" },
      { name: "Rank Boost", count: "1.5K" },
      { name: "Skin Satışı", count: "1.9K" },
      { name: "Random Hesap", count: "1.0K" },
    ],
  },
  {
    icon: "🎮", name: "Roblox", slug: "roblox", count: "6.7K",
    items: [
      { name: "Robux Satışı", count: "2.5K" },
      { name: "Hesap Satışı", count: "1.8K" },
      { name: "Game Pass", count: "1.2K" },
      { name: "Item Satışı", count: "1.2K" },
    ],
  },
  {
    icon: "📸", name: "Instagram", slug: "instagram", count: "4.5K",
    items: [
      { name: "Takipçi", count: "1.5K" },
      { name: "Beğeni", count: "1.2K" },
      { name: "İzlenme", count: "980" },
      { name: "Hesap Satışı", count: "850" },
    ],
  },
  {
    icon: "🎵", name: "TikTok", slug: "tiktok", count: "3.6K",
    items: [
      { name: "Takipçi", count: "1.1K" },
      { name: "Beğeni", count: "890" },
      { name: "İzlenme", count: "760" },
      { name: "Coin Satışı", count: "850" },
    ],
  },
  {
    icon: "💬", name: "Discord", slug: "discord", count: "5.1K",
    items: [
      { name: "Nitro", count: "2.1K" },
      { name: "Server Boost", count: "1.3K" },
      { name: "Hesap Satışı", count: "980" },
      { name: "Bot Satışı", count: "710" },
    ],
  },
  {
    icon: "🎮", name: "Steam", slug: "steam", count: "9.2K",
    items: [
      { name: "Cüzdan Kodu", count: "3.4K" },
      { name: "Random Key", count: "2.8K" },
      { name: "Hesap Satışı", count: "1.7K" },
      { name: "Gift Card", count: "1.3K" },
    ],
  },
  {
    icon: "⛏️", name: "Minecraft", slug: "minecraft", count: "3.1K",
    items: [
      { name: "Premium Hesap", count: "1.2K" },
      { name: "Server Satışı", count: "780" },
      { name: "Item Satışı", count: "650" },
      { name: "Rank Satışı", count: "470" },
    ],
  },
  {
    icon: "👑", name: "LoL", slug: "lol", count: "7.4K",
    items: [
      { name: "Hesap Satışı", count: "3.2K" },
      { name: "RP Satışı", count: "2.1K" },
      { name: "Elo Boost", count: "1.3K" },
      { name: "Skin Hesap", count: "780" },
    ],
  },
  {
    icon: "📱", name: "PUBG Mobile", slug: "pubg-mobile", count: "4.2K",
    items: [
      { name: "UC Satışı", count: "1.8K" },
      { name: "Hesap Satışı", count: "1.2K" },
      { name: "Royal Pass", count: "650" },
      { name: "Skin Satışı", count: "550" },
    ],
  },
  {
    icon: "⭐", name: "Brawl Stars", slug: "brawl-stars", count: "3.8K",
    items: [
      { name: "Gems Satışı", count: "1.5K" },
      { name: "Hesap Satışı", count: "1.2K" },
      { name: "Brawl Pass", count: "650" },
      { name: "Maxlı Hesap", count: "450" },
    ],
  },
  {
    icon: "🌱", name: "Growtopia", slug: "growtopia", count: "2.9K",
    items: [
      { name: "DL Satışı", count: "1.2K" },
      { name: "Hesap Satışı", count: "850" },
      { name: "Item Satışı", count: "500" },
      { name: "Set Satışı", count: "350" },
    ],
  },
  {
    icon: "⚽", name: "FC 26", slug: "fc-26", count: "3.1K",
    items: [
      { name: "Coins Satışı", count: "1.4K" },
      { name: "Hesap Satışı", count: "890" },
      { name: "Points Satışı", count: "450" },
      { name: "Player Satışı", count: "360" },
    ],
  },
  {
    icon: "⚔️", name: "Mobile Legends", slug: "mobile-legends", count: "2.1K",
    items: [
      { name: "Diamond Satışı", count: "850" },
      { name: "Hesap Satışı", count: "650" },
      { name: "Starlight", count: "350" },
      { name: "Boost", count: "250" },
    ],
  },
  {
    icon: "🏰", name: "Clash of Clans", slug: "clash-of-clans", count: "1.8K",
    items: [
      { name: "Hesap Satışı", count: "780" },
      { name: "Altın Satışı", count: "450" },
      { name: "Gems Satışı", count: "320" },
      { name: "Clan Satışı", count: "250" },
    ],
  },
];

const MegaMenu = () => {
  const [activeCategory, setActiveCategory] = useState(megaMenuCategories[0].name);
  const activeCat = megaMenuCategories.find((c) => c.name === activeCategory);

  return (
    <div className="absolute top-full left-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-top-2 duration-200 flex" style={{ width: 700 }}>
      {/* Left sidebar */}
      <div className="w-[230px] border-r border-border py-2 shrink-0 max-h-[480px] overflow-y-auto scrollbar-hide">
        {megaMenuCategories.map((cat) => (
          <button
            key={cat.name}
            onMouseEnter={() => setActiveCategory(cat.name)}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
              activeCategory === cat.name
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span className="flex-1 text-left">{cat.name}</span>
            <span className="text-[10px] text-muted-foreground/60">{cat.count}</span>
            <ChevronRight className="h-3 w-3 opacity-40" />
          </button>
        ))}
      </div>

      {/* Right content */}
      <div className="flex-1 p-5">
        {activeCat && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeCat.icon}</span>
              <div>
                <Link to={marketplaceCategoryHref(activeCat.name, activeCat.slug)} className="text-base font-bold text-foreground hover:text-primary transition-colors">
                  {activeCat.name}
                </Link>
                <p className="text-xs text-muted-foreground">{activeCat.count} ilan</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {activeCat.items.map((item) => (
                <Link
                  key={item.name}
                  to={`/ilan-pazari?q=${encodeURIComponent(`${activeCat.name} ${item.name}`)}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors group"
                >
                  <span>{item.name}</span>
                  <span className="text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground">{item.count}</span>
                </Link>
              ))}
            </div>
            <Link
              to={marketplaceCategoryHref(activeCat.name, activeCat.slug)}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium mt-2"
            >
              Tümünü Gör <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;
