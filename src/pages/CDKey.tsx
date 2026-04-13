import { Key, ShieldCheck, Zap, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { listingImage } from '../lib/media';

export default function CDKey() {
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
  const keys = [
    { id: 'ck1', title: 'Windows 11 Pro Retail Key', price: 49.90, stock: '100+', image: listingImage(400, 240, 'Win11') },
    { id: 'ck2', title: 'Office 2026 Pro Plus Key', price: 89.90, stock: '50+', image: listingImage(400, 240, 'Office') },
    { id: 'ck3', title: 'Kaspersky Total Security 1 Yıl', price: 129.90, stock: '20+', image: listingImage(400, 240, 'Kaspersky') },
  ];

  const handleBuy = (product: any) => {
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
            <Key className="w-8 h-8 text-yellow-500" />
            Lisans & CD-Key
          </h1>
          <p className="text-gray-400 max-w-xl">En ucuz Windows, Office ve Antivirüs lisansları anında teslimat seçeneğiyle burada.</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              %100 Güvenli
            </div>
            <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold">
              <Zap className="w-4 h-4" />
              Anında Teslimat
            </div>
          </div>
        </div>
        <img src={listingImage(400, 240, 'CD Key')} className="w-64 h-40 object-cover rounded-xl shadow-2xl" alt="" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keys.map((k) => (
          <div key={k.id} className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 hover:border-yellow-500/50 transition-all group">
            <img src={k.image} alt={k.title} className="w-full aspect-video object-cover rounded-lg mb-4" />
            <h3 className="text-white font-bold text-sm mb-2 line-clamp-1">{k.title}</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-emerald-400 font-bold">{k.price.toFixed(2)} ₺</span>
              <span className="text-[10px] text-gray-500">Stok: {k.stock}</span>
            </div>
            <button 
              onClick={() => handleBuy(k)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Satın Al
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
