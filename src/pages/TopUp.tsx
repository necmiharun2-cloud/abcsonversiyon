import { Smartphone, ShieldCheck, Zap, ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { listingImage } from '../lib/media';

export default function TopUp() {
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
    { id: 'tu1', title: 'Valorant 1200 VP', price: 185.00, category: 'VALORANT', image: listingImage(400, 240, 'VP 1200') },
    { id: 'tu2', title: 'Valorant 2850 VP', price: 425.00, category: 'VALORANT', image: listingImage(400, 240, 'VP 2850') },
    { id: 'tu3', title: 'League of Legends 1600 RP', price: 210.00, category: 'LOL', image: listingImage(400, 240, 'LoL RP') },
    { id: 'tu4', title: 'PUBG Mobile 660 UC', price: 245.00, category: 'PUBG', image: listingImage(400, 240, 'PUBG UC') },
    { id: 'tu5', title: 'Roblox 800 Robux', price: 190.00, category: 'ROBLOX', image: listingImage(400, 240, 'Robux') },
    { id: 'tu6', title: 'Steam 10 USD Wallet', price: 340.00, category: 'STEAM', image: listingImage(400, 240, 'Steam USD') },
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
            <Smartphone className="w-8 h-8 text-blue-500" />
            E-Pin & Top-Up
          </h1>
          <p className="text-gray-400 max-w-xl">En popüler oyunların E-Pin ve yükleme kodları en uygun fiyatlarla burada. Anında teslimat garantisi!</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              Resmi Distribütör
            </div>
            <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold">
              <Zap className="w-4 h-4" />
              Anında Teslimat
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Oyun veya paket ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 bg-[#111218] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 hover:border-blue-500/50 transition-all group">
            <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                {p.category}
              </div>
            </div>
            <h3 className="text-white font-bold text-sm mb-2 line-clamp-1">{p.title}</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-emerald-400 font-bold">{p.price.toFixed(2)} ₺</span>
              <span className="text-[10px] text-gray-500">Anında Teslim</span>
            </div>
            <button 
              onClick={() => handleAddToCart(p)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Satın Al
            </button>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500">
            Aradığınız kriterlere uygun ürün bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
