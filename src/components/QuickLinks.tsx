import { Link } from 'react-router-dom';
import { categoryIconLabel } from '../lib/media';

export default function QuickLinks() {
  const links = [
    { name: 'CS2', slug: 'CS2' },
    { name: 'CD Key', slug: 'CD Key' },
    { name: 'Hediye Kartı', slug: 'Hediye' },
    { name: 'Sosyal Medya', slug: 'Sosyal' },
    { name: 'Random Hesap', slug: 'Random' },
    { name: 'MMO Oyunlar', slug: 'MMO' },
    { name: 'Mobil Oyunlar', slug: 'Mobil' },
  ];

  return (
    <div className="flex items-center justify-between">
      {links.map((link) => (
        <Link
          key={link.name}
          to={`/ilan-pazari?q=${encodeURIComponent(link.name)}`}
          className="flex items-center gap-3 text-white/75 hover:text-white transition-colors font-semibold text-sm"
        >
          <img src={categoryIconLabel(link.slug)} alt="" className="w-6 h-6 rounded" />
          {link.name}
        </Link>
      ))}
    </div>
  );
}
