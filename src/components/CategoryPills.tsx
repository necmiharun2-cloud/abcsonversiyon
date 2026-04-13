import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function CategoryPills() {
  const location = useLocation();
  const navigate = useNavigate();

  const pills = [
    { name: 'En Yeniler', path: '/', type: 'link' as const },
    { name: 'İlan Pazarı', path: '/ilan-pazari', type: 'link' as const },
    { name: 'Valorant', path: '/ilan-pazari', type: 'search' as const, q: 'Valorant' },
    { name: 'PUBG Mobile', path: '/ilan-pazari', type: 'search' as const, q: 'PUBG' },
    { name: 'Roblox', path: '/roblox', type: 'link' as const },
    { name: 'League of Legends', path: '/ilan-pazari', type: 'search' as const, q: 'League of Legends' },
    { name: 'Counter Strike 2', path: '/ilan-pazari', type: 'search' as const, q: 'CS2' },
    { name: 'Mobile Legends', path: '/ilan-pazari', type: 'search' as const, q: 'Mobile Legends' },
    { name: 'CD-Key', path: '/cd-key', type: 'link' as const },
  ];

  return (
    <div className="bg-[#111218] py-3 border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {pills.map((pill) => {
            const isActive = pill.type === 'link' && location.pathname === pill.path;
            const baseClass = `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-purple-600 text-white'
                : 'bg-[#2d3041] text-white/70 hover:bg-[#363a4f] hover:text-white'
            }`;

            if (pill.type === 'link') {
              return (
                <Link key={pill.name} to={pill.path} className={baseClass}>
                  {pill.name}
                </Link>
              );
            }

            return (
              <button
                key={pill.name}
                type="button"
                onClick={() =>
                  navigate(`/ilan-pazari?q=${encodeURIComponent(pill.q ?? pill.name)}`)
                }
                className={baseClass}
              >
                {pill.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
