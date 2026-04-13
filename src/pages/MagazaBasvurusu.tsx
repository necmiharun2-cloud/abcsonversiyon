import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, CheckCircle, AlertCircle, Shield, Clock, TrendingUp, 
  Users, Award, Star, ChevronRight, FileText, HelpCircle,
  CreditCard, Package, MessageSquare, Zap, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Daha Fazla Satış',
    description: 'Öne çıkan mağaza olarak görünürlüğünüzü artırın ve satışlarınızı artırın.'
  },
  {
    icon: Shield,
    title: 'Doğrulanmış Rozet',
    description: 'Doğrulanmış satıcı rozeti ile müşterilerin güvenini kazanın.'
  },
  {
    icon: Clock,
    title: 'Öncelikli Destek',
    description: 'Mağaza sahipleri öncelikli müşteri desteği alır.'
  },
  {
    icon: Users,
    title: 'Takipçi Sistemi',
    description: 'Müşteriler sizi takip edebilir ve yeni ilanlarınızdan haberdar olabilir.'
  }
];

const STORE_LEVELS = [
  {
    name: 'Standart',
    price: 'Ücretsiz',
    features: [
      'Temel mağaza profili',
      'İlan yayınlama',
      'Mesajlaşma sistemi',
      'Temel istatistikler'
    ],
    color: 'from-gray-600 to-gray-700',
    popular: false
  },
  {
    name: 'Pro',
    price: '₺99/ay',
    features: [
      'Tüm Standart özellikler',
      'Öne çıkan mağaza listeleme',
      'Doğrulanmış rozet',
      'Gelişmiş istatistikler',
      'Öncelikli destek',
      'Özel mağaza banner'
    ],
    color: 'from-[#5b68f6] to-[#8b5cf6]',
    popular: true
  },
  {
    name: 'Kurumsal',
    price: '₺299/ay',
    features: [
      'Tüm Pro özellikler',
      'En üst sırada listeleme',
      'Kurumsal rozet',
      'Özel müşteri yöneticisi',
      'API erişimi',
      'Özel raporlar'
    ],
    color: 'from-amber-500 to-orange-600',
    popular: false
  }
];

const FAQ_ITEMS = [
  {
    question: 'Mağaza başvurusu ne kadar sürede sonuçlanır?',
    answer: 'Başvurular genellikle 1-3 iş günü içinde incelenir ve size e-posta ile bildirim gönderilir.'
  },
  {
    question: 'Mağaza seviyemi daha sonra değiştirebilir miyim?',
    answer: 'Evet, istediğiniz zaman mağaza seviyenizi yükseltebilir veya değiştirebilirsiniz.'
  },
  {
    question: 'Ödeme nasıl yapılır?',
    answer: 'Kredi kartı, banka kartı veya bakiye yükleme ile ödeme yapabilirsiniz.'
  },
  {
    question: 'Mağaza üyeliğini iptal edebilir miyim?',
    answer: 'Evet, istediğiniz zaman mağaza üyeliğinizi iptal edebilirsiniz. Kalan süre boyunca avantajlarınız devam eder.'
  }
];

export default function MagazaBasvurusu() {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeLevel: 'pro',
    categories: [] as string[],
    website: '',
    experience: '',
    additionalInfo: '',
    acceptTerms: false
  });

  const CATEGORY_OPTIONS = [
    'Valorant', 'CS2', 'PUBG Mobile', 'League of Legends', 'Roblox',
    'Minecraft', 'Steam', 'Discord', 'Fortnite', 'Mobile Legends',
    'Oyun Hesapları', 'Oyun Paraları', 'CD Key', 'Hediye Kartları', 'Diğer'
  ];

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Başvuru yapmak için giriş yapmalısınız.');
      return;
    }

    if (!formData.storeName.trim() || formData.categories.length === 0) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Kullanım koşullarını kabul etmelisiniz.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'storeApplications'), {
        userId: user.uid,
        userName: profile?.username || user.displayName || 'Kullanıcı',
        userEmail: user.email,
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        storeLevel: formData.storeLevel,
        categories: formData.categories,
        website: formData.website,
        experience: formData.experience,
        additionalInfo: formData.additionalInfo,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      
      setIsSubmitted(true);
      toast.success('Mağaza başvurunuz başarıyla gönderildi!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Başvuru gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Başvurunuz Alındı!</h1>
          <p className="text-gray-400 mb-6">
            Mağaza başvurunuz başarıyla gönderildi. Başvurunuz 1-3 iş günü içinde incelenecek ve size e-posta ile bildirim gönderilecektir.
          </p>
          <div className="bg-[#1a1b23] rounded-xl p-4 border border-white/5 mb-6">
            <div className="flex items-center gap-3 text-left">
              <Clock className="w-5 h-5 text-[#5b68f6]" />
              <div>
                <p className="text-sm font-medium text-white">Tahmini İnceleme Süresi</p>
                <p className="text-xs text-gray-400">1-3 iş günü</p>
              </div>
            </div>
          </div>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 bg-[#5b68f6] hover:bg-[#4a55d6] text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1a1b23] via-[#2a3050] to-[#1a1b23] rounded-2xl border border-white/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5b68f6] via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                ÜCRETSİZ BAŞVURU
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 justify-center lg:justify-start">
              <Store className="w-8 h-8 text-[#5b68f6]" />
              Mağaza Başvurusu
            </h1>
            <p className="text-gray-400 max-w-xl">
              Satışlarınızı arttırın! itemTR'da mağaza açarak binlerce alıcıya ulaşın.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-[#111218] rounded-xl">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-gray-400">Aktif Mağaza</p>
            </div>
            <div className="text-center px-4 py-2 bg-[#111218] rounded-xl">
              <p className="text-2xl font-bold text-emerald-400">%45</p>
              <p className="text-xs text-gray-400">Daha Fazla Satış</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENEFITS.map((benefit, i) => (
          <div key={i} className="bg-[#1a1b23] rounded-xl border border-white/5 p-5 hover:border-[#5b68f6]/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#5b68f6]/20 flex items-center justify-center mb-3">
              <benefit.icon className="w-5 h-5 text-[#5b68f6]" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{benefit.title}</h3>
            <p className="text-xs text-gray-400">{benefit.description}</p>
          </div>
        ))}
      </section>

      {/* Store Levels */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#5b68f6]" />
          Mağaza Seviyeleri
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORE_LEVELS.map((level, i) => (
            <div 
              key={i}
              onClick={() => setFormData(prev => ({ ...prev, storeLevel: level.name.toLowerCase() }))}
              className={`relative bg-[#1a1b23] rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                formData.storeLevel === level.name.toLowerCase()
                  ? 'border-[#5b68f6] ring-2 ring-[#5b68f6]/20'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              {level.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#5b68f6] to-[#8b5cf6] text-white text-xs font-bold py-1 text-center">
                  EN POPÜLER
                </div>
              )}
              
              <div className={`h-2 bg-gradient-to-r ${level.color}`} />
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1">{level.name}</h3>
                <p className="text-2xl font-bold text-white mb-4">{level.price}</p>
                
                <ul className="space-y-2">
                  {level.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {formData.storeLevel === level.name.toLowerCase() && (
                  <div className="mt-4 flex items-center justify-center">
                    <span className="bg-[#5b68f6] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Seçili
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section>
        <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-[#111218] px-6 py-4 border-b border-white/5">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    currentStep >= step
                      ? 'bg-[#5b68f6] text-white'
                      : 'bg-[#23242f] text-gray-400'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:block ${
                    currentStep >= step ? 'text-white font-medium' : 'text-gray-500'
                  }`}>
                    {step === 1 ? 'Mağaza Bilgileri' : step === 2 ? 'Kategoriler' : 'Onay'}
                  </span>
                  {step < 3 && (
                    <div className={`w-12 sm:w-24 h-0.5 mx-4 ${
                      currentStep > step ? 'bg-[#5b68f6]' : 'bg-[#23242f]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Store Info */}
            {currentStep === 1 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mağaza Adı <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder="Örn: GameStore, ProShop..."
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6]"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.storeName.length}/50</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mağaza Açıklaması
                  </label>
                  <textarea
                    value={formData.storeDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, storeDescription: e.target.value }))}
                    placeholder="Mağazanız hakkında kısa bir açıklama yazın..."
                    rows={4}
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.storeDescription.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website / Sosyal Medya (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Satış Deneyiminiz
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5b68f6]"
                  >
                    <option value="">Seçiniz...</option>
                    <option value="beginner">Yeni başladım (0-1 yıl)</option>
                    <option value="intermediate">Orta (1-3 yıl)</option>
                    <option value="experienced">Deneyimli (3-5 yıl)</option>
                    <option value="expert">Uzman (5+ yıl)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Categories */}
            {currentStep === 2 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Satacağınız Kategoriler <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-4">En az 1 kategori seçmelisiniz</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryToggle(cat)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.categories.includes(cat)
                            ? 'bg-[#5b68f6] text-white'
                            : 'bg-[#111218] text-gray-300 hover:bg-[#23242f]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{formData.categories.length} kategori seçildi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ek Bilgiler (Opsiyonel)
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="Eklemek istediğiniz başka bilgiler varsa buraya yazabilirsiniz..."
                    rows={3}
                    className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] resize-none"
                    maxLength={300}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="bg-[#111218] rounded-xl p-5 border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#5b68f6]" />
                    Başvuru Özeti
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Mağaza Adı</span>
                      <span className="text-white font-medium text-sm">{formData.storeName || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Seviye</span>
                      <span className="text-white font-medium text-sm capitalize">{formData.storeLevel}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Kategoriler</span>
                      <span className="text-white font-medium text-sm">{formData.categories.join(', ') || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400 text-sm">Deneyim</span>
                      <span className="text-white font-medium text-sm">
                        {formData.experience === 'beginner' ? 'Yeni' :
                         formData.experience === 'intermediate' ? 'Orta' :
                         formData.experience === 'experienced' ? 'Deneyimli' :
                         formData.experience === 'expert' ? 'Uzman' : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer p-4 bg-[#111218] rounded-xl border border-white/5">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    formData.acceptTerms ? 'bg-[#5b68f6] border-[#5b68f6]' : 'border-gray-500'
                  }`}>
                    {formData.acceptTerms && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-gray-300">
                    <Link to="/kullanici-sozlesmesi" className="text-[#5b68f6] hover:underline">Kullanıcı sözleşmesi</Link> ve{' '}
                    <Link to="/gizlilik-politikasi" className="text-[#5b68f6] hover:underline">Gizlilik politikasını</Link> okudum, kabul ediyorum.
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/5 max-w-2xl mx-auto">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-5 py-2.5 bg-[#23242f] hover:bg-[#2d2e3b] text-white rounded-lg font-medium text-sm transition-colors"
                >
                  ← Geri
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={currentStep === 1 && !formData.storeName.trim()}
                  className="px-6 py-2.5 bg-[#5b68f6] hover:bg-[#4a55d6] disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Devam Et →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.acceptTerms}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Başvuruyu Gönder
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#5b68f6]" />
          Sık Sorulan Sorular
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-[#1a1b23] rounded-xl border border-white/5 p-5">
              <h3 className="text-sm font-bold text-white mb-2">{item.question}</h3>
              <p className="text-sm text-gray-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Need Help */}
      <section className="bg-gradient-to-r from-[#5b68f6]/10 to-[#8b5cf6]/10 rounded-xl border border-[#5b68f6]/20 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#5b68f6]/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#5b68f6]" />
            </div>
            <div>
              <h3 className="text-white font-bold">Yardım mı lazım?</h3>
              <p className="text-sm text-gray-400">Destek ekibimiz sorularınızı yanıtlamak için hazır.</p>
            </div>
          </div>
          <Link
            to="/destek-sistemi"
            className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            Destek Talebi Oluştur
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
