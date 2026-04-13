import { FileText, Truck, RefreshCcw, AlertCircle } from 'lucide-react';

export default function DistanceSales() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">Mesafeli Satış Sözleşmesi</h1>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Taraflar</h2>
            <p>
              İşbu sözleşme, itemTR platformu üzerinden alışveriş yapan kullanıcı (ALICI) ile platformda ilan yayınlayan satıcı (SATICI) arasında, itemTR aracılığıyla akdedilmiştir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" />
              2. Teslimat Koşulları
            </h2>
            <p>
              Dijital ürünler (E-pin, CD-Key vb.) ödeme onayının ardından anında ALICI'nın hesabına veya e-posta adresine teslim edilir. İlan pazarı ürünlerinde teslimat süresi satıcının çevrimiçi olma durumuna göre değişiklik gösterebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-emerald-400" />
              3. Cayma Hakkı
            </h2>
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun gereği, dijital içerikler ve anında ifa edilen hizmetler (tek kullanımlık kodlar, oyun içi paralar vb.) cayma hakkı kapsamı dışındadır. Ürün kullanıldıktan veya kod görüntülendikten sonra iade kabul edilmez.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              4. Uyuşmazlıkların Çözümü
            </h2>
            <p>
              Sözleşmeden doğan uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir. itemTR, alıcı ve satıcı arasında aracı kurum sıfatıyla uyuşmazlıkların çözümünde moderasyon desteği sağlar.
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
