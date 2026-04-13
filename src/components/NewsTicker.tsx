import { Link } from 'react-router-dom';
import { Megaphone } from 'lucide-react';

const news = [
  { id: 1, title: "Valorant Yeni Ajan Sızdırıldı! Yetenekleri ve Çıkış Tarihi", date: "07 Nisan 2026" },
  { id: 2, title: "CS2 Büyük Güncelleme Notları: Yeni Harita ve Silah Dengelemeleri", date: "06 Nisan 2026" },
  { id: 3, title: "itemTR Bahar İndirimleri Başladı! %50'ye Varan İndirimler", date: "05 Nisan 2026" },
  { id: 4, title: "GTA 6 Çıkış Tarihi Hakkında Yeni Söylentiler Ortaya Çıktı", date: "04 Nisan 2026" },
  { id: 5, title: "League of Legends Yeni Sezon Değişiklikleri ve Meta Analizi", date: "03 Nisan 2026" },
];

export default function NewsTicker() {
  return (
    <div className="bg-[#1a1b23] border-y border-white/5 py-3 relative flex items-center overflow-hidden">
      {/* Label */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-[#5b68f6] flex items-center px-4 gap-2 shadow-[10px_0_20px_rgba(24,27,38,0.9)]">
        <Megaphone className="w-4 h-4 text-white" />
        <span className="text-white font-bold text-sm whitespace-nowrap">Son Haberler</span>
      </div>

      {/* Gradient Masks */}
      <div className="absolute left-32 top-0 bottom-0 w-20 bg-gradient-to-r from-[#1a1b23] to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#1a1b23] to-transparent z-10"></div>
      
      {/* Marquee Content */}
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] pl-40 w-max">
        {[...news, ...news].map((item, index) => (
          <div key={index} className="flex items-center mx-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5b68f6] mr-3"></span>
            <span className="text-gray-400 text-xs mr-2">{item.date}</span>
            <span className="text-gray-300 hover:text-white transition-colors text-sm font-medium cursor-default">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
