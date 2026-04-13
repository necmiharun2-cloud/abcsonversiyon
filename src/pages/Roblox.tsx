import CategoryPills from '../components/CategoryPills';
import QuickLinks from '../components/QuickLinks';
import TagsRow from '../components/TagsRow';
import ShowcaseListings from '../components/ShowcaseListings';
import { ShoppingBag } from 'lucide-react';
import { listingImage } from '../lib/media';

export default function Roblox() {
  return (
    <div className="space-y-6">
      <CategoryPills />
      
      {/* Roblox Hero Section */}
      <div className="flex flex-col lg:flex-row gap-4 h-[300px]">
        {/* Left Large Banner */}
        <div className="flex-[2] relative rounded-xl overflow-hidden bg-[#111] group cursor-pointer">
          <img src={listingImage(800, 400, 'Roblox')} alt="Roblox" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-12">
            <h2 className="text-5xl font-bold text-[#facc15] mb-4 leading-tight drop-shadow-lg">
              ROBLOX ROBUX<br/>SATIN AL
            </h2>
            <p className="text-gray-200 mb-8 max-w-md text-sm leading-relaxed">
              Roblox Robux Alışverişi itemTR'ta, Anında Yükle, Oyun Keyfini Katla!
            </p>
            <div>
              <button className="bg-transparent border border-white/30 hover:bg-white/10 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Hemen Alışverişe Başla!
              </button>
            </div>
          </div>
        </div>

        {/* Right 3 Cards */}
        <div className="flex-1 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 relative rounded-xl overflow-hidden group cursor-pointer">
              <img src={listingImage(200, 400, `Roblox ${i}`)} alt="Roblox Card" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-0 right-0 px-3">
                <button className="w-full bg-black/60 backdrop-blur-sm border border-white/20 text-white text-[10px] font-medium py-2 rounded hover:bg-white/20 transition-colors">
                  Hemen Alışverişe Başla!
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <QuickLinks />
      <TagsRow />
      <ShowcaseListings />
    </div>
  );
}
