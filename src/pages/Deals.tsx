import { Percent, Flame, Clock, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { listingImage } from '../lib/media';

export default function Deals() {
  const { addToCart } = useCart();
  const showCartToast = (title: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-[#1a1b23] border border-white/10 rounded-xl p-3 text-white flex items-center gap-3`}>
        <div className="text-sm flex-1">{title} sepete eklendi.</div>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t.id);
            window.location.href = '/sepet';
          }}
          className="btn-buy px-3 py-1.5 rounded-lg text-xs font-bold"
        >
          Sepete Git
        </button>
      </div>
    ));
  };

  const handleAddToCart = (deal: any) => {
    addToCart({
      id: `deal-${deal.id}`,
      title: deal.title,
      price: parseFloat(deal.newPrice.replace(' ₺', '')),
      originalPrice: parseFloat(deal.oldPrice.replace(' ₺', '')),
      seller: 'itemTR Fırsat',
      sellerId: 'system',
      image: deal.image
    });
    showCartToast(deal.title);
  };

  const deals = [
    { id: 1, title: 'Valorant 1200 VP', oldPrice: '250 ₺', newPrice: '225 ₺', discount: '%10', image: listingImage(400, 240, 'Valorant VP') },
    { id: 2, title: 'PUBG Mobile 660 UC', oldPrice: '300 ₺', newPrice: '270 ₺', discount: '%10', image: listingImage(400, 240, 'PUBG UC') },
    { id: 3, title: 'Steam 10 USD Cüzdan Kodu', oldPrice: '350 ₺', newPrice: '315 ₺', discount: '%10', image: listingImage(400, 240, 'Steam') },
    { id: 4, title: 'LoL 1600 RP', oldPrice: '400 ₺', newPrice: '360 ₺', discount: '%10', image: listingImage(400, 240, 'LoL RP') },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#5b68f6] to-[#8b5cf6] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Percent className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Haftanın Fırsatları</h1>
          </div>
          <p className="text-white/80 max-w-xl">En popüler oyunlarda en iyi indirimleri kaçırmayın! Her hafta yenilenen fırsatlarla tasarruf edin.</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden hover:border-[#5b68f6]/50 transition-colors group">
            <div className="relative aspect-video">
              <img src={deal.image} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {deal.discount} İndirim
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-bold mb-4">{deal.title}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs line-through">{deal.oldPrice}</p>
                  <p className="text-[#5b68f6] font-bold text-lg">{deal.newPrice}</p>
                </div>
                <button 
                  onClick={() => handleAddToCart(deal)}
                  className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Satın Al
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-8 text-center">
        <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Fırsatlar Yenileniyor!</h2>
        <p className="text-gray-400">Yeni indirimler için takipte kalın. Bir sonraki güncelleme Pazartesi günü.</p>
      </div>
    </div>
  );
}
