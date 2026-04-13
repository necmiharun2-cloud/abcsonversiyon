import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "İtemSatış nedir ve nasıl çalışır?",
    a: "İtemSatış, Türkiye'nin en güvenilir dijital ürün alım-satım platformudur. Satıcılar ilanlarını yayınlar, alıcılar güvenli ödeme sistemi ile satın alır. İtemSatış güvencesi ile her işlem koruma altındadır.",
  },
  {
    q: "Ödeme yöntemleri nelerdir?",
    a: "Kredi kartı (Visa, Mastercard, Troy), Papara, havale/EFT, Bitcoin, USDT ve Steam bakiyesi ile ödeme yapabilirsiniz. Tüm ödemeler 256-bit SSL ile şifrelenir.",
  },
  {
    q: "Satıcı nasıl olunur?",
    a: "Ücretsiz kayıt olduktan sonra profilinizi doğrulayarak hemen satışa başlayabilirsiniz. Kimlik doğrulama yapan satıcılar 'Onaylı Satıcı' rozeti alır ve daha fazla güven kazanır.",
  },
  {
    q: "Teslimat süresi ne kadar?",
    a: "Dijital ürünlerin çoğu otomatik teslimat ile saniyeler içinde teslim edilir. Manuel teslimat gerektiren ürünlerde ortalama teslimat süresi 5-30 dakikadır.",
  },
  {
    q: "İade ve şikâyet süreci nasıl işler?",
    a: "Ürünle ilgili sorun yaşamanız durumunda 'Destek Talebi' oluşturarak 7/24 destek ekibimizden yardım alabilirsiniz. İtemSatış güvencesi kapsamında haklı talepler hızlıca çözüme kavuşturulur.",
  },
  {
    q: "Hesabım güvende mi?",
    a: "Evet! İki faktörlü kimlik doğrulama (2FA), oturum yönetimi ve gelişmiş güvenlik önlemleri ile hesabınız her zaman koruma altındadır.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">Sıkça Sorulan Sorular</h2>
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-secondary/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{faq.q}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
