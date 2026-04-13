import { Link } from 'react-router-dom';

export default function HeroSection() {
  // Category tabs like itemsatis.com
  const categoryTabs = [
    { name: 'En Yeniler', path: '/ilan-pazari', q: '', icon: '🔥' },
    { name: 'İlan Pazarı', path: '/ilan-pazari', q: '', icon: '🏪' },
    { name: 'Valorant', path: '/ilan-pazari', q: 'Valorant', icon: 'V' },
    { name: 'Pubg Mobile', path: '/ilan-pazari', q: 'PUBG', icon: '🪂' },
    { name: 'Roblox', path: '/roblox', q: '', icon: '⬛' },
    { name: 'League of Legends', path: '/ilan-pazari', q: 'League of Legends', icon: 'L' },
    { name: 'Counter Strike 2', path: '/ilan-pazari', q: 'CS2', icon: '🔫' },
    { name: 'Mobile Legends', path: '/ilan-pazari', q: 'Mobile Legends', icon: 'M' },
    { name: 'CD-Key', path: '/cd-key', q: '', icon: '🔑' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#111218]">
      {/* Content */}
      <div className="relative z-10">
        {/* Category Tabs */}
        <div className="pt-4 px-4 bg-[#111218]">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
              {categoryTabs.map((tab, idx) => (
                <Link
                  key={tab.name}
                  to={tab.q ? `/ilan-pazari?q=${encodeURIComponent(tab.q)}` : tab.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    idx === 0
                      ? 'bg-[#8b5cf6] text-white'
                      : 'bg-[#1a1b23] text-white/80 hover:bg-[#23242f] hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Banners Section */}
        <div className="px-4 pt-4 pb-2 bg-[#111218]">
          <div className="max-w-[1400px] mx-auto">
            <div className="relative rounded-2xl overflow-hidden group h-[300px] lg:h-[400px] bg-gradient-to-r from-[#8b1c4c] to-[#4a0e28]">
              {/* Decorative Elements */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-12 opacity-20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-64 h-64 text-white">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>

              <div className="absolute inset-0 flex flex-col justify-center p-8 lg:p-16 z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="text-yellow-300">★</span> Trend
                  </span>
                </div>
                <span className="text-white/80 text-sm font-medium mb-2">Sosyal Medya</span>
                <h3 className="text-white text-4xl lg:text-6xl font-extrabold mb-4 tracking-tight">Takipçi & Beğeni</h3>
                <p className="text-white/70 max-w-md mb-8 text-sm lg:text-base">
                  Instagram, TikTok, YouTube ve Twitter için organik takipçi, beğeni ve izlenme hizmetleri.
                </p>
                <Link to="/ilan-pazari?q=Sosyal+Medya" className="bg-white hover:bg-gray-100 text-black px-8 py-3 rounded-xl font-bold text-sm w-max transition-colors flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Keşfet
                </Link>
              </div>

              {/* Slider Controls */}
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors z-20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors z-20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Slider Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                <div className="w-2 h-2 rounded-full bg-white/40 cursor-pointer hover:bg-white/60 transition-colors"></div>
                <div className="w-2 h-2 rounded-full bg-white/40 cursor-pointer hover:bg-white/60 transition-colors"></div>
                <div className="w-8 h-2 rounded-full bg-white cursor-pointer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
