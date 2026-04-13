import { Link } from 'react-router-dom';
import { listingImage } from '../lib/media';
import { useState } from 'react';

type Group = {
  title: string;
  subtitle: string;
  color: string;
  accentColor: string;
  q: string;
  items: Array<{ title: string; price: number; oldPrice?: number; discount?: number }>;
};

const groups: Group[] = [
  {
    title: 'PUBG UC Ürünlerimiz',
    subtitle: 'PUBG UC ürünlerini uygun fiyatlarla sağlıyoruz!',
    color: 'from-amber-500/20 to-transparent',
    accentColor: 'bg-amber-500',
    q: 'PUBG UC',
    items: [
      { title: 'PUBG Mobile 10 UC', price: 20.28 },
      { title: 'PUBG Mobile 60 UC', price: 42.26, oldPrice: 42.69, discount: 1 },
      { title: 'PUBG Mobile 325 UC', price: 205.98, oldPrice: 208.06, discount: 1 },
      { title: 'PUBG Mobile 660 UC', price: 412.43, oldPrice: 416.60, discount: 1 },
      { title: 'PUBG Mobile 1800 UC', price: 1031.78, oldPrice: 1042.20, discount: 1 },
    ],
  },
  {
    title: 'Valorant VP Ürünlerimiz',
    subtitle: 'Valorant VP ürünlerini uygun fiyatlarla sunuyoruz!',
    color: 'from-red-500/20 to-transparent',
    accentColor: 'bg-red-500',
    q: 'Valorant VP',
    items: [
      { title: 'Valorant 375 VP', price: 112.66 },
      { title: 'Valorant 825 VP', price: 234.73 },
      { title: 'Valorant 1700 VP', price: 469.46 },
      { title: 'Valorant 2925 VP', price: 798.07 },
      { title: 'Valorant 4325 VP', price: 1154.86 },
    ],
  },
  {
    title: 'Mobile Legends Ürünlerimiz',
    subtitle: 'Mobile Legends elmas ürünlerimizden yararlanın!',
    color: 'from-blue-500/20 to-transparent',
    accentColor: 'bg-blue-500',
    q: 'Mobile Legends Elmas',
    items: [
      { title: 'Mobile Legends 16 Elmas', price: 11.72 },
      { title: 'Mobile Legends 44 Elmas', price: 32.11 },
      { title: 'Mobile Legends 133 Elmas', price: 96.11 },
      { title: 'Mobile Legends 627 Elmas', price: 450.36 },
      { title: 'Mobile Legends 3139 Elmas', price: 2128.68 },
    ],
  },
];

export default function PreferredProducts() {
  const [activeGroup, setActiveGroup] = useState(0);
  const currentGroup = groups[activeGroup];

  return (
    <section className="home-section rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="text-2xl sm:text-3xl font-extrabold text-white">
          Tercih Edilen Popüler Ürünlerimiz
        </div>
        <div className="text-white/65 text-sm mt-2 max-w-2xl mx-auto">
          Anında teslim edilen, güvenli altyapı üzerinden sunulan ve tamamı orijinal olan dijital oyun kodlarıyla oyun keyfini beklemeden yaşayın.
        </div>
      </div>

      {/* Group Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {groups.map((g, idx) => (
          <button
            key={g.title}
            type="button"
            onClick={() => setActiveGroup(idx)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeGroup === idx
                ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_20px_rgba(255,106,0,0.3)]'
                : 'bg-black/25 text-white/70 border border-white/10 hover:text-white hover:bg-black/40'
            }`}
          >
            {g.title.replace(' Ürünlerimiz', '')}
          </button>
        ))}
      </div>

      {/* Active Group Content */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/25">
        <div className={`p-5 bg-gradient-to-r ${currentGroup.color}`}>
          <div className={`w-2 h-2 rounded-full ${currentGroup.accentColor} inline-block mr-2`} />
          <span className="text-white font-extrabold text-lg">{currentGroup.title}</span>
          <div className="text-white/65 text-sm mt-1">{currentGroup.subtitle}</div>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {currentGroup.items.map((it) => (
            <Link
              key={it.title}
              to={`/ilan-pazari?q=${encodeURIComponent(it.title)}`}
              className="group flex flex-col rounded-xl border border-white/10 bg-black/20 hover:bg-black/30 hover:border-emerald-400/50 transition-all p-3 gap-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={listingImage(80, 80, it.title)}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-white font-bold text-xs line-clamp-2 leading-tight group-hover:accent-text transition-colors">
                    {it.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {it.oldPrice && (
                      <span className="text-white/40 text-[10px] line-through">
                        {it.oldPrice.toFixed(2)} ₺
                      </span>
                    )}
                    <span className="accent-text font-extrabold text-sm">
                      {it.price.toFixed(2)} ₺
                    </span>
                  </div>
                </div>
              </div>
              <div className="btn-buy text-white font-extrabold text-xs px-3 py-2 rounded-lg text-center">
                Satın Al
              </div>
            </Link>
          ))}
        </div>

        <div className="p-4 pt-0">
          <Link
            to={`/ilan-pazari?q=${encodeURIComponent(currentGroup.q)}`}
            className="inline-flex items-center justify-center w-full bg-white/10 hover:bg-white/15 text-white font-extrabold px-4 py-3 rounded-xl border border-white/15 transition-colors"
          >
            Daha Fazla Görüntüle →
          </Link>
        </div>
      </div>
    </section>
  );
}

