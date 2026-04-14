import { Shield, Lock, Eye, FileText } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function Privacy() {
  return (
    <>
    <SEOHead title="Gizlilik Politikası" description="itemTR gizlilik politikası: kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi edinin." canonical="/gizlilik-politikasi" />
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">Gizlilik Politikası</h1>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              1. Veri Toplama
            </h2>
            <p>
              itemTR olarak, kullanıcılarımıza daha iyi hizmet sunabilmek amacıyla çeşitli veriler toplamaktayız. Bu veriler; kayıt sırasında paylaştığınız e-posta adresi, kullanıcı adı ve profil bilgilerini kapsamaktadır. Ayrıca, platform üzerindeki etkileşimleriniz ve işlem geçmişiniz güvenliğiniz için kaydedilmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              2. Verilerin Kullanımı
            </h2>
            <p>
              Toplanan veriler, hesap güvenliğinizi sağlamak, siparişlerinizi yönetmek ve size özel kampanya/duyurular sunmak amacıyla kullanılır. Kişisel verileriniz, yasal zorunluluklar dışında üçüncü şahıslarla asla paylaşılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              3. Veri Güvenliği
            </h2>
            <p>
              Verileriniz, endüstri standardı şifreleme yöntemleri (SSL) ile korunmaktadır. Ödeme bilgileriniz doğrudan lisanslı ödeme kuruluşları tarafından işlenir ve sunucularımızda saklanmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              4. Çerezler (Cookies)
            </h2>
            <p>
              Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Tarayıcı ayarlarınızdan çerez kullanımını kısıtlayabilirsiniz, ancak bu durum bazı özelliklerin çalışmasını engelleyebilir.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-sm text-gray-500">
          Son güncelleme: 8 Nisan 2026
        </div>
      </div>
    </div>
    </>
  );
}
