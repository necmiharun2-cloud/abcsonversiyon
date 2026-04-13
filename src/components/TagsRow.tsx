import type { ReactNode } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TagsRow() {
  const tags: { name: string; icon: string | ReactNode; href: string; active?: boolean }[] = [
    { name: 'Tümü', icon: <LayoutGrid className="w-4 h-4" />, href: '/ilan-pazari', active: true },
    { name: 'Instagram', icon: '📸', href: '/ilan-pazari?q=Instagram' },
    { name: 'Steam', icon: '💨', href: '/ilan-pazari?q=Steam' },
    { name: 'Valorant Random Hesap', icon: 'V', href: '/ilan-pazari?q=Valorant' },
    { name: 'PUBG Mobile', icon: '🪂', href: '/ilan-pazari?q=PUBG' },
    { name: 'Youtube', icon: '▶️', href: '/ilan-pazari?q=Youtube' },
    { name: 'Minecraft', icon: '🧱', href: '/ilan-pazari?q=Minecraft' },
    { name: 'Microsoft', icon: '🪟', href: '/ilan-pazari?q=Microsoft' },
    { name: 'OpenAI', icon: '🤖', href: '/ilan-pazari?q=OpenAI' },
    { name: 'Roblox', icon: '⬛', href: '/roblox' },
    { name: 'Discord', icon: '💬', href: '/ilan-pazari?q=Discord' },
    { name: 'TikTok', icon: '🎵', href: '/ilan-pazari?q=TikTok' },
    { name: 'Steam Random Key', icon: '🔑', href: '/ilan-pazari?q=Steam+Random' },
    { name: 'Valorant', icon: 'V', href: '/ilan-pazari?q=Valorant' },
    { name: 'ARC Raiders', icon: '🚀', href: '/ilan-pazari?q=ARC+Raiders' },
    { name: 'PUBG Mobile Random Hesap Satış', icon: '🪂', href: '/ilan-pazari?q=PUBG' },
    { name: 'Roblox Random Hesap', icon: '⬛', href: '/roblox' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.name}
          to={tag.href}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            tag.active
              ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white'
              : 'bg-[#1a1b23] border-transparent text-white/80 hover:bg-[#23242f] hover:text-white'
          }`}
        >
          {typeof tag.icon === 'string' ? (
            <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full text-black text-xs">
              {tag.icon}
            </span>
          ) : (
            tag.icon
          )}
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
