import { Link } from 'react-router-dom';

type Item = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  img: string;
  q: string;
};

export default function CdKeyBestSellers() {
  const items: Item[] = [
    { id: 'cd-1', title: 'ARC Raiders PC Steam CD Key', price: 1682.45, oldPrice: 1999.9, img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80', q: 'ARC Raiders CD Key' },
    { id: 'cd-2', title: 'Assetto Corsa PC (CD Key Global)', price: 183.14, oldPrice: 249.9, img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80', q: 'Assetto Corsa CD Key' },
    { id: 'cd-3', title: 'Anthem PC EA CD Key (Global)', price: 292.04, oldPrice: 399.9, img: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=400&q=80', q: 'Anthem CD Key' },
    { id: 'cd-4', title: 'Back 4 Blood: Ultimate (Steam)', price: 125.83, oldPrice: 199.9, img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80', q: 'Back 4 Blood CD Key' },
    { id: 'cd-5', title: 'Clair Obscur: Expedition 33 (Steam)', price: 1348.92, oldPrice: 1499.9, img: 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?auto=format&fit=crop&w=400&q=80', q: 'Clair Obscur CD Key' },
    { id: 'cd-6', title: 'Command & Conquer 4: Tiberian Twilight', price: 360.23, oldPrice: 499.9, img: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=400&q=80', q: 'Command Conquer CD Key' },
  ];

  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Çok Satılan Cd Key Ürünleri</h2>
          <p className="text-white/50 text-sm">
            Güvenli alışveriş ve hızlı aktivasyonuyla en çok satın alınan CD Key'leri keşfedin.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((it) => (
            <Link
              key={it.id}
              to={`/ilan-pazari?q=${encodeURIComponent(it.q)}`}
              className="bg-[#1a1b23] rounded-xl p-3 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300 border border-transparent hover:border-white/10 group"
            >
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <img src={it.img} alt={it.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col flex-1 justify-between">
                <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug mb-2 group-hover:text-[#facc15] transition-colors">{it.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {it.oldPrice != null && (
                      <span className="text-white/40 text-[10px] line-through leading-none">{it.oldPrice.toFixed(2)} ₺</span>
                    )}
                    <span className="text-[#10b981] font-bold text-base leading-none mt-1">{it.price.toFixed(2)} ₺</span>
                  </div>
                  <button className="bg-[#8b5cf6] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#7c3aed] transition-colors">
                    Satın Al
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

