import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-[#5b68f6]/10 p-6 rounded-full mb-6">
        <AlertCircle className="w-16 h-16 text-[#5b68f6]" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <h2 className="text-xl text-gray-300 mb-6">Aradığınız sayfa bulunamadı</h2>
      <p className="text-gray-400 max-w-md mb-8">
        Ulaşmaya çalıştığınız sayfa silinmiş, ismi değiştirilmiş veya geçici olarak kullanım dışı olabilir.
      </p>
      <Link 
        to="/" 
        className="bg-[#5b68f6] hover:bg-[#4a55d6] text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(91,104,246,0.3)]"
      >
        <Home className="w-5 h-5" />
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
