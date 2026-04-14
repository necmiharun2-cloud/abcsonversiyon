import { useEffect } from 'react';
import { RefreshCcw, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function RefundPolicy() {
  useEffect(() => {
    document.title = 'İade Politikası | itemTR';
    return () => { document.title = 'itemTR - Güvenli Oyun İçi Alışveriş ve İlan Pazarı'; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <RefreshCcw className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">İade Politikası</h1>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Hangi Durumlarda İade Yapılır?
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Satın alınan kodun hatalı veya kullanılmış çıkması durumunda.</li>
              <li>İlan pazarı alışverişlerinde ürünün tarif edildiği gibi çıkmaması durumunda.</li>
              <li>Satıcının ürünü taahhüt edilen süre içerisinde teslim etmemesi durumunda.</li>
            </ul>
          </section>

          <section className="bg-red-500/5 border border-red-500/10 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Hangi Durumlarda İade Yapılmaz?
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Ürün/kod başarıyla teslim edildikten ve görüntülendikten sonra "vazgeçtim" gerekçesiyle.</li>
              <li>Kullanıcı hatasından kaynaklanan (yanlış hesaba yükleme vb.) durumlarda.</li>
              <li>Dijital ürünün bölge kilidi uyarısına rağmen yanlış bölge için satın alınması durumunda.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              İade Süreci Nasıl İşler?
            </h2>
            <p>
              İade talebinizi "Destek Sistemi" üzerinden bir talep oluşturarak iletebilirsiniz. Talebiniz incelendikten sonra (genellikle 24 saat içinde) onaylanırsa, tutar itemTR bakiyenize anında iade edilir. Banka hesabınıza geri çekim talepleri bankanıza bağlı olarak 1-3 iş günü sürebilir.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-sm text-gray-500">
          Son güncelleme: 8 Nisan 2026
        </div>
      </div>
    </div>
  );
}
