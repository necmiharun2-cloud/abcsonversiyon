import { useState } from 'react';
import { ShoppingCart, Heart, Share2, Bell, AlertTriangle, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';

interface PurchaseCardProps {
  product: any;
}

type ProtectionKey = 'standard' | '7d' | '30d';
const protectionFee: Record<ProtectionKey, number> = { standard: 0, '7d': 15, '30d': 40 };

export default function PurchaseCard({ product }: PurchaseCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [protection, setProtection] = useState<ProtectionKey>('standard');
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();
  const price = Number(product.price || 0);
  const totalUnit = price + protectionFee[protection];
  const protectionLabel: Record<ProtectionKey, string> = {
    standard: 'Standart Koruma',
    '7d': '7 Günlük Koruma',
    '30d': '30 Günlük Koruma',
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      title: product.title,
      price: totalUnit,
      originalPrice: product.oldPrice,
      seller: product.sellerName,
      sellerId: product.sellerId || '',
      image: product.image,
      meta: { protection }
    });

    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#1a1b23] shadow-2xl rounded-xl pointer-events-auto flex flex-col border border-white/10 overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Sepete Eklendi</span>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>
        {/* Body */}
        <div className="p-4 flex gap-4">
           <img src={product.image} alt="Product" className="w-16 h-16 rounded-lg object-cover" />
           <div>
             <h4 className="text-white text-sm font-medium mb-1 line-clamp-2">{product.title}</h4>
             <p className="text-gray-400 text-xs">{quantity}x {totalUnit.toFixed(2)}₺</p>
           </div>
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#111218]">
           <div className="text-gray-400 text-sm">Toplam: <span className="text-white font-bold text-lg ml-2">{(totalUnit * quantity).toFixed(2)}₺</span></div>
           <Link 
             to="/sepet" 
             onClick={() => toast.dismiss(t.id)} 
             className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
           >
             Sepete Git
           </Link>
        </div>
      </div>
    ), { duration: 5000, position: 'top-right' });
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id.toString(),
      title: product.title,
      price: totalUnit,
      originalPrice: product.oldPrice,
      seller: product.sellerName,
      sellerId: product.sellerId || '',
      image: product.image,
      meta: { protection }
    });
    navigate('/sepet');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Ürün bağlantısı kopyalandı!');
  };

  const handleComingSoon = (feature: string) => {
    toast.success(`${feature} özelliği yakında eklenecek!`);
  };

  const isFav = isFavorite(product.id.toString());

  return (
    <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
      <div className="p-4">
        {/* Price */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-3xl font-bold text-emerald-500">{totalUnit.toFixed(2)} ₺</div>
            <div className="text-[10px] text-gray-400">
              {protection === 'standard'
                ? 'İlan Ücreti'
                : `İlan Ücreti + ${protectionLabel[protection]} (+${protectionFee[protection].toFixed(2)} ₺)`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">10+</div>
            <div className="text-[10px] text-gray-400">Stok Sayısı</div>
          </div>
        </div>

        {/* Protection Packages */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 mb-3">
            <ShieldCheck className="w-4 h-4" />
            Alıcı Koruma Paketi (İsteğe Bağlı)
          </div>
          
          <div className="space-y-2">
            <label className={`flex items-center justify-between p-3 rounded bg-[#23242f] cursor-pointer border transition-colors ${protection === 'standard' ? 'border-[#5b68f6]' : 'border-white/5 hover:border-white/20'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="protection"
                  className="hidden"
                  checked={protection === 'standard'}
                  onChange={() => setProtection('standard')}
                />
                <div className={`w-4 h-4 rounded-full border-4 ${protection === 'standard' ? 'border-[#5b68f6] bg-white' : 'border-gray-500 bg-transparent'}`}></div>
                <span className="text-sm text-white font-medium">Standart Koruma</span>
              </div>
              <span className="text-xs text-gray-400">Ücretsiz</span>
            </label>
            
            <label className={`flex items-center justify-between p-3 rounded bg-[#23242f] cursor-pointer border transition-colors ${protection === '7d' ? 'border-[#5b68f6]' : 'border-white/5 hover:border-white/20'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="protection"
                  className="hidden"
                  checked={protection === '7d'}
                  onChange={() => setProtection('7d')}
                />
                <div className={`w-4 h-4 rounded-full border-4 ${protection === '7d' ? 'border-[#5b68f6] bg-white' : 'border-gray-500 bg-transparent'}`}></div>
                <span className="text-sm text-gray-300">7 Günlük Koruma</span>
              </div>
              <span className="text-xs text-emerald-500 font-medium">+15,00 ₺</span>
            </label>
            
            <label className={`flex items-center justify-between p-3 rounded bg-[#23242f] cursor-pointer border transition-colors ${protection === '30d' ? 'border-[#5b68f6]' : 'border-white/5 hover:border-white/20'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="protection"
                  className="hidden"
                  checked={protection === '30d'}
                  onChange={() => setProtection('30d')}
                />
                <div className={`w-4 h-4 rounded-full border-4 ${protection === '30d' ? 'border-[#5b68f6] bg-white' : 'border-gray-500 bg-transparent'}`}></div>
                <span className="text-sm text-gray-300">30 Günlük Koruma</span>
              </div>
              <span className="text-xs text-emerald-500 font-medium">+40,00 ₺</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mb-6">
          <button 
            onClick={handleBuyNow}
            className="w-full btn-buy text-white font-extrabold py-3.5 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Hemen Satın Al ({(totalUnit * quantity).toFixed(2)} ₺)
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleAddToCart}
              className="flex-1 btn-buy text-white font-extrabold py-3.5 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Sepete Ekle
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative bg-[#1a1b23] px-2 text-[10px] text-gray-500">veya</span>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button 
            onClick={() => toggleFavorite(product.id.toString())}
            className={`bg-[#23242f] hover:bg-[#2d2e3b] text-xs py-2.5 rounded flex items-center justify-center gap-2 transition-colors ${isFav ? 'text-red-500' : 'text-gray-300'}`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} /> Favori
          </button>
          <button 
            onClick={handleShare}
            className="bg-[#23242f] hover:bg-[#2d2e3b] text-gray-300 text-xs py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Paylaş
          </button>
          <button 
            onClick={() => toast.success('Fiyat alarmı kuruldu!')}
            className="bg-[#23242f] hover:bg-[#2d2e3b] text-gray-300 text-xs py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Bell className="w-4 h-4" /> Fiyat Alarmı
          </button>
          <button 
            onClick={() => toast.success('Stok alarmı kuruldu!')}
            className="bg-[#23242f] hover:bg-[#2d2e3b] text-gray-300 text-xs py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" /> Stok Alarmı
          </button>
        </div>

        {/* Guarantee Info */}
        <div className="bg-[#23242f] rounded-lg p-4 flex gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <div className="text-sm text-white font-bold mb-1">itemTR Güvenli Alışveriş</div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              itemTR alışveriş süreci sona erene kadar ücretinizi güvene almaktadır. Alışveriş sonrası süreçte iade, teknik destek gibi konulardan ürünün satıcısı sorumludur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
