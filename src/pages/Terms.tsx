import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#5b68f6]/10 p-3 rounded-xl">
          <FileText className="text-[#5b68f6] w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Kullanıcı Sözleşmesi</h1>
          <p className="text-gray-400">Son güncelleme: 1 Ocak 2024</p>
        </div>
      </div>

      <div className="bg-[#1a1b23] rounded-2xl border border-white/5 p-8 space-y-8">
        <section>
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            1. Genel Şartlar
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Bu sözleşme, itemTR platformunun kullanımına ilişkin şartları ve kuralları belirler. 
            Platforma üye olan her kullanıcı bu şartları kabul etmiş sayılır.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            2. Üyelik ve Güvenlik
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Kullanıcılar, hesap bilgilerinin güvenliğinden kendileri sorumludur. 
            Hesabın üçüncü şahıslar tarafından kullanılması durumunda doğacak zararlardan itemTR sorumlu tutulamaz.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            3. Alışveriş ve İadeler
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Dijital ürünlerde teslimat gerçekleştikten sonra iade yapılmamaktadır. 
            Ancak ürünün hatalı veya eksik olması durumunda destek sistemi üzerinden talep oluşturulabilir.
          </p>
        </section>

        <div className="bg-[#111218] p-6 rounded-xl border border-white/5">
          <p className="text-sm text-gray-500 italic">
            * itemTR, bu sözleşme maddelerinde dilediği zaman değişiklik yapma hakkını saklı tutar.
          </p>
        </div>
      </div>
    </div>
  );
}
