import React from 'react';
import { Info, Shield, CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function About() {
  return (
    <>
    <SEOHead title="Hakkımızda" description="itemTR hakkında: Türkiye'nin en güvenilir oyuncu pazar yeri, misyonumuz ve vizyonumuz." canonical="/hakkimizda" />
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Hakkımızda</h1>
        <p className="text-gray-400">Türkiye'nin en güvenilir oyuncu pazaryeri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-[#1a1b23] p-8 rounded-2xl border border-white/5 text-center">
          <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-blue-500 w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Güvenli Ticaret</h3>
          <p className="text-gray-400 text-sm">Tüm işlemleriniz itemTR güvencesi altındadır.</p>
        </div>
        <div className="bg-[#1a1b23] p-8 rounded-2xl border border-white/5 text-center">
          <div className="bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500 w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Hızlı Teslimat</h3>
          <p className="text-gray-400 text-sm">7/24 otomatik teslimat sistemi ile anında ürününüzü alın.</p>
        </div>
        <div className="bg-[#1a1b23] p-8 rounded-2xl border border-white/5 text-center">
          <div className="bg-purple-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="text-purple-500 w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">7/24 Destek</h3>
          <p className="text-gray-400 text-sm">Uzman ekibimiz her türlü sorunuz için yanınızda.</p>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2 className="text-white font-bold text-xl mb-4">Biz Kimiz?</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          itemTR, oyuncuların güvenle alışveriş yapabileceği, dijital varlıklarını nakite çevirebileceği bir platform olarak kurulmuştur. 
          Yılların verdiği tecrübe ve binlerce mutlu kullanıcı ile Türkiye'nin lider oyuncu pazaryeri olmaya devam ediyoruz.
        </p>
        <p className="text-gray-400 leading-relaxed">
          Vizyonumuz, oyun dünyasındaki tüm ihtiyaçları tek bir çatı altında toplayarak en iyi kullanıcı deneyimini sunmaktır.
        </p>
      </div>
    </div>
    </>
  );
}
