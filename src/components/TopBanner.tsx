import { useSiteSettings } from '../hooks/useSiteSettings';

export default function TopBanner() {
  const settings = useSiteSettings();
  const banners = (settings.banners || []).filter((b) => b && b.active !== false).slice(0, 3);

  const accentClass = (accent?: string) => {
    if (accent === 'amber') return 'from-amber-900/40 group-hover:from-amber-800/50';
    if (accent === 'red') return 'from-red-900/30 group-hover:from-red-800/40';
    if (accent === 'emerald') return 'from-emerald-900/30 group-hover:from-emerald-800/40';
    if (accent === 'blue') return 'from-blue-900/30 group-hover:from-blue-800/40';
    if (accent === 'purple') return 'from-purple-900/30 group-hover:from-purple-800/40';
    return 'from-white/10 group-hover:from-white/15';
  };

  return (
    <div className="w-full flex h-16 bg-black/55 backdrop-blur text-white text-sm overflow-hidden border-b border-white/10">
      {banners.map((b, idx) => (
        <div
          key={`${idx}-${b.text}`}
          className={`flex-1 flex items-center justify-center gap-4 relative overflow-hidden group cursor-pointer ${idx < banners.length - 1 ? 'border-r border-white/10' : ''}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r to-black/70 transition-opacity ${accentClass(b.accent)}`} />
          <div className="relative z-10 flex items-center gap-2 font-bold">
            {b.label && (
              <span className="bg-white text-black px-2 py-0.5 rounded text-xs">{b.label}</span>
            )}
            {b.text}
          </div>
        </div>
      ))}
    </div>
  );
}
