import { Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { tradeOrchestrator } from '../services/tradeOrchestrator';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { toCents } from '../lib/money';
import { isShopierMode } from '../config/payment';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'wallet'>('card');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const totalOriginalPrice = items.reduce((sum, item) => sum + (Number(item.originalPrice) * item.quantity), 0);
  const discount = totalOriginalPrice - totalPrice;
  const canCheckout = Boolean(user?.emailVerified);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Ödeme için giriş yapmalısınız.');
      return;
    }
    if (items.length === 0) {
      toast.error('Sepetiniz boş.');
      return;
    }
    if (!user.emailVerified) {
      toast.error('Odeme icin once e-posta dogrulamasi yapmalisiniz.');
      return;
    }
    setCheckoutLoading(true);
    try {
      if (isShopierMode()) {
        const lines = items.flatMap((item) =>
          Array.from({ length: item.quantity }, () => ({
            productId: item.id,
            productTitle: item.title,
            productImage: item.image || '',
            price: Number(item.price || 0),
            sellerId: item.sellerId || '',
            sellerName: item.seller || 'Satıcı',
          }))
        );
        const prep = httpsCallable(functions, 'prepareShopierBatchOrders');
        const res = await prep({ items: lines });
        const batchId = (res.data as { batchId: string }).batchId;
        clearCart();
        toast.success('Shopier ödeme sayfasına yönlendiriliyorsunuz.');
        navigate(`/odeme/shopier?batchId=${encodeURIComponent(batchId)}`);
        return;
      }

      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const orderRef = await addDoc(collection(db, 'orders'), {
            productId: item.id,
            productTitle: item.title,
            productImage: item.image || '',
            image: item.image || '',
            buyerId: user.uid,
            sellerId: item.sellerId || '',
            sellerName: item.seller || 'Satıcı',
            price: Number(item.price || 0),
            amountCents: toCents(Number(item.price || 0)),
            status: 'created',
            escrowStatus: 'none',
            paymentStatus: 'pending',
            createdAt: serverTimestamp(),
          });

          const paymentIntent = await tradeOrchestrator.paymentProvider.initPayment({
            userId: user.uid,
            orderId: orderRef.id,
            amount: Number(item.price || 0),
            currency: 'TRY',
            method: paymentMethod,
          });

          if (paymentIntent.status === 'requires_action') {
            toast.success('3D Secure doğrulaması başlatıldı.');
            const threeDsResult = await tradeOrchestrator.paymentProvider.confirm3DS({
              providerRef: paymentIntent.providerRef,
            });
            if (threeDsResult.status !== 'authorized') {
              toast.error('3D Secure doğrulaması başarısız.');
              continue;
            }
          }

          const captureResult = await tradeOrchestrator.paymentProvider.capture({
            userId: user.uid,
            providerRef: paymentIntent.providerRef,
            amount: Number(item.price || 0),
          });

          if (captureResult.status === 'captured') {
            await addDoc(collection(db, 'notifications'), {
              userId: user.uid,
              title: 'Ödeme Başarılı',
              message: `${item.title} için ödemeniz başarıyla alındı.`,
              type: 'success',
              isRead: false,
              createdAt: serverTimestamp(),
            });
            if (item.sellerId) {
              await addDoc(collection(db, 'notifications'), {
                userId: item.sellerId,
                title: 'Yeni Sipariş',
                message: `${item.title} ürünü için yeni siparişiniz var.`,
                type: 'info',
                isRead: false,
                createdAt: serverTimestamp(),
              });
            }
          }
        }
      }
      clearCart();
      toast.success('Ödeme tamamlandı, siparişleriniz oluşturuldu.');
    } catch (error) {
      console.error(error);
      toast.error('Ödeme işlemi başarısız oldu.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h1 className="text-3xl font-bold text-white">Sepetim</h1>
        <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Alışverişe Geri Dön
        </Link>
      </div>

      {/* Coupons Section */}
      <div className="home-section rounded-2xl p-4 sm:p-5">
        <h2 className="text-lg font-bold text-white mb-1">Kupon Kodlarım</h2>
        <p className="text-sm text-gray-400 mb-4">Herkese açık kampanya kodlarını buradan tek tıkla uygulayabilirsiniz. Gizli kodları aşağıdaki alana yazman yeterli.</p>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Coupon 1 */}
          <div className="bg-[#1a1b23] border border-white/5 rounded-xl flex overflow-hidden">
            <div className="bg-[#5b68f6]/20 w-12 flex items-center justify-center border-r border-white/5">
              <span className="text-[#5b68f6] font-bold -rotate-90 tracking-widest text-sm">KUPON</span>
            </div>
            <div className="p-4 flex-1">
              <h3 className="text-white font-bold mb-1">THEBOYS5</h3>
              <p className="text-emerald-400 text-sm font-medium mb-2">%5 indirim</p>
              <p className="text-yellow-500/80 text-xs mb-4 leading-relaxed">Bu kupon sepetinizdeki kategoriler için geçerli değil. Sepetinizde bu kuponun geçerli olduğu...</p>
              <button className="w-full py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors">
                + Kuponu Uygula
              </button>
            </div>
          </div>

          {/* Coupon 2 */}
          <div className="bg-[#1a1b23] border border-white/5 rounded-xl flex overflow-hidden">
            <div className="bg-[#5b68f6]/20 w-12 flex items-center justify-center border-r border-white/5">
              <span className="text-[#5b68f6] font-bold -rotate-90 tracking-widest text-sm">KUPON</span>
            </div>
            <div className="p-4 flex-1">
              <h3 className="text-white font-bold mb-1">BIZIMCOCUKLAR</h3>
              <p className="text-emerald-400 text-sm font-medium mb-2">%5 indirim</p>
              <p className="text-yellow-500/80 text-xs mb-4 leading-relaxed">Bu kupon sepetinizdeki kategoriler için geçerli değil. Sepetinizde bu kuponun geçerli olduğu...</p>
              <button className="w-full py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors">
                + Kuponu Uygula
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Cart Items */}
        <div className="space-y-4">
          <div className="bg-[#1a1b23] border border-white/5 rounded-xl p-4 text-sm text-gray-300">
            <span className="font-bold text-white">Adimlar:</span> Sepet Kontrolu {'->'} Odeme Yontemi {'->'} Siparis Onayi
          </div>
          {items.length === 0 ? (
            <div className="bg-[#1a1b23] border border-white/5 rounded-xl p-8 text-center">
              <p className="text-gray-400">Sepetinizde ürün bulunmamaktadır.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-[#1a1b23] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {item.image ? (
                  <img src={item.image} alt="Product" className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-[#111218] flex items-center justify-center text-[10px] text-gray-400">Görsel Yok</div>
                )}
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">Stoklardan anında teslim edilecektir.</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Satıcı :</span>
                    <span className="text-white bg-white/5 px-2 py-1 rounded flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-[#23242f] inline-block" />
                      {item.seller}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                  <div className="flex items-center bg-[#111218] rounded-lg border border-white/5">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >-</button>
                    <div className="w-10 text-center text-white text-sm">{item.quantity}</div>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >+</button>
                  </div>
                  <div className="text-right min-w-[92px]">
                    <div className="text-gray-500 line-through text-sm">{(Number(item.originalPrice) || 0).toFixed(2)} ₺</div>
                    <div className="text-emerald-400 font-bold text-lg">{(Number(item.price) || 0).toFixed(2)} ₺</div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="w-full space-y-4 xl:sticky xl:top-24">
          {!user && (
            <div className="bg-[#1a1b23] border border-white/5 rounded-xl p-4 text-sm text-gray-300">
              Odeme tamamlamak icin once <Link to="/login?next=/sepet" className="accent-text font-bold">giris yapin</Link>.
            </div>
          )}
          {user && !canCheckout && (
            <div className="bg-[#1a1b23] border border-white/5 rounded-xl p-4 text-sm text-gray-300">
              E-posta dogrulamasi tamamlanmadan odeme kilitli. Profilinizden dogrulama e-postasi gonderip tekrar deneyin.
            </div>
          )}
          <div className="bg-[#1a1b23] border border-white/5 rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-6">Sepet Özeti</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sepet Toplamı</span>
                <span className="text-white font-medium">{(Number(totalOriginalPrice) || 0).toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">İndirim Tutarı</span>
                <span className="text-emerald-400 font-medium">-{(Number(discount) || 0).toFixed(2)} ₺</span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-white font-bold">Toplam</span>
                <span className="text-white font-bold text-xl">{(Number(totalPrice) || 0).toFixed(2)} ₺</span>
              </div>
            </div>

            <div className="bg-[#111218] rounded-lg p-4 mb-4 border border-white/5">
              <h3 className="text-white font-medium text-sm mb-1">Kupon Kodunuzmu Var?</h3>
              <p className="text-gray-400 text-xs mb-3">Kupon kodunuzu girerek indirimden yararlanabilirsiniz.</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 bg-[#1a1b23] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5b68f6] transition-colors"
                />
                <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Kullan
                </button>
              </div>
            </div>

            <div className="bg-[#111218] rounded-lg p-4 mb-5 border border-white/5">
              <h3 className="text-white font-medium text-sm mb-2">Ödeme Yöntemi</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button onClick={() => setPaymentMethod('card')} className={`py-2 rounded ${paymentMethod === 'card' ? 'bg-[#5b68f6] text-white' : 'bg-[#1a1b23] text-gray-300'}`}>Kart (3DS)</button>
                <button onClick={() => setPaymentMethod('wallet')} className={`py-2 rounded ${paymentMethod === 'wallet' ? 'bg-[#5b68f6] text-white' : 'bg-[#1a1b23] text-gray-300'}`}>Cüzdan</button>
                <button onClick={() => setPaymentMethod('bank_transfer')} className={`py-2 rounded ${paymentMethod === 'bank_transfer' ? 'bg-[#5b68f6] text-white' : 'bg-[#1a1b23] text-gray-300'}`}>Havale</button>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || items.length === 0 || !user || !canCheckout}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 text-white py-3 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              {checkoutLoading ? 'Odeme Isleniyor...' : 'Siparisi Tamamla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
