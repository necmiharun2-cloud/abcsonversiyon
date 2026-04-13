import { Info, ChevronRight, TrendingUp, Clock, Star } from "lucide-react";
import ListingCard from "./ListingCard";
import { Link } from "react-router-dom";

const listings = [
  { title: "⚡2021 Kurulum⭐ Bilgileri Değişen Discord Hesap", category: "Discord", seller: "GuvenilirMarket", price: "39,90 ₺", oldPrice: "120,00 ₺", imageColor: "bg-gradient-to-br from-indigo-600/40 to-violet-700/30", emoji: "💬" },
  { title: "✅715✅ (500) Robux KOMİSYON BİZDEN", category: "Roblox", seller: "RedlyStore", price: "199,90 ₺", oldPrice: "294,90 ₺", imageColor: "bg-gradient-to-br from-green-600/40 to-emerald-700/30", emoji: "🎮" },
  { title: "⭐[GARANTİLİ] INSTAGRAM 1000 TAKİPÇİ⭐", category: "Instagram", seller: "Eson", price: "30,00 ₺", oldPrice: "99,90 ₺", imageColor: "bg-gradient-to-br from-pink-600/40 to-rose-700/30", emoji: "📸" },
  { title: "1 Aylık Xbox GamePass + Garanti", category: "Microsoft", seller: "UnrankedSelf", price: "30,00 ₺", imageColor: "bg-gradient-to-br from-green-600/40 to-lime-700/30", emoji: "🎮" },
  { title: "⭐️50 ADET OUTLOOK HESABI⭐️[SORUNSUZ]", category: "Mail Hesapları", seller: "GuvenilirMarket", price: "39,90 ₺", oldPrice: "145,00 ₺", imageColor: "bg-gradient-to-br from-blue-600/40 to-sky-700/30", emoji: "📧" },
  { title: "⭐️(KENDİ MAİLİNİZE) CHATGPT PRO 5.2 + GPT-5o", category: "OpenAI", seller: "Eson", price: "149,90 ₺", oldPrice: "399,90 ₺", imageColor: "bg-gradient-to-br from-emerald-600/40 to-teal-700/30", emoji: "🤖" },
  { title: "⭐75-100 SKIN | 30 LEVEL | MAIL DEGISEN HESAP⭐", category: "LoL Random Hesap", seller: "FollowTurk", price: "327,90 ₺", oldPrice: "527,90 ₺", imageColor: "bg-gradient-to-br from-amber-600/40 to-yellow-700/30", emoji: "👑" },
  { title: "⭐️Mail Değişen⭐️50-75 Skin Fortnite Random", category: "Fortnite Random Hesap", seller: "OpssGamerShop", price: "99,90 ₺", oldPrice: "400,00 ₺", imageColor: "bg-gradient-to-br from-purple-600/40 to-fuchsia-700/30", emoji: "🎮" },
  { title: "⭐2X | KİCK CANLI YAYIN PAKETİ TREND 1⭐", category: "Kick", seller: "GuvenilirMarket", price: "15,00 ₺", oldPrice: "45,00 ₺", imageColor: "bg-gradient-to-br from-green-500/40 to-emerald-600/30", emoji: "📺" },
  { title: "⭐️ Envato 1 Aylık ⭐️ Ana Sağlayıcıdan", category: "Envato", seller: "EsatBey", price: "74,90 ₺", imageColor: "bg-gradient-to-br from-teal-600/40 to-cyan-700/30", emoji: "🎭" },
  { title: "⭐✅%100TR 200-300 SKİN BIÇAKLI VALORANT RANDOM", category: "Valorant Random Hesap", seller: "RedlyStore", price: "179,90 ₺", oldPrice: "324,90 ₺", imageColor: "bg-gradient-to-br from-red-600/40 to-pink-700/30", emoji: "🎯" },
  { title: "✨10 MILYON BASKENT ALTINI | HIZLI TESLIMAT✨", category: "Clash Of Clans", seller: "LynaxStore", price: "119,00 ₺", imageColor: "bg-gradient-to-br from-yellow-600/40 to-amber-700/30", emoji: "🏰" },
  { title: "Red Dead Redemption 2 [RDR 2]", category: "Red Dead Online RDR2", seller: "SenTinusStore", price: "30,00 ₺", oldPrice: "80,00 ₺", imageColor: "bg-gradient-to-br from-red-700/40 to-rose-800/30", emoji: "🤠" },
  { title: "1 Aylık Minecraft Premium", category: "Minecraft", seller: "UnrankedSelf", price: "30,00 ₺", imageColor: "bg-gradient-to-br from-emerald-600/40 to-green-700/30", emoji: "⛏️" },
  { title: "⚡(MAİL DEGİSEN) 5+10 YIL ROZETLİ CS2☢️HESABI⚡", category: "CS2 Hesap Satışı", seller: "Eson", price: "199,90 ₺", oldPrice: "399,90 ₺", imageColor: "bg-gradient-to-br from-orange-600/40 to-yellow-700/30", emoji: "🔫" },
  { title: "⭐500 YOUTUBE ABONE(GARANTİLİ)⭐", category: "Youtube", seller: "LoesalStore", price: "44,90 ₺", imageColor: "bg-gradient-to-br from-red-600/40 to-red-800/30", emoji: "▶️" },
  { title: "Office 2024 Pro Plus - Ömür Boyu Sınırsız", category: "Ofis Programları", seller: "EsatBey", price: "109,00 ₺", imageColor: "bg-gradient-to-br from-blue-600/40 to-indigo-700/30", emoji: "📝" },
  { title: "⭐100 İnstagram Türk Takipçi - KEŞFET ETKİLİ⭐", category: "Instagram", seller: "GuvenilirMarket", price: "39,90 ₺", oldPrice: "69,90 ₺", imageColor: "bg-gradient-to-br from-pink-500/40 to-orange-600/30", emoji: "📸" },
  { title: "İstediğiniz 3 Oyun + Oto Teslim & Garanti", category: "Steam", seller: "RollyStore", price: "60,00 ₺", oldPrice: "240,00 ₺", imageColor: "bg-gradient-to-br from-sky-600/40 to-blue-700/30", emoji: "🎮" },
  { title: "⚡CS2 25.000+ SAAT OYNAMA SURESI☢️GARANTİLİ⚡", category: "CS2 Hesap Satışı", seller: "Eson", price: "349,90 ₺", oldPrice: "599,90 ₺", imageColor: "bg-gradient-to-br from-orange-700/40 to-red-800/30", emoji: "🔫" },
];

const FeaturedListings = () => {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-lg font-bold text-foreground">Vitrin İlanları</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span>15.432 aktif ilan</span>
          </div>
        </div>
        <Link to="/ilan-pazari" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
          Tümünü Gör <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Info className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Binlerce vitrin ilanını kategori ayrımı olmadan görüntülüyorsunuz.
          </p>
          <p className="text-xs text-muted-foreground">
            Yukarıdan kategori seçimi yaparak istediğiniz kategorideki vitrin ilanları görüntüleyebilirsiniz.
          </p>
        </div>
        <a href="#" className="shrink-0 px-4 py-2 rounded-xl bg-success/20 text-success text-sm font-medium hover:bg-success/30 transition-colors whitespace-nowrap hidden sm:block">
          💎 Vitrin İlanı Nedir?
        </a>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Son güncelleme: 2 dk önce</span>
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-accent" /> Ortalama puan: 4.7</span>
        <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-success" /> Bugün 1.234 satış</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {listings.map((listing, i) => (
          <ListingCard key={i} {...listing} />
        ))}
      </div>

      {/* Load more */}
      <div className="flex justify-center pt-2">
        <button className="px-6 py-2.5 rounded-xl bg-secondary text-muted-foreground text-sm font-medium hover:text-foreground hover:bg-muted transition-colors">
          Daha Fazla Göster
        </button>
      </div>
    </div>
  );
};

export default FeaturedListings;
