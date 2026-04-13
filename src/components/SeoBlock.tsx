import { useState } from "react";
import { ChevronDown } from "lucide-react";

const SeoBlock = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
      <h2 className="text-xl font-bold text-foreground">itemTR: Türkiye'nin En Gelişmiş Oyuncu Alışveriş Platformu</h2>
      
      <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
        <p>
          <strong className="text-foreground">itemTR</strong>, Türkiye'deki bilgisayar, mobil ve konsol oyuncularına en kaliteli hizmeti verebilmek adına kurulmuş dijital ürün alım-satım platformudur. Genç, dinamik ve sektörü çok yakından tanıyan ekibimiz sayesinde oyuncuların ihtiyacını hızlı şekilde anlıyor ve bu ihtiyaçlara göre güncellemeler yapıyoruz.
        </p>
        <p>
          itemTR'ın hedefi tüm dünyadaki oyunculara her zaman uygun fiyatlar ve komisyonlarla, sektöre hak ettiği kaliteli ve profesyonel hizmeti sunmaktır. Sitemizdeki tüm ödeme işlemlerinde 3D Secure adı verilen dünyanın en güvenli ödeme kontrol sistemi uygulanmaktadır.
        </p>

        {expanded && (
          <>
            <h3 className="text-base font-bold text-foreground pt-2">Neden itemTR?</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><strong className="text-foreground">Güvenli Alışveriş:</strong> 256 bit SSL sertifikası ve 3D Secure güvenlik önlemleri ile alışverişlerinizin güvenliğini garanti altına alır.</li>
              <li><strong className="text-foreground">Geniş Ürün Yelpazesi:</strong> 650'den fazla kategoride 15.000'den fazla ürün ile stoklarımız her zaman güncel.</li>
              <li><strong className="text-foreground">Uygun Fiyatlar:</strong> Düşük komisyon oranlarıyla bütçenizi zorlamadan alışveriş yapabilirsiniz.</li>
              <li><strong className="text-foreground">Hızlı Teslimat:</strong> E-Pin, hediye kartları ve CD Key ürünleri 7/24 anında teslim edilir.</li>
              <li><strong className="text-foreground">Müşteri Memnuniyeti:</strong> 7/24 canlı destek hattımız ve iade/değişim kolaylığı ile her zaman yanınızdayız.</li>
            </ul>

            <h3 className="text-base font-bold text-foreground pt-2">İlan & Oyuncu Pazarı</h3>
            <p>
              itemTR oluşturduğu oyuncu pazarında 550'den fazla kategoride alışveriş yapılabilmesine imkan sağlıyor. Oyun hesapları, oyun içi kostümler, oyun paraları, sosyal medya hizmetleri, freelancer hizmetler, yazılım lisansları ve çok daha fazlası ilan pazarımızda. 70.000'den fazla ilanı inceleyebilir, ilan satın alabilir veya hemen ilan ekleyerek satışa başlayabilirsiniz.
            </p>

            <h3 className="text-base font-bold text-foreground pt-2">Düşük Komisyon Oranları</h3>
            <p>
              Düşük komisyon oranımızla siz değerli oyunculara daha fazla para kazanma imkanı sunuyoruz. Komisyon oranımız %7'dir. Hatta 1.000₺ ve üzeri satışlarınızda komisyon oranı %5'e düşebilmektedir.
            </p>

            <h3 className="text-base font-bold text-foreground pt-2">E-Pin, Hediye Kartları ve CD Key Ürünleri</h3>
            <p>
              2000'den fazla dijital ürünü stoklarımızda barındırıyoruz. Birçok ülkede geçerli ürünleri 7/24 anında teslim alabilirsiniz. Bu ürünlerde teslimat süremiz 1-2 dakika aralığındadır.
            </p>

            <h3 className="text-base font-bold text-foreground pt-2">7/24 Canlı Destek</h3>
            <p>
              Canlı destek ekibimiz 7/24 saat siz değerli itemTR müşterilerine hizmet vermektedir. Web sitemizin sağ alt köşesinden canlı destek ekibine ulaşabilirsiniz.
            </p>
          </>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
      >
        {expanded ? "Daha az göster" : "Devamını görüntüle"}
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
};

export default SeoBlock;
