import { Link, useSearchParams } from 'react-router-dom';

/** Shopier return_url sonrası kullanıcı bilgilendirme (asıl onay webhook ile yapılır). */
export default function ShopierPaymentResult() {
  const [params] = useSearchParams();
  const batchId = params.get('batchId');

  return (
    <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
      <h1 className="text-2xl font-bold text-white">Ödeme işlemi</h1>
      <p className="text-white/70 text-sm">
        Ödeme sonucu Shopier üzerinden bildirilir; sipariş durumunuz birkaç saniye içinde güncellenir.
        {batchId && (
          <span className="block mt-2 text-white/40 text-xs break-all">Referans: {batchId}</span>
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/siparislerim"
          className="inline-flex justify-center px-6 py-3 rounded-xl bg-[#5b68f6] text-white font-semibold hover:bg-[#4a55d6]"
        >
          Siparişlerim
        </Link>
        <Link to="/" className="inline-flex justify-center px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15">
          Anasayfa
        </Link>
      </div>
    </div>
  );
}
