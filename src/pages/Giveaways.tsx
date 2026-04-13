import { Gift, Trophy, Clock, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { listingImage } from '../lib/media';

export default function Giveaways() {
  const giveaways = [
    { id: 1, title: '1000 Valorant Points', participants: 1240, endsIn: '2 gün', image: listingImage(400, 200, 'VP 1000') },
    { id: 2, title: 'Discord Nitro (1 Aylık)', participants: 850, endsIn: '5 saat', image: listingImage(400, 200, 'Nitro') },
    { id: 3, title: 'Steam 100 TL Cüzdan Kodu', participants: 2100, endsIn: '12 saat', image: listingImage(400, 200, 'Steam 100') },
  ];

  const handleJoin = (title: string) => {
    toast.success(`${title} çekilişine başarıyla katıldınız!`);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Aktif Çekilişler
          </h1>
          <p className="max-w-xl opacity-90">Her gün onlarca hediye dağıtıyoruz! Siz de şansınızı denemek için hemen çekilişlere katılın.</p>
        </div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 scale-150">
          <Gift className="w-48 h-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {giveaways.map((g) => (
          <div key={g.id} className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden hover:border-purple-500/50 transition-all group">
            <div className="relative aspect-video">
              <img src={g.image} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-yellow-500" />
                {g.endsIn}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-white font-bold text-lg mb-4">{g.title}</h3>
              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  {g.participants} Katılımcı
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  Sponsorlu
                </div>
              </div>
              <button 
                onClick={() => handleJoin(g.title)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-purple-500/20"
              >
                Çekilişe Katıl
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
