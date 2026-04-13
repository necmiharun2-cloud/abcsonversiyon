import { ChevronRight, Gamepad2, Gift, Grid2x2, Layers, KeyRound, Shield, Wrench } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type LeftCategory = {
  label: string;
  to: string;
  icon: ReactNode;
  iconBg: string;
};

type PopularGame = {
  label: string;
  query: string;
  image: string;
};

const leftCategories: LeftCategory[] = [
  { label: 'Popüler Kategoriler', to: '/ilan-pazari', icon: <Gamepad2 className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-violet-500/90' },
  { label: 'Tüm Kategoriler', to: '/tum-kategoriler', icon: <Grid2x2 className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-emerald-500/90' },
  { label: 'Item & Skin', to: '/ilan-pazari', icon: <Layers className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-sky-500/90' },
  { label: 'Hesap Satışı', to: '/ilan-pazari', icon: <Shield className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-indigo-500/90' },
  { label: 'ID Yükleme (Top Up)', to: '/top-up', icon: <Wrench className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-teal-500/90' },
  { label: 'Epin', to: '/ilan-pazari?q=Epin', icon: <Gamepad2 className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-amber-500/90' },
  { label: 'CD Key', to: '/cd-key', icon: <KeyRound className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-pink-500/90' },
  { label: 'Lisans Hizmetleri', to: '/ilan-pazari?q=Lisans%20Hizmetleri', icon: <KeyRound className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-cyan-500/90' },
  { label: 'Freelancer Hizmetler', to: '/ilan-pazari?q=Freelancer', icon: <Wrench className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-orange-500/90' },
  { label: 'Platform Hizmetleri', to: '/ilan-pazari?q=Platform', icon: <Layers className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-rose-500/90' },
  { label: 'Hediye Kartları', to: '/hediye-kartlari', icon: <Gift className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-lime-500/90' },
  { label: 'Diğer Ürünler', to: '/ilan-pazari', icon: <Grid2x2 className="w-3.5 h-3.5 text-white" />, iconBg: 'bg-slate-500/90' },
];

const popularGames: PopularGame[] = [
  { label: 'PUBG Mobile', query: 'PUBG', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Valorant', query: 'Valorant', image: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Roblox', query: 'Roblox', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=80' },
  { label: 'League Of Legends', query: 'League of Legends', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Wild Rift', query: 'Wild Rift', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mobile Legends', query: 'Mobile Legends', image: 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?auto=format&fit=crop&w=1200&q=80' },
];

export default function AllCategoriesSection() {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#171a22] p-3 sm:p-4 shadow-[0_14px_42px_rgba(0,0,0,0.55)]">
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4 lg:min-h-[360px]">
        <aside className="rounded-xl border border-white/8 bg-[#11141b] p-2.5 flex flex-col">
          <div className="px-2 py-2 text-[18px] leading-none font-extrabold text-white tracking-tight">KATEGORİLER</div>
          <div className="space-y-1.5 flex-1">
            {leftCategories.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center justify-between rounded-lg border border-white/8 bg-[#171c25] px-3 py-2.5 text-sm text-white/95 hover:bg-[#1e2530] hover:border-white/20 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-md inline-flex items-center justify-center ${item.iconBg}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                <ChevronRight className="w-4 h-4 text-white/35" />
              </Link>
            ))}
          </div>
          <Link
            to="/tum-kategoriler"
            className="mt-2.5 flex items-center justify-between rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-600 px-3 py-2.5 text-sm font-extrabold text-white transition-colors"
          >
            Tümünü Görüntüle
            <ChevronRight className="w-4 h-4" />
          </Link>
        </aside>

        <div className="rounded-xl border border-white/8 bg-[#11141b] p-3 sm:p-4">
          <div className="mb-3 text-[18px] leading-none font-extrabold text-white tracking-tight">POPÜLER KATEGORİLER</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {popularGames.map((game) => (
              <Link
                key={game.label}
                to={`/ilan-pazari?q=${encodeURIComponent(game.query)}`}
                className="group rounded-xl overflow-hidden border border-white/10 bg-black/30 hover:border-white/25 transition-colors"
              >
                <div className="relative h-32 sm:h-36">
                  <img
                    src={game.image}
                    alt={game.label}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="px-3 py-2.5 text-center text-white font-bold text-sm leading-tight min-h-10 flex items-center justify-center">{game.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
