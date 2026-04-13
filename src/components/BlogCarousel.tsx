import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const articles = [
  { title: "VALORANT VP Kod Rehberi: Satın Alma, Etkinleştirme ve Bölge Farkları", date: "3 Nis 2026", gradient: "from-red-600 to-pink-600", desc: "VALORANT VP, oyunun premium para birimidir. Oyuncular gerçek para karşılığında bu puanları satın alarak..." },
  { title: "ARC Raiders Flashpoint Güncellemesi 2026: Yeni Operasyonlar", date: "3 Nis 2026", gradient: "from-cyan-600 to-blue-600", desc: "Flashpoint güncellemesinin merkezinde devrim niteliğinde bir ARC operasyonu var..." },
  { title: "League of Legends Haftalık Kostüm İndirimleri: 31 Mart - 6 Nisan", date: "1 Nis 2026", gradient: "from-amber-500 to-yellow-600", desc: "Riot Games, LoL ekosistemindeki oyuncular için her hafta düzenli olarak indirimler sunuyor..." },
  { title: "Wuthering Waves Xbox Temmuz 2026'da Geliyor", date: "31 Mar 2026", gradient: "from-purple-600 to-violet-600", desc: "Mart 2026'da düzenlenen Xbox Partner Preview etkinliği ile duyuruldu..." },
  { title: "Crimson Desert Yaması 1.01.00: 5 Yeni Binek ve Güncellemeler", date: "31 Mar 2026", gradient: "from-orange-600 to-red-600", desc: "Crimson Desert'ın yeni yaması, topluluğun yoğun talepleri doğrultusunda yenilikler sundu..." },
  { title: "3D Secure Neden Önemli? Güvenli Online Ödeme Rehberi", date: "30 Mar 2026", gradient: "from-emerald-500 to-teal-600", desc: "Günümüz dünyasında siber dolandırıcılık yöntemleri her geçen gün daha sofistike hale gelmektedir..." },
  { title: "Minecraft Dungeons 2 Duyuruldu: Yepyeni Co-op Macera!", date: "27 Mar 2026", gradient: "from-green-500 to-lime-600", desc: "Minecraft evreninin sınırlarını genişleten Minecraft Dungeons 2, ilk oyunun başarısının üzerine..." },
  { title: "CS2 Dead Hand Güncellemesi ile 22 Yeni Eldiven ve 17 Skin!", date: "14 Mar 2026", gradient: "from-orange-500 to-amber-600", desc: "Valve, CS2 için Dead Hand Koleksiyonu ile geniş çaplı kozmetik geliştirmeler sundu..." },
];

const BlogCarousel = () => {
  const [offset, setOffset] = useState(0);
  const visible = 4;
  const max = Math.max(0, articles.length - visible);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-lg font-bold text-foreground">Oyun Haberleri & Blog</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(Math.max(0, offset - 1))} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setOffset(Math.min(max, offset + 1))} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link to="/blog" className="text-sm text-primary hover:underline ml-2">Tümü →</Link>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-4 transition-transform duration-300" style={{ transform: `translateX(-${offset * (100 / visible)}%)` }}>
          {articles.map((a, i) => (
            <Link key={i} to="/blog" className="min-w-[calc(25%-12px)] bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all group">
              <div className={`h-28 bg-gradient-to-br ${a.gradient} relative`}>
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="p-3 space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[40px]">{a.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.desc}</p>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{a.date}</p>
                  <span className="text-[10px] text-primary font-medium">Devamını gör</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogCarousel;
