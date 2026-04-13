import { Gift, ShieldCheck, Zap, ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { listingImage } from '../lib/media';

export default function GiftCards() {
  const { addToCart } = useCart();
  const [search, setSearch] = useState('');
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

  const products = [
    { id: 'gc1', title: 'Netflix 100 TL Hediye Kartı', price: 100.00, category: 'NETFLIX', image: listingImage(400, 240, 'Netflix') },
    { id: 'gc2', title: 'Spotify 3 Aylık Premium', price: 120.00, category: 'SPOTIFY', image: listingImage(400, 240, 'Spotify') },
    { id: 'gc3', title: 'Google Play 50 TL', price: 50.00, category: 'GOOGLE', image: listingImage(400, 240, 'Google Play') },
    { id: 'gc4', title: 'App Store 100 TL', price: 100.00, category: 'APPLE', image: listingImage(400, 240, 'App Store') },
    { id: 'gc5', title: 'Amazon 250 TL Gift Card', price: 250.00, category: 'AMAZON', image: listingImage(400, 240, 'Amazon') },
    { id: 'gc6', title: 'Xbox 100 TL Cüzdan Kodu', price: 100.00, category: 'XBOX', image: listingImage(400, 240, 'Xbox') },
  ];

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      seller: 'system',
      sellerId: 'system',
      originalPrice: product.oldPrice || product.price
    });
    showCartToast(product.title);
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#1a1b23] rounded-2xl p-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gift className="w-8 h-8 text-pink-500" />
            Hediye Kartları
          </h1>
          <p className="text-gray-400 max-w-xl">Netflix, Spotify, Google Play ve daha fazlası için hediye kartları. Sevdiklerinize veya kendinize en güzel hediye!</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              Güvenli Ödeme
            </div>
            <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold">
              <Zap className="w-4 h-4" />
              Anında Kod Teslimi
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Kart veya marka ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 bg-[#111218] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 hover:border-pink-500/50 transition-all group">
            <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                {p.category}
              </div>
            </div>
            <h3 className="text-white font-bold text-sm mb-2 line-clamp-1">{p.title}</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-emerald-400 font-bold">{p.price.toFixed(2)} ₺</span>
              <span className="text-[10px] text-gray-500">Dijital Kod</span>
            </div>
            <button 
              onClick={() => handleAddToCart(p)}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Satın Al
            </button>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500">
            Aradığınız kriterlere uygun kart bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
