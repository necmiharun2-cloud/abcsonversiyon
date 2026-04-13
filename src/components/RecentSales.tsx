import { useEffect, useState } from "react";
import { CheckCircle2, TrendingUp } from "lucide-react";

const salesData = [
  { buyer: "Ak***t", seller: "IlkanShop", item: "CS2 Prime Hesap", price: "149,90 ₺", emoji: "🔫", time: "2 sn" },
  { buyer: "Me***t", seller: "RZShop", item: "5000 Robux", price: "1.099,90 ₺", emoji: "🎮", time: "15 sn" },
  { buyer: "El***f", seller: "DigiShop", item: "Netflix Premium 1 Ay", price: "39,90 ₺", emoji: "🎬", time: "32 sn" },
  { buyer: "Ca***n", seller: "SocialBoost", item: "1000 İnsta Takipçi", price: "49,90 ₺", emoji: "📸", time: "45 sn" },
  { buyer: "Ze***p", seller: "GameVault", item: "Valorant VP 1000", price: "199,90 ₺", emoji: "🎯", time: "1 dk" },
  { buyer: "Ha***n", seller: "FurkanMarket", item: "Steam Random Key", price: "14,90 ₺", emoji: "🎲", time: "1 dk" },
  { buyer: "Se***a", seller: "PremiumShop", item: "Spotify Premium 1 Ay", price: "29,90 ₺", emoji: "🎧", time: "2 dk" },
  { buyer: "Bu***k", seller: "Waif", item: "Discord Nitro", price: "89,90 ₺", emoji: "💬", time: "2 dk" },
  { buyer: "De***z", seller: "UCMarket", item: "PUBG 6000 UC", price: "599,90 ₺", emoji: "🔫", time: "3 dk" },
  { buyer: "Tu***a", seller: "AIStore", item: "ChatGPT Plus 1 Ay", price: "199,90 ₺", emoji: "🤖", time: "3 dk" },
  { buyer: "Ya***z", seller: "GamerTR", item: "Brawl Stars Gems", price: "79,90 ₺", emoji: "⭐", time: "4 dk" },
  { buyer: "Ay***e", seller: "MarcusStore", item: "LoL RP 1380", price: "249,90 ₺", emoji: "👑", time: "5 dk" },
];

const RecentSales = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((prev) => (prev + 1) % salesData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-success/10 border-b border-border">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-sm font-semibold text-foreground">Son Satışlar</span>
        <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-success" />
          Canlı
        </span>
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
      </div>
      <div className="relative h-[216px] overflow-hidden">
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${offset * 36}px)` }}
        >
          {[...salesData, ...salesData].map((sale, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 h-[36px] text-xs hover:bg-secondary/50 transition-colors"
            >
              <span className="text-sm">{sale.emoji}</span>
              <span className="text-muted-foreground min-w-0 truncate">
                <span className="text-foreground font-medium">{sale.buyer}</span>
                {" → "}
                <span className="text-primary font-medium">{sale.seller}</span>
              </span>
              <span className="text-muted-foreground truncate flex-1 hidden sm:block">{sale.item}</span>
              <span className="text-accent font-bold whitespace-nowrap">{sale.price}</span>
              <span className="text-muted-foreground/60 whitespace-nowrap text-[10px]">{sale.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentSales;
