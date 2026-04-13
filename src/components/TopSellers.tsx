import { Star, CheckCircle2, ChevronRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const sellers = [
  { name: "IlkanShop", rating: 4.9, sales: 12450, verified: true, emoji: "🏆", category: "CS2 & Valorant" },
  { name: "RZShop", rating: 4.8, sales: 9870, verified: true, emoji: "⭐", category: "Roblox & Sosyal Medya" },
  { name: "DigiShop", rating: 4.9, sales: 8340, verified: true, emoji: "🎬", category: "Netflix & Spotify" },
  { name: "GameVault", rating: 4.7, sales: 7650, verified: true, emoji: "🎮", category: "Steam & Minecraft" },
  { name: "SocialBoost", rating: 4.8, sales: 6230, verified: true, emoji: "📸", category: "Instagram & TikTok" },
  { name: "FurkanMarket", rating: 4.6, sales: 5120, verified: true, emoji: "🎲", category: "Random Hesaplar" },
];

const TopSellers = () => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-accent/5">
        <Crown className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-foreground">En İyi Satıcılar</span>
        <Link to="/magazalar" className="text-xs text-primary hover:underline ml-auto">Tümü →</Link>
      </div>
      <div className="divide-y divide-border">
        {sellers.map((seller, i) => (
          <Link
            key={seller.name}
            to={`/ilan-pazari?q=${encodeURIComponent(seller.name)}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg">
                {seller.emoji}
              </div>
              {i < 3 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-foreground truncate">{seller.name}</span>
                {seller.verified && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
              </div>
              <span className="text-[10px] text-muted-foreground">{seller.category}</span>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-accent fill-accent" />
                <span className="text-xs font-bold text-foreground">{seller.rating}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{(seller.sales / 1000).toFixed(1)}K</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopSellers;
