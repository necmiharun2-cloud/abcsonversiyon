import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Gamepad2, CreditCard, Coins, Shield, Sparkles } from "lucide-react";

const slides = [
  {
    title: "CD Key'lerde",
    subtitle: "%95'e Varan İndirim",
    description: "Orijinal oyun CD Key'lerini en uygun fiyatlarla satın alın. Steam, Origin, Uplay ve daha fazlası!",
    cta: "Hemen Al",
    ctaLink: "/cd-key",
    icon: Gamepad2,
    bg: "from-violet-900 via-purple-900/80 to-indigo-950",
    accent: "bg-violet-500",
    badge: "🎮 Popüler",
  },
  {
    title: "Güvenli Alışveriş",
    subtitle: "Kripto ile Öde",
    description: "Bitcoin, USDT ve diğer kripto paralar ile güvenle ödeme yapın. Anında bakiye yükleme!",
    cta: "Fırsatları Gör",
    ctaLink: "/firsatlar",
    icon: CreditCard,
    bg: "from-emerald-900 via-teal-900/80 to-cyan-950",
    accent: "bg-emerald-500",
    badge: "🔒 Güvenli",
  },
  {
    title: "Oyun İçi Eşyalarınızla",
    subtitle: "Bakiye Yükleyin",
    description: "CS2, RUST ve DOTA 2 skinlerinizi değerlendirin. Güvenli pazaryerinde bakiyenizi yükleyin!",
    cta: "Bakiye Yükle",
    ctaLink: "/bakiye-yukle",
    icon: Coins,
    bg: "from-blue-900 via-indigo-900/80 to-slate-950",
    accent: "bg-blue-500",
    badge: "💰 Yeni",
  },
  {
    title: "Sosyal Medya",
    subtitle: "Takipçi & Beğeni",
    description: "Instagram, TikTok, YouTube ve Twitter için organik takipçi, beğeni ve izlenme hizmetleri.",
    cta: "Keşfet",
    ctaLink: "/ilan-pazari?q=Sosyal%20Medya",
    icon: Sparkles,
    bg: "from-pink-900 via-rose-900/80 to-fuchsia-950",
    accent: "bg-pink-500",
    badge: "⭐ Trend",
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: 300 }}>
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-all duration-700`} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />

      {/* Decorative icon */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
        <Icon className="w-48 h-48 text-white" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12 max-w-xl">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${slide.accent} w-fit mb-3`}>
          {slide.badge}
        </span>
        <p className="text-white/70 text-sm mb-1 font-medium">{slide.title}</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
          {slide.subtitle}
        </h2>
        <p className="text-white/60 text-sm mb-5 max-w-md leading-relaxed">{slide.description}</p>
        <a
          href={slide.ctaLink}
          className="flex items-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors w-fit shadow-lg"
        >
          <Shield className="h-4 w-4" />
          {slide.cta}
        </a>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </button>

      {/* Dots + Progress */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-white" : "w-3 bg-white/30 hover:bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
