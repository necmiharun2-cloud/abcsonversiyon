import { Link } from 'react-router-dom';

type GameStat = {
  id: string;
  title: string;
  count: string;
  icon: string;
  link: string;
};

const games: GameStat[] = [
  { id: '1', title: 'CS2', count: '12.5K ilan', icon: '🔫', link: '/ilan-pazari?q=CS2' },
  { id: '2', title: 'Valorant', count: '8.3K ilan', icon: '🎯', link: '/ilan-pazari?q=Valorant' },
  { id: '3', title: 'Roblox', count: '6.7K ilan', icon: '⬛', link: '/roblox' },
  { id: '4', title: 'Pubg Mobile', count: '4.2K ilan', icon: '🪂', link: '/ilan-pazari?q=PUBG' },
  { id: '5', title: 'Brawl Stars', count: '3.8K ilan', icon: '⭐', link: '/ilan-pazari?q=Brawl' },
  { id: '6', title: 'Discord', count: '5.1K ilan', icon: '💬', link: '/ilan-pazari?q=Discord' },
  { id: '7', title: 'Growtopia', count: '2.9K ilan', icon: '🌱', link: '/ilan-pazari?q=Growtopia' },
  { id: '8', title: 'LoL', count: '7.4K ilan', icon: '👑', link: '/ilan-pazari?q=LoL' },
  { id: '9', title: 'Steam', count: '9.2K ilan', icon: '🎮', link: '/ilan-pazari?q=Steam' },
  { id: '10', title: 'FC 26', count: '3.1K ilan', icon: '⚽', link: '/ilan-pazari?q=FC' },
  { id: '11', title: 'Instagram', count: '4.5K ilan', icon: '📸', link: '/ilan-pazari?q=Instagram' },
  { id: '12', title: 'TikTok', count: '3.6K ilan', icon: '🎵', link: '/ilan-pazari?q=TikTok' },
];

export default function StoriesStrip() {
  return (
    <section className="py-0.5">
      <div className="bg-[#1a1b23] rounded-2xl py-2 px-4 border border-white/5">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-5 min-w-max px-2">
            {games.map((game) => (
              <Link
                key={game.id}
                to={game.link}
                className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
              >
                <div className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform">
                  {game.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-bold whitespace-nowrap">
                    {game.title}
                  </span>
                  <span className="text-white/50 text-[11px] whitespace-nowrap">
                    {game.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
