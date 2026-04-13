import { useState } from 'react';
import { Link } from 'react-router-dom';

type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
};

type GameTab = {
  id: string;
  label: string;
  icon: string;
  products: Product[];
};

const gameTabs: GameTab[] = [
  {
    id: 'valorant',
    label: 'Valorant',
    icon: '🎯',
    products: [
      { id: 'v1', title: 'Valorant 375 VP', price: 112.66, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80' },
      { id: 'v2', title: 'Valorant 825 VP', price: 234.73, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80' },
      { id: 'v3', title: 'Valorant 1700 VP', price: 469.46, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80' },
      { id: 'v4', title: 'Valorant 2925 VP', price: 798.07, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80' },
      { id: 'v5', title: 'Valorant 4325 VP', price: 1154.86, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80' },
      { id: 'v6', title: 'Valorant 8900 VP', price: 2300.32, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    id: 'roblox',
    label: 'Roblox',
    icon: '🎮',
    products: [
      { id: 'r1', title: 'Roblox 400 Robux', price: 204.43, image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=200&q=80' },
      { id: 'r2', title: 'Roblox 800 Robux', price: 365.33, image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=200&q=80' },
      { id: 'r3', title: 'Roblox 1200 Robux', price: 533.17, image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=200&q=80' },
      { id: 'r4', title: 'Roblox 2000 Robux', price: 891.37, image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=200&q=80' },
      { id: 'r5', title: 'Roblox 2500 Robux', price: 1070.93, image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=200&q=80' },
      { id: 'r6', title: 'Roblox 4500 Robux', price: 2011.36, image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    id: 'lol',
    label: 'League of Legends',
    icon: '⚔️',
    products: [
      { id: 'l1', title: 'LOL 460 RP', price: 112.66, image: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=200&q=80' },
      { id: 'l2', title: 'LOL 1005 RP', price: 234.73, image: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=200&q=80' },
      { id: 'l3', title: 'LOL 2105 RP', price: 469.46, image: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=200&q=80' },
      { id: 'l4', title: 'LOL 3625 RP', price: 798.07, image: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=200&q=80' },
      { id: 'l5', title: 'LOL 5295 RP', price: 1154.86, image: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=200&q=80' },
      { id: 'l6', title: 'LOL 10875 RP', price: 2300.32, image: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    id: 'mobilelegends',
    label: 'Mobile Legends',
    icon: '💎',
    products: [
      { id: 'm1', title: 'ML 16 Elmas', price: 11.72, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80' },
      { id: 'm2', title: 'ML 32 Elmas', price: 23.45, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80' },
      { id: 'm3', title: 'ML 44 Elmas', price: 32.11, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80' },
      { id: 'm4', title: 'ML 88 Elmas', price: 64.12, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80' },
      { id: 'm5', title: 'ML İlk Yükleme 100', price: 39.95, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80' },
      { id: 'm6', title: 'ML 627 Elmas', price: 450.36, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    id: 'pubg',
    label: 'PUBG Mobile',
    icon: '🔫',
    products: [
      { id: 'p1', title: 'PUBG 60 UC', price: 42.26, oldPrice: 42.69, discount: 1, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=200&q=80' },
      { id: 'p2', title: 'PUBG 325 UC', price: 205.98, oldPrice: 208.06, discount: 1, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=200&q=80' },
      { id: 'p3', title: 'PUBG 660 UC', price: 412.43, oldPrice: 416.60, discount: 1, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=200&q=80' },
      { id: 'p4', title: 'PUBG 1800 UC', price: 1031.78, oldPrice: 1042.20, discount: 1, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=200&q=80' },
      { id: 'p5', title: 'PUBG 3850 UC', price: 2036.80, oldPrice: 2057.37, discount: 1, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=200&q=80' },
      { id: 'p6', title: 'PUBG 8100 UC', price: 4127.08, oldPrice: 4168.77, discount: 1, image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=200&q=80' },
    ],
  },
];

export default function EPinSection() {
  const [activeTab, setActiveTab] = useState(gameTabs[0].id);

  const activeGame = gameTabs.find((g) => g.id === activeTab) || gameTabs[0];

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">E-Pin Ürünleri</h2>
          <p className="text-white/50 text-sm">Hızlı ve Güvenli E-Pin Satışı</p>
        </div>
        <Link
          to="/ilan-pazari"
          className="bg-[#1a1b23] hover:bg-[#23242f] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-white/10 shrink-0"
        >
          Tümünü Gör
        </Link>
      </div>

      <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-white/5 p-2">
          {gameTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8b5cf6] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {activeGame.products.map((product) => (
              <Link
                key={product.id}
                to={`/ilan-pazari?q=${encodeURIComponent(product.title)}`}
                className="group bg-[#111218] rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-square p-4 flex items-center justify-center bg-white/5">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      %{product.discount}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div className="text-white text-xs font-medium line-clamp-2 leading-tight group-hover:text-[#facc15] transition-colors mb-2">
                    {product.title}
                  </div>
                  <div className="flex items-end justify-between gap-1">
                    <div className="flex flex-col">
                      {product.oldPrice && (
                        <span className="text-white/40 text-[10px] line-through leading-none">
                          {product.oldPrice.toFixed(2)} ₺
                        </span>
                      )}
                      <span className="text-[#10b981] font-bold text-sm leading-none mt-0.5">
                        {product.price.toFixed(2)} ₺
                      </span>
                    </div>
                    <div className="bg-[#8b5cf6] text-white font-bold text-[10px] px-2 py-1.5 rounded hover:bg-[#7c3aed] transition-colors">
                      Satın Al
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
