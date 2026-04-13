import { Link } from 'react-router-dom';
import { listingImage } from '../lib/media';

export default function PopularStrip() {
  const items = [
    { name: 'Valorant', q: 'Valorant', img: listingImage(240, 240, 'VALO') },
    { name: 'Roblox', q: 'Roblox', img: listingImage(240, 240, 'RBX') },
    { name: 'League of Legends', q: 'League of Legends', img: listingImage(240, 240, 'LOL') },
    { name: 'Mobile Legends', q: 'Mobile Legends', img: listingImage(240, 240, 'MLBB') },
    { name: 'PUBG Mobile', q: 'PUBG', img: listingImage(240, 240, 'PUBG') },
    { name: 'CS2', q: 'CS2', img: listingImage(240, 240, 'CS2') },
    { name: 'Steam', q: 'Steam', img: listingImage(240, 240, 'STEAM') },
    { name: 'CD-Key', q: 'CD Key', img: listingImage(240, 240, 'CD') },
  ];

  return (
    <section className="home-section rounded-2xl px-4 py-3">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {items.map((it) => (
          <Link
            key={it.name}
            to={`/ilan-pazari?q=${encodeURIComponent(it.q)}`}
            className="shrink-0 flex items-center gap-3 rounded-2xl bg-black/25 border border-white/10 hover:border-white/20 transition-colors px-4 py-3"
          >
            <img src={it.img} alt={it.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <div className="text-white font-extrabold text-sm whitespace-nowrap">{it.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

