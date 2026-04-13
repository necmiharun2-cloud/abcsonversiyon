import { Link } from 'react-router-dom';

type Sale = {
  id: string;
  buyer: string;
  seller: string;
  item: string;
  price: number;
  time: string;
};

type TopSeller = {
  id: string;
  rank: number;
  name: string;
  rating: number;
  sales: string;
  verified: boolean;
};

const recentSales: Sale[] = [
  { id: '1', buyer: 'Ak***t', seller: 'IlkanShop', item: 'CS2 Prime H...', price: 149.90, time: '2 sn' },
  { id: '2', buyer: 'Me***t', seller: 'RZShop', item: '5000 Robux', price: 1099.90, time: '15 sn' },
  { id: '3', buyer: 'El***f', seller: 'DigiShop', item: 'Netflix Premiu...', price: 39.90, time: '32 sn' },
  { id: '4', buyer: 'Ca***n', seller: 'SocialBoost', item: '1000 Insta ...', price: 49.90, time: '45 sn' },
  { id: '5', buyer: 'Ze***p', seller: 'GameVault', item: 'Valorant VP...', price: 199.90, time: '1 dk' },
  { id: '6', buyer: 'Ha***n', seller: 'FurkanMarket', item: 'Steam Ra...', price: 14.90, time: '1 dk' },
  { id: '7', buyer: 'Em***r', seller: 'MustiBaba', item: 'Rust Drop...', price: 34.50, time: '2 dk' },
  { id: '8', buyer: 'Ar***a', seller: 'OpssStore', item: 'Steam 5 Oy...', price: 75.00, time: '3 dk' },
  { id: '9', buyer: 'Bu***k', seller: 'RedlyStore', item: 'Valorant Ra...', price: 54.90, time: '4 dk' },
  { id: '10', buyer: 'On***r', seller: 'EsonMarket', item: 'Discord Türk...', price: 54.90, time: '5 dk' },
  { id: '11', buyer: 'Se***n', seller: 'IlkanShop', item: 'League of Leg...', price: 299.90, time: '6 dk' },
  { id: '12', buyer: 'Ke***m', seller: 'RZShop', item: 'GTA V Premiu...', price: 89.90, time: '7 dk' },
  { id: '13', buyer: 'Ay***e', seller: 'DigiShop', item: 'Spotify Premi...', price: 19.90, time: '8 dk' },
  { id: '14', buyer: 'Fa***h', seller: 'GameVault', item: 'Minecraft Java', price: 129.90, time: '9 dk' },
  { id: '15', buyer: 'Nu***n', seller: 'SocialBoost', item: '500 YouTube...', price: 29.90, time: '10 dk' },
];

const topSellers: TopSeller[] = [
  { id: '1', rank: 1, name: 'IlkanShop', rating: 4.9, sales: '12.4K', verified: true },
  { id: '2', rank: 2, name: 'RZShop', rating: 4.8, sales: '9.9K', verified: true },
  { id: '3', rank: 3, name: 'DigiShop', rating: 4.9, sales: '8.3K', verified: true },
  { id: '4', rank: 4, name: 'GameVault', rating: 4.7, sales: '7.7K', verified: true },
  { id: '5', rank: 5, name: 'SocialBoost', rating: 4.8, sales: '6.2K', verified: true },
  { id: '6', rank: 6, name: 'MustiBaba', rating: 4.9, sales: '5.8K', verified: true },
  { id: '7', rank: 7, name: 'OpssStore', rating: 4.6, sales: '5.1K', verified: true },
  { id: '8', rank: 8, name: 'EsonMarket', rating: 4.8, sales: '4.9K', verified: true },
  { id: '9', rank: 9, name: 'RedlyStore', rating: 4.7, sales: '4.2K', verified: true },
  { id: '10', rank: 10, name: 'FishMarket', rating: 4.5, sales: '3.8K', verified: true },
  { id: '11', rank: 11, name: 'GachaHunt', rating: 4.9, sales: '3.5K', verified: true },
  { id: '12', rank: 12, name: 'FollowTurk', rating: 4.4, sales: '3.2K', verified: true },
  { id: '13', rank: 13, name: 'SenTinus', rating: 4.8, sales: '2.9K', verified: true },
  { id: '14', rank: 14, name: 'LynaxStore', rating: 4.7, sales: '2.7K', verified: true },
  { id: '15', rank: 15, name: 'RollyStore', rating: 4.6, sales: '2.4K', verified: true },
];

export default function HomeSidebar() {
  return (
    <div className="flex flex-col gap-6">
      {/* Son Satışlar */}
      <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            <h3 className="text-white font-bold text-sm">Son Satışlar</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded text-emerald-500 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Canlı
          </div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {recentSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
                <span className="text-white/80 font-medium truncate max-w-[60px]">{sale.buyer}</span>
                <span className="text-white/40">→</span>
                <Link
                  to={`/ilan-pazari?q=${encodeURIComponent(sale.seller)}`}
                  className="text-blue-400 hover:underline truncate max-w-[70px]"
                >
                  {sale.seller}
                </Link>
                <span className="text-white/60 truncate">{sale.item}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-yellow-400 font-bold">{sale.price.toFixed(2)} ₺</span>
                <span className="text-white/40 text-[10px] w-6 text-right">{sale.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* En İyi Satıcılar */}
      <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">👑</span>
            <h3 className="text-white font-bold text-sm">En İyi Satıcılar</h3>
          </div>
          <Link to="/magazalar" className="text-blue-400 hover:underline text-xs">
            Tümü →
          </Link>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {topSellers.map((seller) => (
            <div key={seller.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  seller.rank === 1 ? 'bg-yellow-500 text-black' :
                  seller.rank === 2 ? 'bg-gray-300 text-black' :
                  seller.rank === 3 ? 'bg-amber-700 text-white' :
                  'bg-white/10 text-white/60'
                }`}>
                  {seller.rank}
                </div>
                <div>
                  <Link
                    to={`/ilan-pazari?q=${encodeURIComponent(seller.name)}`}
                    className="text-white font-medium text-sm hover:underline flex items-center gap-1"
                  >
                    {seller.name}
                    {seller.verified && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-500">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </Link>
                  <div className="text-white/50 text-[10px]">CS2 & Valorant</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                  ★ {seller.rating}
                </div>
                <div className="text-white/40 text-[10px]">{seller.sales}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popüler Kategoriler (Quick Access) */}
      <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">🔥</span>
            <h3 className="text-white font-bold text-sm">Hızlı Kategoriler</h3>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {['Valorant', 'Roblox', 'Instagram', 'Steam', 'Discord', 'League of Legends', 'Netflix', 'Spotify'].map((cat) => (
            <Link
              key={cat}
              to={`/ilan-pazari?q=${encodeURIComponent(cat)}`}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 text-[11px] font-medium transition-colors text-center"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/10 rounded-xl border border-white/5 p-5">
        <h3 className="text-white font-bold text-sm mb-4">Pazar İstatistikleri</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Aktif İlan</span>
            <span className="text-white font-bold text-lg">15.4K+</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Mutlu Müşteri</span>
            <span className="text-white font-bold text-lg">42K+</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Bugün Satış</span>
            <span className="text-white font-bold text-lg">1.2K+</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Ort. Teslimat</span>
            <span className="text-white font-bold text-lg">5 dk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
