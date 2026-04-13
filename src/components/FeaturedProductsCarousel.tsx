import { Link } from 'react-router-dom';

export default function FeaturedProductsCarousel() {
  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[300px]">
          {/* Left Column */}
          <div className="grid grid-rows-2 gap-4 h-full">
            <Link to="/ilan-pazari?q=LOL" className="relative rounded-xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80" alt="LOL Random Hesap" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg leading-tight mb-2">LOL RANDOM HESAP</h3>
                <span className="text-white/80 text-xs font-medium">HEMEN ALIŞVERİŞE BAŞLA!</span>
              </div>
            </Link>
            <Link to="/ilan-pazari?q=Black+Desert" className="relative rounded-xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80" alt="Black Desert" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg leading-tight mb-2">BLACK DESERT</h3>
                <span className="text-white/80 text-xs font-medium">HEMEN ALIŞVERİŞE BAŞLA!</span>
              </div>
            </Link>
          </div>

          {/* Center Column (Large) */}
          <div className="md:col-span-2 h-full">
            <Link to="/hediye-kartlari" className="relative rounded-xl overflow-hidden group block h-full">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80" alt="Hediye Kartları" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-center p-8">
                <h2 className="text-white font-black text-4xl md:text-5xl mb-4">HEDİYE<br/>KARTLARI</h2>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded font-bold text-sm w-max">HEMEN ALIŞVERİŞE BAŞLA!</span>
              </div>
            </Link>
          </div>

          {/* Right Column */}
          <div className="grid grid-rows-2 gap-4 h-full">
            <Link to="/ilan-pazari?q=Diablo" className="relative rounded-xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=400&q=80" alt="Diablo 4 Kategorisi" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg leading-tight mb-2">DİABLO 4 KATEGORİSİ</h3>
                <span className="text-white/80 text-xs font-medium">HEMEN ALIŞVERİŞE BAŞLA!</span>
              </div>
            </Link>
            <Link to="/ilan-pazari?q=Fortnite" className="relative rounded-xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1580327344181-c1163234e5a0?auto=format&fit=crop&w=400&q=80" alt="Fortnite Kategorisi" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg leading-tight mb-2">FORTNITE KATEGORİSİ</h3>
                <span className="text-white/80 text-xs font-medium">HEMEN ALIŞVERİŞE BAŞLA!</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
