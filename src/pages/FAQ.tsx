import { 
  HelpCircle, ChevronDown, ChevronUp, Search, Package, CreditCard, 
  User, Shield, BookOpen, ArrowLeft, Star, TrendingUp
} from 'lucide-react';
import { useState, useMemo } from 'react';
import SEOHead from '../components/SEOHead';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: Star },
  { id: 'ilan-satin-alma', label: 'İlan Satın Alma', icon: Package, color: 'text-blue-400' },
  { id: 'ilan-satisi', label: 'İlan Satışı', icon: TrendingUp, color: 'text-emerald-400' },
  { id: 'para-yukleme', label: 'Para Yükleme', icon: CreditCard, color: 'text-amber-400' },
  { id: 'para-cekme', label: 'Para Çekme', icon: CreditCard, color: 'text-purple-400' },
  { id: 'para-iadesi', label: 'Para İadesi', icon: CreditCard, color: 'text-red-400' },
  { id: 'profil-hesap', label: 'Profil ve Hesap', icon: User, color: 'text-pink-400' },
  { id: 'guvenlik', label: 'Güvenlik', icon: Shield, color: 'text-cyan-400' },
  { id: 'ipuclari', label: 'İpuçları', icon: BookOpen, color: 'text-orange-400' },
];

const FAQS = [
  // En Çok Aranan
  { category: 'popular', question: 'Hesabıma nasıl bakiye yüklerim?', answer: 'Kredi kartı, banka kartı, havale/EFT, mobil ödeme veya kripto para gibi birçok ödeme yöntemiyle hesabınıza bakiye yükleyebilirsiniz. "Bakiye Yükle" sayfasından istediğiniz yöntemi seçerek hızlıca işlem yapabilirsiniz.' },
  { category: 'popular', question: 'Kartımdan para kesilmesine rağmen bakiyeme eklenmedi', answer: 'Ödeme işlemlerinde bazen bankalar arası gecikmeler yaşanabilir. İşleminiz 15 dakika içinde hesabınıza yansımazsa, dekont numarası ile destek talebi oluşturun.' },
  { category: 'popular', question: 'Sitedeki bakiyemi banka hesabıma nasıl çekerim?', answer: 'Para Çekme sayfasından IBAN bilgilerinizi girerek bakiyenizi banka hesabınıza çekebilirsiniz. Çekim talepleri genellikle aynı gün içinde işleme alınır.' },
  { category: 'popular', question: 'Ürün iadesi var mı?', answer: 'Evet, ürün teslim edilmeden önce iade talebinde bulunabilirsiniz. Teslimat sonrası iadeler için destek ekibiyle iletişime geçmeniz gerekmektedir.' },

  // İlan Satın Alma
  { category: 'ilan-satin-alma', question: 'itemTR Instagram veya Whatsapp\'tan satış yapar mı?', answer: 'Hayır, itemTR sadece resmi web sitesi üzerinden satış yapmaktadır. Sosyal medya hesaplarından yapılan satış tekliflerine itibar etmeyin.' },
  { category: 'ilan-satin-alma', question: 'İlan siparişimin takibini nasıl yapabilirim?', answer: 'Siparişlerim sayfasından tüm siparişlerinizi görüntüleyebilir, durumlarını takip edebilir ve satıcıyla iletişime geçebilirsiniz.' },
  { category: 'ilan-satin-alma', question: 'Favori İlan Sistemi Nedir?', answer: 'Beğendiğiniz ilanları favorilerinize ekleyerek daha sonra kolayca ulaşabilirsiniz. İlan detay sayfasındaki kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.' },
  { category: 'ilan-satin-alma', question: 'İlan Alışveriş Sistemi Nasıl İşliyor?', answer: 'Satın aldığınızda ödeme itemTR havuzunda bekletilir. Ürün teslim edildikten ve siz onay verdikten sonra ödeme satıcıya aktarılır. Bu sistemle paranız her zaman güvendedir.' },
  { category: 'ilan-satin-alma', question: 'Nasıl ilan alırım?', answer: 'İlan detay sayfasında "Satın Al" butonuna tıklayarak ilanı satın alabilirsiniz. Yeterli bakiyeniz yoksa bakiye yükleme sayfasına yönlendirileceksiniz.' },
  { category: 'ilan-satin-alma', question: 'Sipariş Raporlama ve Süreç', answer: 'Herhangi bir sorun yaşamanız durumunda sipariş detay sayfasından "Sorun Bildir" butonuna tıklayarak durumu raporlayabilirsiniz.' },

  // İlan Satışı
  { category: 'ilan-satisi', question: 'İlan satışı kesintileri ne kadar?', answer: 'Standart satıcılarda %5, güvenilir satıcılarda %3, mağaza sahiplerinde %2 komisyon uygulanmaktadır. Kategorilere göre farklılık gösterebilir.' },
  { category: 'ilan-satisi', question: 'Aktif ilanlarıma ve sattığım ilanlarıma nereden ulaşabilirim?', answer: 'Profil sayfanızdan veya kontrol panelinizden "İlanlarım" bölümüne giderek tüm ilanlarınızı görüntüleyebilirsiniz.' },
  { category: 'ilan-satisi', question: 'Nasıl Satış Yapabilirim?', answer: 'Ücretsiz üye olduktan sonra "İlan Ekle" sayfasından ilanınızı oluşturabilirsiniz. İlanınız onaylandıktan sonra yayına alınır.' },
  { category: 'ilan-satisi', question: 'Doping sistemi nedir?', answer: 'Doping, ilanınızın görünürlüğünü artıran ücretli bir hizmettir. Vitrin, öne çıkarma ve yukarı taşıma gibi farklı doping seçenekleri mevcuttur.' },
  { category: 'ilan-satisi', question: 'İlanımı nasıl yayından kaldırırım?', answer: 'İlan detay sayfasında veya "İlanlarım" bölümünden ilanınızı yayından kaldırabilir veya silebilirsiniz.' },
  { category: 'ilan-satisi', question: 'İlanımı nasıl düzenleyebilirim?', answer: 'İlan detay sayfasında "Düzenle" butonuna tıklayarak ilan bilgilerinizi güncelleyebilirsiniz.' },
  { category: 'ilan-satisi', question: 'Süresi dolan ilanımı nasıl tekrar yayına alabilirim?', answer: 'Süresi dolan ilanlarınızı "İlanlarım" sayfasından bulup "Tekrar Yayınla" butonuna tıklayarak yayına alabilirsiniz.' },
  { category: 'ilan-satisi', question: 'Stoklu ilan nasıl eklenir?', answer: 'İlan ekleme formunda stok miktarı belirterek aynı ilandan birden fazla satış yapabilirsiniz.' },
  { category: 'ilan-satisi', question: 'Alım ilanı nedir?', answer: 'Alım ilanı, satın almak istediğiniz ürün için talep oluşturmanızı sağlar. Satıcılar bu ilana teklif verebilir.' },
  { category: 'ilan-satisi', question: 'Otomatik İlan Yukarı Taşıma Nedir?', answer: 'Bu özellik sayesinde ilanınız belirlenen aralıklarla otomatik olarak listenin üstüne taşınır.' },
  { category: 'ilan-satisi', question: 'İlan Kategorisi Nasıl Güncellenir?', answer: 'Yanlış kategoriye eklenen ilanlarınız için destek talebi oluşturarak kategori değişikliği talep edebilirsiniz.' },

  // Para Yükleme
  { category: 'para-yukleme', question: 'Ödeme Yöntemleriniz Nelerdir?', answer: 'Kredi/Banka kartı, Havale/EFT, Mobil ödeme, Kripto para, Tosla Cüzdan, PayTR, GPay ve daha birçok ödeme yöntemi desteklenmektedir.' },
  { category: 'para-yukleme', question: 'Önceden yüklediğim bakiyeleri nereden görebilirim?', answer: 'Profil sayfanızdaki "Bakiye Geçmişi" bölümünden tüm bakiye işlemlerinizi görüntüleyebilirsiniz.' },
  { category: 'para-yukleme', question: 'Bakiye Kuponu Nedir?', answer: 'Bakiye kuponları, promosyon veya etkinlikler sonucu kazanabileceğiniz, hesabınıza bakiye olarak ekleyebileceğiniz kodlardır.' },
  { category: 'para-yukleme', question: 'GPay Kredi Kartı ile Nasıl Bakiye Yüklerim?', answer: 'Bakiye yükleme sayfasında GPay seçeneğini seçip kredi kartı bilgilerinizi girerek anında bakiye yükleyebilirsiniz.' },
  { category: 'para-yukleme', question: 'Taksitli Alışveriş Nasıl Yapılır?', answer: 'Belirli tutarların üzerindeki alışverişlerde taksit seçenekleri sunulmaktadır. Ödeme aşamasında taksit seçeneklerini görebilirsiniz.' },
  { category: 'para-yukleme', question: 'PayTR Havale & EFT ile Ödeme Nasıl Yapılır?', answer: 'PayTR seçeneğini seçip havale/EFT yöntemini seçerek banka hesap bilgilerini alabilir ve transferi gerçekleştirebilirsiniz.' },
  { category: 'para-yukleme', question: 'Tosla Cüzdan ile Nasıl Ödeme Yapılır?', answer: 'Tosla hesabınız varsa ödeme aşamasında Tosla Cüzdan seçeneğini seçerek hızlıca ödeme yapabilirsiniz.' },
  { category: 'para-yukleme', question: 'Hediye Kartları ile Nasıl Bakiye Yüklenir?', answer: 'Desteklenen hediye kartlarınızı bakiye yükleme sayfasından kodunu girerek bakiyeye dönüştürebilirsiniz.' },
  { category: 'para-yukleme', question: 'Kripto Para ile Nasıl Yükleme Yapılır?', answer: 'Bitcoin, Ethereum ve USDT gibi kripto paralarla bakiye yükleyebilirsiniz. Kripto ödeme seçeneğini seçin ve cüzdan adresine transfer yapın.' },
  { category: 'para-yukleme', question: 'PayPal ile Nasıl Bakiye Yüklenir?', answer: 'PayPal hesabınızı bağlayarak veya PayPal ile ödeme seçeneğini seçerek bakiye yükleyebilirsiniz.' },
  { category: 'para-yukleme', question: 'Paycell Ödeme Yöntemi ile Nasıl Bakiye Yüklenir?', answer: 'Paycell uygulaması veya web sitesi üzerinden itemTR seçilerek hızlıca bakiye yükleme yapabilirsiniz.' },

  // Para Çekme
  { category: 'para-cekme', question: 'Çekilebilir Tutar Nedir?', answer: 'Çekilebilir tutar, satışlardan elde ettiğiniz ve henüz bloke edilmemiş bakiyenizdir. Bloke süresi dolan tutarlar çekilebilir hale gelir.' },
  { category: 'para-cekme', question: 'Banka Hesabımı Üyeliğime Nasıl Eklerim?', answer: 'Profil ayarlarından "Banka Hesapları" bölümüne giderek IBAN bilgilerinizi ekleyebilirsiniz.' },
  { category: 'para-cekme', question: 'Para Çekme Kuralları Nedir?', answer: 'Minimum çekim tutarı 50 TL\'dir. Çekim talepleri genellikle aynı gün içinde işleme alınır. IBAN bilgilerinizin doğru olduğundan emin olun.' },

  // Para İadesi
  { category: 'para-iadesi', question: 'Bakiye iadesi nasıl yapılır?', answer: 'Kullanılmamış bakiyeniz için iade talebinde bulunabilirsiniz. Destek talebi oluşturarak iade sürecini başlatabilirsiniz.' },
  { category: 'para-iadesi', question: 'Teslimat Reddi Nasıl Yapılır?', answer: 'Sipariş detay sayfasından teslimat reddedebilir ve paranızı geri alabilirsiniz.' },
  { category: 'para-iadesi', question: 'Alıcıya Sipariş İadesi Nasıl Yapılır?', answer: 'Satıcı olarak, teslim edilen bir siparişi iade etmek için destek ekibiyle iletişime geçmeniz gerekmektedir.' },

  // Profil ve Hesap
  { category: 'profil-hesap', question: 'Neden kimlik bilgilerimi veriyorum?', answer: 'Güvenli alışveriş ortamı sağlamak ve dolandırıcılığı önlemek için kimlik doğrulaması yapılmaktadır. Bilgileriniz gizli tutulur.' },
  { category: 'profil-hesap', question: 'Satıcı Değerlendirmesi Nedir?', answer: 'Alıcılar satın aldıkları ürünler için satıcıları puanlayabilir. Bu puanlar satıcının güvenilirliğini gösterir.' },
  { category: 'profil-hesap', question: 'Kullanıcı Seviyesi Nedir?', answer: 'Yaptığınız işlemlere göre seviye atlarsınız. Daha yüksek seviye daha fazla avantaj sağlar.' },
  { category: 'profil-hesap', question: 'Avatarımı Nasıl Değiştiririm?', answer: 'Profil ayarlarından profil fotoğrafınızı ve kapak fotoğrafınızı değiştirebilirsiniz.' },
  { category: 'profil-hesap', question: 'Mağaza öne çıkartma nedir?', answer: 'Mağazanızın görünürlüğünü artırmak için öne çıkartma paketi satın alabilirsiniz.' },
  { category: 'profil-hesap', question: 'Kullanıcı adımı unuttum nasıl öğrenebilirim?', answer: 'E-posta adresinizle giriş yapmayı deneyin veya şifremi unuttum özelliğini kullanın.' },
  { category: 'profil-hesap', question: 'Şifremi unuttum nasıl sıfırlayabilirim?', answer: 'Giriş sayfasındaki "Şifremi Unuttum" bağlantısına tıklayarak e-postanıza sıfırlama bağlantısı isteyin.' },
  { category: 'profil-hesap', question: 'Telefon numaramı nasıl değiştirebilirim?', answer: 'Profil ayarlarından telefon numaranızı güncelleyebilirsiniz. Değişiklik için doğrulama gerekmektedir.' },
  { category: 'profil-hesap', question: 'E-posta adresimi nasıl değiştirebilirim?', answer: 'Profil ayarlarından e-posta adresinizi değiştirebilirsiniz. Yeni e-posta adresine doğrulama gönderilir.' },
  { category: 'profil-hesap', question: 'Kullanıcı Adı Nasıl Değiştirilir?', answer: 'Profil ayarlarından kullanıcı adınızı güncelleyebilirsiniz. Kullanıcı adları benzersiz olmalıdır.' },
  { category: 'profil-hesap', question: 'Hesap Silme Talebi Nasıl Gerçekleştirilir?', answer: 'Profil ayarlarından hesap silme talebinde bulunabilirsiniz. Aktif işlemlerinizin olmaması gerekir.' },
  { category: 'profil-hesap', question: 'Kurumsal Mağaza ve Faydaları', answer: 'Kurumsal mağaza sahipleri daha düşük komisyon, öncelikli destek ve özel avantajlardan yararlanır.' },
  { category: 'profil-hesap', question: 'Avatar Çerçeve Paketi Nedir?', answer: 'Profilinize özel çerçeveler ekleyerek profilinizi özelleştirebilirsiniz.' },
  { category: 'profil-hesap', question: 'Hareketli Avatar (GIF) Nedir?', answer: 'Profil fotoğrafınızı hareketli GIF olarak ayarlayabilirsiniz. Bu özellik belirli seviyelerde aktif olur.' },

  // Güvenlik
  { category: 'guvenlik', question: 'Üyelik bilgilerimi nasıl güncellerim?', answer: 'Profil ayarlarından şifre, e-posta ve diğer bilgilerinizi güncelleyebilirsiniz.' },
  { category: 'guvenlik', question: 'Güvenilir Satıcı Nedir?', answer: 'Kimlik doğrulaması yapmış ve belirli bir satış hacmine ulaşmış satıcılardır. Daha düşük komisyon ve avantajlar sunar.' },
  { category: 'guvenlik', question: 'Hesabıma Birinin Girdiğini Düşünüyorum', answer: 'Derhal şifrenizi değiştirin ve iki faktörlü doğrulamayı açın. Destik ekibiyle iletişime geçin.' },
  { category: 'guvenlik', question: 'Güvenilir Hesap Yükseltmesi Nedir?', answer: 'Kimlik doğrulaması yaparak hesabınızı güvenilir olarak işaretletebilirsiniz. Bu, işlem limitlerinizi artırır.' },
  { category: 'guvenlik', question: 'Hesabımın güvenliğini nasıl artırırım?', answer: 'Güçlü şifre kullanın, iki faktörlü doğrulamayı açın ve şüpheli bağlantılara tıklamayın.' },
  { category: 'guvenlik', question: 'Bekleyen Bakiye Nedir?', answer: 'Yeni satışlardan elde edilen ve belirli bir süre boyunca bloke edilen bakiyedir. Bu süre, güvenilir satıcılarda daha kısadır.' },
  { category: 'guvenlik', question: 'Farklı Cihazdan Giriş Yapınca Neden Doğrulama İsteniyor?', answer: 'Güvenlik için yeni cihazlardan giriş yapıldığında e-posta doğrulaması istenir. Bu hesabınızı korumak içindir.' },

  // İpuçları
  { category: 'ipuclari', question: 'Nasıl üye olabilirim?', answer: 'Ana sayfada "Kayıt Ol" butonuna tıklayarak e-posta ve şifrenizle hızlıca üyelik oluşturabilirsiniz.' },
  { category: 'ipuclari', question: 'Nasıl Epin alınır?', answer: 'İlgili kategoride epin ürünlerini arayarak satın alabilirsiniz. Epinler anında teslim edilir.' },
  { category: 'ipuclari', question: 'Nasıl Destek Talebi Oluştururum?', answer: 'Destek Merkezi sayfasından veya herhangi bir sayfanın altındaki "Destek" bağlantısından talep oluşturabilirsiniz.' },
  { category: 'ipuclari', question: 'Sosyal Medya Hesabıyla Nasıl Giriş Yapılır?', answer: 'Google, Discord veya diğer sosyal medya hesaplarınızla hızlıca giriş yapabilirsiniz.' },
  { category: 'ipuclari', question: 'Bloke Bakiye Nedir?', answer: 'Güvenlik nedeniyle satışlardan elde edilen bakiye belirli bir süre bloke edilir. Bu süreç tamamlandığında bakiye çekilebilir hale gelir.' },
  { category: 'ipuclari', question: 'Nasıl video kaydı alabilirim?', answer: 'İşlemlerinizde kanıt oluşturmak için ekran kaydı almanız önerilir. Windows: Win+G, Mac: Cmd+Shift+5.' },
  { category: 'ipuclari', question: 'Terimler Sözlüğü', answer: 'Vitrin: Öne çıkan ilanlar, Doping: Görünürlük artırma, Epin: Elektronik PIN kodu, CD-Key: Oyun aktivasyon kodu.' },
  { category: 'ipuclari', question: 'Nasıl çekiliş düzenleyebilirim?', answer: 'Belirli bir seviyeye ulaştıktan sonra çekiliş oluşturma özelliği aktif olur. Çekilişler sayfasından yeni çekiliş başlatabilirsiniz.' },
  { category: 'ipuclari', question: 'Ücretsiz çekilişlere nasıl katılırım?', answer: 'Çekilişler sayfasından aktif çekilişlere katılabilirsiniz. Bazı çekilişler belirli şartlar gerektirebilir.' },
  { category: 'ipuclari', question: 'Haftanın Fırsatları Kampanyası Nedir?', answer: 'Her hafta belirlenen ürünlerde özel indirimler sunulan bir kampanyadır.' },
  { category: 'ipuclari', question: 'Nasıl Müşteri Yorumu Yapılır?', answer: 'Satın aldığınız ürünlerin sayfasından satıcıyı değerlendirebilir ve yorum yapabilirsiniz.' },
  { category: 'ipuclari', question: 'Steam Hesabı Güvenlik Rehberi', answer: 'Steam hesabınızı korumak için Steam Guard aktif edin, şüpheli bağlantılara tıklamayın ve API key paylaşmayın.' },
  { category: 'ipuclari', question: 'Tarayıcı Çerezleri Nasıl Temizlenir', answer: 'Chrome: Ayarlar > Gizlilik > Çerezler, Firefox: Seçenekler > Gizlilik > Çerezler bölümünden temizleyebilirsiniz.' },
  { category: 'ipuclari', question: 'Nasıl Hediye Gönderilir?', answer: 'Başka bir kullanıcıya bakiye veya ürün hediye olarak gönderebilirsiniz. Profil sayfasından hediye gönderme seçeneğini kullanın.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFAQs = useMemo(() => {
    let faqs = FAQS;
    
    if (activeCategory !== 'all') {
      if (activeCategory === 'popular') {
        faqs = faqs.filter(faq => faq.category === 'popular');
      } else {
        faqs = faqs.filter(faq => faq.category === activeCategory);
      }
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      faqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      );
    }
    
    return faqs;
  }, [searchQuery, activeCategory]);

  return (
    <>
    <SEOHead title="Sıkça Sorulan Sorular" description="itemTR hakkında merak ettikleriniz: ilan satın alma, iade, ödeme, para çekme ve hesap yönetimi hakkında tüm soruların cevapları." canonical="/sss" />
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1a1b23] via-[#2a3050] to-[#1a1b23] rounded-2xl border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
              YARDIM MERKEZİ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            itemTR Yardım Merkezi
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Sıkça sorulan sorular ve cevapları burada bulabilirsiniz.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Soru ara... (örn: bakiye yükleme, iade, ilan oluşturma)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111218] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* Most Searched */}
      {activeCategory === 'all' && !searchQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FAQS.filter(f => f.category === 'popular').slice(0, 4).map((faq, i) => (
            <button
              key={i}
              onClick={() => {
                const idx = FAQS.findIndex(f => f.question === faq.question);
                setOpenIndex(idx);
              }}
              className="text-left bg-[#1a1b23] hover:bg-[#23242f] border border-white/5 rounded-xl p-4 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium line-clamp-2 group-hover:text-amber-400 transition-colors">
                    {faq.question}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-white'
                : 'bg-[#1a1b23] text-gray-300 hover:bg-[#23242f] hover:text-white border border-white/5'
            }`}
          >
            {cat.id !== 'all' && <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-white' : cat.color}`} />}
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-8 text-center">
            <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Sonuç bulunamadı</p>
            <p className="text-gray-500 text-sm mt-1">Farklı bir arama terimi deneyin</p>
          </div>
        ) : (
          filteredFAQs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-[#1a1b23] border border-white/5 rounded-xl overflow-hidden transition-all hover:border-white/10"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    faq.category === 'popular' ? 'bg-amber-500/20' :
                    faq.category === 'ilan-satin-alma' ? 'bg-blue-500/20' :
                    faq.category === 'ilan-satisi' ? 'bg-emerald-500/20' :
                    faq.category === 'para-yukleme' ? 'bg-amber-500/20' :
                    faq.category === 'para-cekme' ? 'bg-purple-500/20' :
                    faq.category === 'para-iadesi' ? 'bg-red-500/20' :
                    faq.category === 'profil-hesap' ? 'bg-pink-500/20' :
                    faq.category === 'guvenlik' ? 'bg-cyan-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    <HelpCircle className={`w-5 h-5 ${
                      faq.category === 'popular' ? 'text-amber-400' :
                      faq.category === 'ilan-satin-alma' ? 'text-blue-400' :
                      faq.category === 'ilan-satisi' ? 'text-emerald-400' :
                      faq.category === 'para-yukleme' ? 'text-amber-400' :
                      faq.category === 'para-cekme' ? 'text-purple-400' :
                      faq.category === 'para-iadesi' ? 'text-red-400' :
                      faq.category === 'profil-hesap' ? 'text-pink-400' :
                      faq.category === 'guvenlik' ? 'text-cyan-400' :
                      'text-orange-400'
                    }`} />
                  </div>
                  <span className="font-medium text-white">{faq.question}</span>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-[#111218]/50">
                  <div className="ml-14 text-gray-300 leading-relaxed text-sm">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Need Help */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Başka bir sorunuz mu var?</h3>
              <p className="text-gray-400 text-sm">Destek ekibimiz size yardımcı olmaktan mutluluk duyacaktır.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/destek-sistemi" 
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all"
            >
              Destek Talebi Oluştur
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
