import { useEffect } from 'react';
import { Shield, AlertTriangle, Mail, FileText, CheckCircle2 } from 'lucide-react';

export default function TelitIhlali() {
  useEffect(() => {
    document.title = 'Telif Hakkı İhlali Bildirimi | itemTR';
    return () => { document.title = 'itemTR - Güvenli Oyun İçi Alışveriş ve İlan Pazarı'; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Telif Hakkı İhlali Bildirimi</h1>
            <p className="text-gray-400 text-sm mt-1">DMCA & Fikri Mülkiyet Politikası</p>
          </div>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
              <p>
                itemTR olarak fikri mülkiyet haklarına saygı gösteriyor ve telif hakkı sahiplerinin haklarını korumayı taahhüt ediyoruz. 
                Platformumuzda yayınlanan içeriklerin telif hakkı ihlali oluşturduğunu düşünüyorsanız, 
                aşağıdaki prosedürü izleyerek bize bildirim yapabilirsiniz.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              1. Bildirim Gereksinimleri
            </h2>
            <p className="mb-4">
              Geçerli bir telif hakkı ihlali bildirimi aşağıdaki bilgileri içermelidir:
            </p>
            <ul className="space-y-3 pl-4">
              {[
                'Telif hakkı sahibinin veya yetkili temsilcisinin elektronik ya da fiziksel imzası',
                'Telif hakkını ihlal ettiğini iddia ettiğiniz orijinal eserin tanımı',
                'İhlal ettiğini iddia ettiğiniz materyalin platformumuzda nerede bulunduğunun açık URL veya tanımı',
                'Adınız, adresiniz, telefon numaranız ve e-posta adresiniz',
                'İhlal iddiasının yetkisiz kullanımı kapsadığına dair iyi niyetli bir beyan',
                'Bildirimdeki bilgilerin doğru olduğuna ve telif hakkı sahibi ya da yetkili temsilcisi olduğunuza dair yeminli beyan',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              2. Bildirim Nasıl Yapılır?
            </h2>
            <p className="mb-4">
              Telif hakkı ihlali bildirimlerinizi aşağıdaki iletişim kanalları üzerinden iletebilirsiniz:
            </p>
            <div className="bg-[#111218] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm">E-posta: <a href="mailto:hukuk@itemtr.com" className="text-blue-400 hover:underline">hukuk@itemtr.com</a></span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Destek: <a href="mailto:destek@itemtr.com" className="text-blue-400 hover:underline">destek@itemtr.com</a></span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Bildiriminizi aldıktan sonra 5 iş günü içinde inceleme yapılacak ve gerekli aksiyonlar alınacaktır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              3. Karşı Bildirim Hakkı
            </h2>
            <p>
              İçeriğinizin hatalı olarak kaldırıldığını düşünüyorsanız, karşı bildirim hakkınız bulunmaktadır. 
              Karşı bildirim, yukarıdaki iletişim kanalları üzerinden yapılabilir ve aynı bilgileri içermelidir. 
              Yanıltıcı ya da kötü niyetli bildirimler hukuki sonuçlar doğurabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              4. Tekrarlayan İhlaller
            </h2>
            <p>
              Platformumuz, tekrarlayan telif hakkı ihlalcilerinin hesaplarını kalıcı olarak askıya alma politikası uygulamaktadır. 
              Birden fazla geçerli ihlal bildirimine konu olan kullanıcıların hesapları kapatılabilir.
            </p>
          </section>

          <div className="bg-[#111218] border border-white/5 rounded-xl p-5 text-sm text-gray-400">
            <p>Son güncelleme: Ocak 2025 — Bu politika, 5846 sayılı Fikir ve Sanat Eserleri Kanunu ve uluslararası telif hakkı mevzuatı çerçevesinde uygulanmaktadır.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
