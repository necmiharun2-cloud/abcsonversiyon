import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const reviews = [
  { name: "ggBetaShark6524", rating: 5, title: "Harika platform", text: "Play store parasıyla ödeme yapılabilsin lütfen. Çok iyi bir site!", date: "2 gün önce" },
  { name: "Midas27", rating: 5, title: "Mükemmel deneyim", text: "İtemSatış, güvenilir ve hızlı bir alışveriş deneyimi sunuyor. Ürün çeşitliliği ve müşteri odaklı yaklaşımı ile her zaman kaliteli hizmet.", date: "3 gün önce" },
  { name: "Sitetampo", rating: 5, title: "İTEMSATIS GİBİSİ YÜZ YILDA BİR GELİR", text: "Gerçekten hem alıcılara hem de satıcılara gerekli destek kusursuz sağlanıyor, her ikisine de aynı değer veriliyor.", date: "5 gün önce" },
  { name: "elwf3", rating: 4, title: "Güvenli ve kaliteli", text: "SenTinusStore'dan alışveriş yaptım hızlı iletişime geçiliyor gayet güvenilir bir mağaza ve itemsatış da güvenilir.", date: "1 hafta önce" },
  { name: "RysieShop", rating: 4, title: "Genel olarak iyi", text: "Site genel olarak güzel, canlı destek biraz daha ilgili olabilir ama genel memnuniyet yüksek.", date: "1 hafta önce" },
  { name: "heniske0606", rating: 5, title: "Çok güvenilir", text: "Çok güvenilir sitedir, şiddetle tavsiye ederim herkese. Alışverişlerim her zaman sorunsuz oldu.", date: "2 hafta önce" },
];

const CustomerReviews = () => {
  const [offset, setOffset] = useState(0);
  const visible = 3;
  const max = Math.max(0, reviews.length - visible);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-accent rounded-full" />
          <h2 className="text-lg font-bold text-foreground">İtemSatış Müşteri Yorumları</h2>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm font-bold text-accent">4.7</span>
            <span className="text-xs text-muted-foreground">Toplam 601 Müşteri Yorumu</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(Math.max(0, offset - 1))} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setOffset(Math.min(max, offset + 1))} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <Link to="#" className="text-sm text-primary hover:underline ml-2">Tüm Yorumlar</Link>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-4 transition-transform duration-300" style={{ transform: `translateX(-${offset * (100 / visible)}%)` }}>
          {reviews.map((r, i) => (
            <div key={i} className="min-w-[calc(33.333%-11px)] bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {r.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">{r.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-3 w-3 ${j < r.rating ? "text-accent fill-accent" : "text-muted"}`} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{r.title}</p>
                <div className="relative">
                  <Quote className="h-3 w-3 text-muted-foreground/30 absolute -left-0.5 -top-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed pl-3">{r.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
