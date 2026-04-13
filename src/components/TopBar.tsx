import { Sparkles, ChevronRight, LifeBuoy, FileText, Phone, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function TopBar() {
  const settings = useSiteSettings();
  
  // Rotating featured products like itemTR
  const featuredProducts = [
    { name: 'Roblox Robux', description: 'Sınırsız Eğlence, En Uygun Fiyatlı Robux', path: '/roblox' },
    { name: 'Valorant VP', description: 'Hızlı Teslimat, Güvenli Alışveriş', path: '/ilan-pazari?q=Valorant' },
    { name: 'PUBG Mobile UC', description: 'En Ucuz UC Fiyatları', path: '/ilan-pazari?q=PUBG' },
    { name: 'Steam Cüzdan', description: 'Anında Yükleme, Avantajlı Fiyatlar', path: '/ilan-pazari?q=Steam' },
  ];
  
  // Simple rotation - could be enhanced with state for auto-rotation
  const currentFeatured = featuredProducts[0];

  return (
    <div className="bg-[#1a1d2e] border-b border-white/5 hidden md:block">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to={currentFeatured.path}
            className="flex items-center gap-2 text-white/80 text-[11px] font-medium hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span className="font-bold text-yellow-500">{currentFeatured.name}</span>
            <span>- {currentFeatured.description}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/destek-sistemi" className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-medium transition-colors">
            <LifeBuoy className="w-3.5 h-3.5" />
            Destek Sistemi
          </Link>
          <Link to="/blog" className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-medium transition-colors">
            <FileText className="w-3.5 h-3.5" />
            Blog
          </Link>
          {/* /iletisim route'u App.tsx'de yok, kaldırıldı */}
          <Link to="/sss" className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-medium transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            S.S.S.
          </Link>
        </div>
      </div>
    </div>
  );
}
