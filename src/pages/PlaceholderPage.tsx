import React from 'react';
import { useLocation } from 'react-router-dom';

export default function PlaceholderPage() {
  const location = useLocation();
  const path = location.pathname.substring(1);
  const title = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="max-w-[1400px] mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400 text-lg">Bu sayfa yakında eklenecek. Lütfen daha sonra tekrar kontrol edin.</p>
      <div className="mt-10 p-8 bg-[#1a1b23] rounded-2xl border border-white/5 inline-block">
        <div className="w-16 h-16 bg-[#5b68f6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-4 border-[#5b68f6] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-[#5b68f6] font-medium">Geliştirme Aşamasında</p>
      </div>
    </div>
  );
}
