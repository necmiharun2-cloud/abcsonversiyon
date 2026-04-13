import { Link } from 'react-router-dom';

export default function BudgetTiles() {
  const tiles = [
    { label: '10 TL', href: '/ilan-pazari?maxPrice=10', color: 'from-[#8b5cf6] to-[#ec4899]' },
    { label: '20 TL', href: '/ilan-pazari?maxPrice=20', color: 'from-[#8b5cf6] to-[#ec4899]' },
    { label: '50 TL', href: '/ilan-pazari?maxPrice=50', color: 'from-[#8b5cf6] to-[#ec4899]' },
    { label: '100 TL', href: '/ilan-pazari?maxPrice=100', color: 'from-[#8b5cf6] to-[#ec4899]' },
    { label: '250 TL', href: '/ilan-pazari?maxPrice=250', color: 'from-[#8b5cf6] to-[#ec4899]' },
    { label: '500 TL', href: '/ilan-pazari?maxPrice=500', color: 'from-[#8b5cf6] to-[#ec4899]' },
  ];

  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Ucuz Oyunlar</h2>
          <p className="text-white/50 text-sm">Bütçenize uygun oyunları keşfedin!</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tiles.map((t) => (
            <Link
              key={t.label}
              to={t.href}
              className={`rounded-2xl bg-gradient-to-br ${t.color} p-5 text-white hover:-translate-y-1 transition-transform duration-300 shadow-lg flex flex-col items-center text-center`}
            >
              <div className="text-3xl font-black italic mb-1">{t.label}</div>
              <div className="text-[10px] font-bold opacity-90 mb-4 tracking-wider">ALTI TÜM OYUNLAR</div>
              <div className="mt-auto w-full bg-white/20 hover:bg-white/30 transition-colors rounded-lg py-2 text-xs font-bold">
                OYUNLARI GÖRÜNTÜLE
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

