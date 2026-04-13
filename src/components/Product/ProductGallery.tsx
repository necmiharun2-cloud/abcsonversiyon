import { Star, ShieldCheck, Zap, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface ProductGalleryProps {
  image?: string;
  title?: string;
  createdAt?: any;
}

function parseCreatedAt(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    const ms = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6);
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return 'Süresi doldu';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  // Primary format stays gün/saat/dakika; seconds included so user sees it "counting down".
  return `${days} gün ${hours} saat ${minutes} dakika (${seconds} sn)`;
}

export default function ProductGallery({ image, title, createdAt }: ProductGalleryProps) {
  const createdDate = useMemo(() => parseCreatedAt(createdAt), [createdAt]);
  const expiresAt = useMemo(() => (createdDate ? createdDate.getTime() + 30 * 24 * 60 * 60 * 1000 : null), [createdDate]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = expiresAt ? expiresAt - now : null;

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-[#1a1b23] p-4 rounded-xl border border-white/5">
      {/* Image */}
      <div className="w-full md:w-[400px] shrink-0 relative rounded-lg overflow-hidden">
        <img 
          src={image || 'https://placehold.co/800x600/232736/5b68f6/png?text=Urun'} 
          alt={title} 
          className="w-full h-[280px] object-cover"
        />
        <div className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
          Hızlı Teslimat
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">
          7/24 Destek
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 py-2">
        <h1 className="text-2xl font-bold text-yellow-500 mb-3">
          {title || "Valorant Random Hesap (10-100 Skin)"}
        </h1>
        
        <div className="flex items-center gap-4 text-sm mb-4">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white">9.8</span>
            <div className="flex text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-gray-400">
            <span className="text-white font-medium">{Math.floor(Math.random() * 300) + 50}</span> Değerlendirme
          </div>
          <div className="text-gray-400">
            <span className="text-white font-medium">0</span> Soru & Cevap
          </div>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          Bu ilan {title} kategorisinde yer almaktadır. 📌 Nasıl Teslim Edilir? İlanımızı Satın Aldığınızda Bize İlettiğiniz Link Gelir, O Linke Gönderimi Sağlarız. Youtube İlanlarında Hesabınızın Gizli Olmaması Gerekir. Şayet Bu Gönderimi İmkansız Hale Kılar ve Gönderi...
        </p>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            Kimlik Onaylı Satıcı
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full text-xs font-medium border border-yellow-500/20">
            <Zap className="w-4 h-4" />
            Otomatik Teslimat
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-4 h-4" />
          <span>
            Kalan süre : {remainingMs == null ? '—' : formatRemaining(remainingMs)}
          </span>
        </div>
      </div>
    </div>
  );
}
