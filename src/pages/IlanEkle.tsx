import { useState, FormEvent, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Upload, CheckCircle2, AlertCircle, Plus, Image, Tag, DollarSign, 
  Package, Truck, FileText, ChevronRight, ChevronLeft, Sparkles,
  Zap, Shield, Info, X, Check, Layers, CreditCard, Send, Search
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

const CATEGORY_GROUPS = [
  {
    name: 'Sosyal Medya & Platform',
    items: [
      { id: 'SOSYAL MEDYA', name: 'Sosyal Medya', icon: '📱', color: '#E4405F', image: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' },
      { id: 'MOBIL OYUNLAR', name: 'Mobil Oyunlar', icon: '🎮', color: '#34A853', image: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png' },
      { id: 'FREELANCER', name: 'Freelancer Hizmet', icon: '💼', color: '#F7931E', image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
      { id: 'REKLAM SATISI', name: 'Reklam Satışı', icon: '📢', color: '#FF6B6B', image: 'https://cdn-icons-png.flaticon.com/512/2953/2953363.png' },
    ]
  },
  {
    name: 'Oyun Kategorileri',
    items: [
      { id: 'MMO OYUNLAR', name: 'MMO Oyunlar', icon: '⚔️', color: '#8B4513', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'BOOST HIZMETLERI', name: 'Boost Hizmetleri', icon: '🚀', color: '#9C27B0', image: 'https://cdn-icons-png.flaticon.com/512/3135/3135783.png' },
      { id: 'PLATFORM', name: 'Platformlar', icon: '🌐', color: '#2196F3', image: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png' },
      { id: 'YAZILIM URUNLERI', name: 'Yazılım Ürünleri', icon: '💻', color: '#607D8B', image: 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png' },
      { id: 'RANDOM HESAPLAR', name: 'Random Hesaplar', icon: '🎲', color: '#FF9800', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'DIGER URUN SATISLARI', name: 'Diğer Ürün Satışları', icon: '📦', color: '#795548', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png' },
    ]
  },
  {
    name: 'Popüler Oyunlar',
    items: [
      { id: 'VALORANT', name: 'Valorant', icon: '🎯', color: '#FF4655', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'ROBLOX', name: 'Roblox', icon: '🧱', color: '#E31B23', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'DISCORD', name: 'Discord', icon: '💬', color: '#5865F2', image: 'https://cdn-icons-png.flaticon.com/512/2111/2111370.png' },
      { id: 'DISCORD SUNUCU REKLAM', name: 'Discord Sunucu Reklamları', icon: '📣', color: '#5865F2', image: 'https://cdn-icons-png.flaticon.com/512/2111/2111370.png' },
      { id: 'GROWTOPIA', name: 'Growtopia', icon: '🌱', color: '#4CAF50', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'VALORANT RANDOM', name: 'Valorant Random Hesap', icon: '🎲', color: '#FF4655', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'PUBG MOBILE', name: 'PUBG Mobile', icon: '🔫', color: '#F2A900', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'CS2', name: 'Counter Strike CS2', icon: '💣', color: '#DE9B35', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'MINECRAFT', name: 'Minecraft', icon: '⛏️', color: '#62B47A', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'FORTNITE', name: 'Fortnite', icon: '🏰', color: '#9C27B0', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'DIABLO IV', name: 'Diablo IV', icon: '🔥', color: '#D32F2F', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'GENSHIN IMPACT', name: 'Genshin Impact', icon: '⚡', color: '#9C27B0', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
    ]
  },
  {
    name: 'Knight Online',
    items: [
      { id: 'KNIGHT ONLINE', name: 'Knight Online', icon: '⚔️', color: '#8B4513', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'KO PVP 1-99', name: 'KO 1-99 PVP', icon: '🛡️', color: '#A0522D', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'KO PVP 1-105', name: 'KO 1-105 PVP', icon: '🛡️', color: '#CD853F', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'KO PVP 55-120', name: 'KO 55-120 PVP', icon: '🛡️', color: '#D2691E', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'KO EMEK', name: 'KO Emek Server', icon: '⛏️', color: '#8B4513', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'KO WSLIK', name: 'KO WSLik', icon: '⚔️', color: '#A0522D', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
    ]
  },
  {
    name: 'Metin2',
    items: [
      { id: 'METIN2', name: 'Metin2', icon: '🗡️', color: '#5B3A29', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'M2 PVP 1-99', name: 'M2 1-99 PVP', icon: '⚔️', color: '#6D4C41', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'M2 PVP 1-105', name: 'M2 1-105 PVP', icon: '⚔️', color: '#795548', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'M2 PVP 1-120', name: 'M2 1-120 PVP', icon: '⚔️', color: '#8D6E63', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'M2 EMEK', name: 'M2 Emek Server', icon: '⛏️', color: '#5B3A29', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'M2 WSLIK', name: 'M2 WSLik', icon: '⚔️', color: '#6D4C41', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
    ]
  },
  {
    name: 'Platform & Hesaplar',
    items: [
      { id: 'STEAM', name: 'Steam', icon: '🎮', color: '#1B2838', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'LEAGUE OF LEGENDS', name: 'League of Legends', icon: '⚔️', color: '#C89B3C', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'TELEGRAM', name: 'Telegram', icon: '✈️', color: '#0088CC', image: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png' },
      { id: 'INSTAGRAM', name: 'Instagram', icon: '📷', color: '#E4405F', image: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png' },
      { id: 'TIKTOK', name: 'TikTok', icon: '🎵', color: '#000000', image: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png' },
      { id: 'TWITCH', name: 'Twitch', icon: '📺', color: '#9146FF', image: 'https://cdn-icons-png.flaticon.com/512/2111/2111668.png' },
      { id: 'YOUTUBE', name: 'Youtube', icon: '▶️', color: '#FF0000', image: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' },
    ]
  },
  {
    name: 'Diğer',
    items: [
      { id: 'GTA V', name: 'GTA V / FiveM', icon: '🚗', color: '#2D9CDB', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'RUST', name: 'Rust', icon: '🔧', color: '#CE422B', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'ARK', name: 'ARK Survival', icon: '🦕', color: '#1E90FF', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'CONQUER', name: 'Conquer Online', icon: '⚔️', color: '#9B59B6', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'SILKROAD', name: 'Silkroad Online', icon: '🐪', color: '#D4AC0D', image: 'https://cdn-icons-png.flaticon.com/512/1076/1076928.png' },
      { id: 'DIGER', name: 'Diğer Kategoriler', icon: '📁', color: '#6B7280', image: 'https://cdn-icons-png.flaticon.com/512/3135/3135679.png' },
    ]
  }
];

const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.items);

const PRODUCT_TYPES = [
  { 
    id: 'account', 
    name: 'Hesap / İlan', 
    description: 'Oyun hesabı, item, skin satışı',
    icon: Package,
    color: '#5b68f6'
  },
  { 
    id: 'epin', 
    name: 'E-pin / Kod', 
    description: 'Oyun kodu, hediye kartı, e-pin',
    icon: CreditCard,
    color: '#8b5cf6'
  }
];

const DELIVERY_OPTIONS = [
  {
    id: 'auto',
    name: 'Otomatik Teslimat',
    description: '7/24 anında otomatik teslimat',
    icon: Zap,
    color: '#10B981',
    features: ['Anında teslimat', '7/24 aktif', 'Otomatik sistem']
  },
  {
    id: 'manual',
    name: 'Manuel Teslimat',
    description: 'Satıcı onayı ile teslimat',
    icon: Truck,
    color: '#F59E0B',
    features: ['Satıcı kontrolü', 'Esnek teslimat', 'Onay süreci']
  }
];

export default function IlanEkle() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [epinCodesRaw, setEpinCodesRaw] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategorySearch, setShowCategorySearch] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    deliveryType: 'auto',
    stock: '1',
    productType: 'account' as 'account' | 'epin',
  });

  const totalSteps = 4;
  const stepNames = ['Tür & Kategori', 'Ürün Detayları', 'Teslimat', 'Görsel & Onay'];

  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.category.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    Number(formData.price) > 0 &&
    (formData.productType === 'epin'
      ? epinCodesRaw.trim().length > 0
      : Number(formData.stock) > 0) &&
    !!imageFile;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('İlan eklemek için giriş yapmalısınız.');
      return;
    }
    if (!user.emailVerified) {
      toast.error('İlan eklemek için e-posta doğrulaması zorunludur.');
      return;
    }
    if (!profile?.smsVerified) {
      toast.error('İlan eklemek için telefon doğrulaması zorunludur.');
      return;
    }
    if (profile?.kycStatus !== 'verified') {
      toast.error('İlan eklemek için KYC doğrulaması zorunludur.');
      return;
    }

    if (!isFormValid) {
      toast.error('Lütfen tüm alanları geçerli şekilde doldurun.');
      return;
    }

    setLoading(true);
    try {
      const filePath = `products/${user.uid}/${Date.now()}_${imageFile?.name || 'image'}`;
      const imageRef = ref(storage, filePath);
      await uploadBytes(imageRef, imageFile as File);
      const imageUrl = await getDownloadURL(imageRef);

      const created = await addDoc(collection(db, 'products'), {
        ...formData,
        price: parseFloat(formData.price),
        stock: formData.productType === 'epin' ? 0 : (parseInt(formData.stock) || 1),
        sellerId: user.uid,
        sellerName: user.displayName || 'Anonim Satıcı',
        status: 'active',
        createdAt: serverTimestamp(),
        image: imageUrl
      });

      if (formData.productType === 'epin' && formData.deliveryType === 'auto') {
        const codes = epinCodesRaw
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (codes.length === 0) {
          throw new Error('E-pin kodları boş olamaz.');
        }
        const stockRef = doc(collection(db, 'epinStocks'));
        await updateDoc(doc(db, 'products', created.id), {
          stockCount: codes.length,
          stockRef: stockRef.id,
          deliveryType: 'auto',
        } as any);
        await setDoc(stockRef, {
          productId: created.id,
          sellerId: user.uid,
          remainingCount: codes.length,
          codes,
          createdAt: serverTimestamp(),
        } as any);
      } else {
        await updateDoc(doc(db, 'products', created.id), {
          deliveryType: formData.deliveryType === 'auto' ? 'auto' : 'manual',
        } as any);
      }

      toast.success('İlan başarıyla eklendi!');
      navigate('/ilanlarim');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('İlan eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep = (step: Step): boolean => {
    switch (step) {
      case 2:
        return formData.productType !== '' && formData.category !== '';
      case 3:
        return formData.title.trim().length >= 5 && 
               formData.description.trim().length >= 20 && 
               Number(formData.price) > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && canProceedToStep(currentStep as Step)) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  const filteredCategories = categorySearch.trim() 
    ? ALL_CATEGORIES.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        cat.id.toLowerCase().includes(categorySearch.toLowerCase())
      )
    : [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5b68f6]/20 via-[#8b5cf6]/10 to-[#5b68f6]/20 rounded-2xl border border-[#5b68f6]/20 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#5b68f6] to-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-lg shadow-[#5b68f6]/30">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Yeni İlan Oluştur</h1>
            <p className="text-gray-400 text-sm mt-0.5">Ürünlerinizi binlerce alıcıyla buluşturun</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-4 mb-6">
        <div className="flex items-center justify-between">
          {stepNames.map((name, idx) => {
            const stepNum = idx + 1;
            const status = getStepStatus(stepNum);
            return (
              <div key={stepNum} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    status === 'completed' 
                      ? 'bg-emerald-500 text-white' 
                      : status === 'active'
                        ? 'bg-[#5b68f6] text-white'
                        : 'bg-[#23242f] text-gray-500'
                  }`}>
                    {status === 'completed' ? <Check className="w-5 h-5" /> : stepNum}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-medium ${status === 'active' ? 'text-white' : 'text-gray-400'}`}>
                      {name}
                    </p>
                    <p className="text-xs text-gray-500">Adım {stepNum}</p>
                  </div>
                </div>
                {stepNum < totalSteps && (
                  <div className={`flex-1 h-0.5 mx-4 rounded-full transition-colors ${
                    status === 'completed' ? 'bg-emerald-500' : 'bg-[#23242f]'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-[#1a1b23] rounded-2xl border border-white/5 overflow-hidden">
            {/* Step 1: Type & Category */}
            {currentStep === 1 && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">İlan Türü Seçin</h2>
                  <p className="text-sm text-gray-400">Satmak istediğiniz ürün türünü seçin</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {PRODUCT_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, productType: type.id as any })}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        formData.productType === type.id
                          ? 'border-[#5b68f6] bg-white'
                          : 'border-white/5 bg-[#111218] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${type.color}20` }}>
                          <type.icon className="w-5 h-5" style={{ color: type.color }} />
                        </div>
                        <div>
                          <p className={`font-bold ${formData.productType === type.id ? 'text-gray-800' : 'text-white'}`}>{type.name}</p>
                          <p className={`text-xs ${formData.productType === type.id ? 'text-gray-500' : 'text-gray-400'}`}>{type.description}</p>
                        </div>
                      </div>
                      {formData.productType === type.id && (
                        <div className="flex items-center gap-1 text-[#5b68f6] text-sm font-medium">
                          <Check className="w-4 h-4" />
                          Seçildi
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Kategori Seçin</h3>
                  
                  {/* Smart Category Search */}
                  <div className="mb-6 relative">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => {
                          setCategorySearch(e.target.value);
                          setShowCategorySearch(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowCategorySearch(categorySearch.length > 0)}
                        onBlur={() => setTimeout(() => setShowCategorySearch(false), 200)}
                        placeholder="Kategori ara... (örn: Valorant, Steam, Roblox)"
                        className="w-full bg-[#111218] border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] transition-colors"
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setCategorySearch('');
                            setShowCategorySearch(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showCategorySearch && filteredCategories.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full bg-[#111218] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-2 border-b border-white/5">
                          <p className="text-xs text-gray-400 px-2">{filteredCategories.length} kategori bulundu</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {filteredCategories.map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, category: cat.id });
                                setCategorySearch('');
                                setShowCategorySearch(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 hover:bg-[#1a1b23] transition-colors ${
                                formData.category === cat.id ? 'bg-[#5b68f6]/10' : ''
                              }`}
                            >
                              <span className="text-xl">{cat.icon}</span>
                              <div className="text-left">
                                <p className="text-sm font-medium text-white">{cat.name}</p>
                                <p className="text-xs text-gray-400">{cat.id}</p>
                              </div>
                              {formData.category === cat.id && (
                                <Check className="w-4 h-4 text-[#5b68f6] ml-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Category Display */}
                  {formData.category && (
                    <div className="mb-4 p-3 bg-white rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ALL_CATEGORIES.find(c => c.id === formData.category)?.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{ALL_CATEGORIES.find(c => c.id === formData.category)?.name}</p>
                          <p className="text-xs text-gray-500">Seçili kategori</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, category: '' })}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Category Groups - Compact Grid like itemsatis.com */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {CATEGORY_GROUPS.map(group => (
                      <div key={group.name} className="mb-4 last:mb-0">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2 sticky top-0 bg-[#1a1b23] py-1 z-10">{group.name}</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                          {group.items.map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, category: cat.id })}
                              className={`p-3 rounded-lg border text-center transition-all hover:scale-105 ${
                                formData.category === cat.id
                                  ? 'border-[#5b68f6] bg-[#5b68f6]/20'
                                  : 'border-white/5 bg-[#111218] hover:border-white/10'
                              }`}
                            >
                              <span className="text-xl mb-1 block">{cat.icon}</span>
                              <p className={`text-xs font-medium truncate ${formData.category === cat.id ? 'text-white' : 'text-gray-300'}`}>{cat.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Product Details */}
            {currentStep === 2 && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Ürün Detayları</h2>
                  <p className="text-sm text-gray-400">İlanınız hakkında detaylı bilgi verin</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Tag className="w-4 h-4" />
                      İlan Başlığı *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Örn: 100-150 Skinli Valorant Hesabı - Radiant"
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] transition-colors"
                      maxLength={100}
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500">Min 5 karakter gerekli</p>
                      <p className="text-xs text-gray-500">{formData.title.length}/100</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <DollarSign className="w-4 h-4" />
                        Fiyat (₺) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₺</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Layers className="w-4 h-4" />
                        Stok Adedi
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="1"
                        className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] transition-colors"
                        disabled={formData.productType === 'epin'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <FileText className="w-4 h-4" />
                      Açıklama *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      placeholder="Ürününüz hakkında detaylı bilgi verin. Özellikleri, içerikler, teslimat süresi gibi bilgileri ekleyin..."
                      className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] transition-colors resize-none"
                      maxLength={1000}
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500">Min 20 karakter gerekli</p>
                      <p className="text-xs text-gray-500">{formData.description.length}/1000</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Delivery */}
            {currentStep === 3 && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Teslimat Yöntemi</h2>
                  <p className="text-sm text-gray-400">Alıcıya ürününüzün nasıl teslim edileceğini seçin</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {DELIVERY_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryType: option.id })}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        formData.deliveryType === option.id
                          ? 'border-[#5b68f6] bg-[#5b68f6]/10'
                          : 'border-white/5 bg-[#111218] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${option.color}20` }}>
                          <option.icon className="w-6 h-6" style={{ color: option.color }} />
                        </div>
                        <div>
                          <p className="font-bold text-white">{option.name}</p>
                          <p className="text-xs text-gray-400">{option.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {option.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                            <Check className="w-3 h-3 text-emerald-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                {/* E-pin Codes */}
                {formData.productType === 'epin' && formData.deliveryType === 'auto' && (
                  <div className="bg-[#111218] rounded-xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#5b68f6]/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#5b68f6]" />
                      </div>
                      <div>
                        <p className="font-bold text-white">E-pin Kodları</p>
                        <p className="text-xs text-gray-400">Her satıra bir kod gelecek şekilde girin</p>
                      </div>
                    </div>
                    <textarea
                      value={epinCodesRaw}
                      onChange={(e) => setEpinCodesRaw(e.target.value)}
                      rows={8}
                      placeholder="KOD1&#10;KOD2&#10;KOD3&#10;..."
                      className="w-full bg-[#1a1b23] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b68f6] transition-colors resize-none font-mono text-sm"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        {epinCodesRaw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).length} kod girildi
                      </div>
                      <p className="text-xs text-gray-500">Her satır = 1 kod</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium">Teslimat Bilgisi</p>
                      <p className="text-xs text-blue-300/70 mt-1">
                        Otomatik teslimat seçtiğinizde, sistem alıcı ödemesi tamamlandıktan sonra ürün bilgilerini 
                        otomatik olarak gönderir. Manuel teslimatta ise sizin onayınız gerekir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Image & Submit */}
            {currentStep === 4 && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Ürün Görseli</h2>
                  <p className="text-sm text-gray-400">İlanınız için dikkat çekici bir görsel yükleyin</p>
                </div>

                {/* Image Upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-[#5b68f6]/50 transition-colors group"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full aspect-video object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-center">
                          <Upload className="w-10 h-10 text-white mx-auto mb-2" />
                          <p className="text-white font-medium">Görseli Değiştir</p>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Yüklendi
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video flex flex-col items-center justify-center text-gray-500 py-12">
                      <div className="w-16 h-16 bg-[#5b68f6]/20 rounded-2xl flex items-center justify-center mb-4">
                        <Image className="w-8 h-8 text-[#5b68f6]" />
                      </div>
                      <p className="font-medium text-gray-300">Görsel yüklemek için tıklayın</p>
                      <p className="text-sm text-gray-500 mt-1">veya sürükle bırak</p>
                      <p className="text-xs text-gray-600 mt-4">PNG, JPG, WEBP • Max 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Summary */}
                <div className="bg-[#111218] rounded-xl p-5 border border-white/5">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#5b68f6]" />
                    İlan Özeti
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Tür</span>
                      <span className="text-sm font-medium text-white">
                        {formData.productType === 'account' ? 'Hesap / İlan' : 'E-pin / Kod'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Kategori</span>
                      <span className="text-sm font-medium text-white">{formData.category}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Başlık</span>
                      <span className="text-sm font-medium text-white truncate max-w-[200px]">{formData.title}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Fiyat</span>
                      <span className="text-sm font-bold text-emerald-400">{formData.price} ₺</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">Teslimat</span>
                      <span className="text-sm font-medium text-white">
                        {formData.deliveryType === 'auto' ? 'Otomatik' : 'Manuel'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-400">Stok</span>
                      <span className="text-sm font-medium text-white">
                        {formData.productType === 'epin' 
                          ? epinCodesRaw.split(/\r?\n/).filter(l => l.trim()).length + ' kod'
                          : formData.stock + ' adet'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="text-sm text-amber-200/80">
                      <p className="font-medium text-amber-300">Önemli Hatırlatma</p>
                      <p className="mt-1">
                        İlanınız yayınlandıktan sonra, platform kurallarına uygunluğu için incelenecektir. 
                        Uygun olmayan içerikler kaldırılabilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between p-6 bg-[#111218]/50 border-t border-white/5">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentStep === 1
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-[#23242f]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Geri
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToStep((currentStep + 1) as Step)}
                  className="flex items-center gap-2 bg-[#5b68f6] hover:bg-[#4a55d6] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                >
                  İleri
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Yayınlanıyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      İlanı Yayınla
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tips Card */}
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#5b68f6]/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#5b68f6]" />
              </div>
              <h3 className="font-bold text-white">İlan İpuçları</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Net başlık', desc: 'Ürünü açıklayan başlık yazın' },
                { title: 'Detaylı açıklama', desc: 'Özellikleri listeleyin' },
                { title: 'Kaliteli görsel', desc: 'Gerçek ürün fotoğrafı' },
                { title: 'Uygun fiyat', desc: 'Piyasa değerini araştırın' },
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{tip.title}</p>
                    <p className="text-xs text-gray-400">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Gereksinimler
            </h3>
            <div className="space-y-3">
              {[
                { label: 'E-posta doğrulaması', verified: user?.emailVerified },
                { label: 'Telefon doğrulaması', verified: profile?.smsVerified },
                { label: 'KYC doğrulaması', verified: profile?.kycStatus === 'verified' },
              ].map((req, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{req.label}</span>
                  {req.verified ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <Check className="w-3 h-3" />
                      Onaylı
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                      <X className="w-3 h-3" />
                      Gerekli
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-[#5b68f6]/20 to-[#8b5cf6]/20 rounded-xl border border-[#5b68f6]/20 p-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">0%</p>
                <p className="text-xs text-gray-400">Komisyon</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs text-gray-400">Destek</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
