import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export default function DealsSection() {
  const columns = [
    {
      title: 'Son Eklenenler',
      subtitle: 'Sizin için en son eklenen ürünleri keşfedin!',
      icon: '🔥',
      items: [
        { id: 1, name: 'SilkRoad 1000 Silk + 100 Bo...', price: 4457.88, oldPrice: 4591.62, discount: '%3', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=100&q=80' },
        { id: 2, name: 'SilkRoad 700 Silk + 50 Bonus', price: 3120.51, oldPrice: 3245.33, discount: '%4', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=100&q=80' },
        { id: 3, name: 'SilkRoad 500 Silk', price: 2228.94, oldPrice: 2340.39, discount: '%5', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=100&q=80' },
      ]
    },
    {
      title: 'En Yüksek İndirimliler',
      subtitle: 'En iyisini en ucuza satın alın!',
      icon: '%',
      items: [
        { id: 4, name: 'IN CELL Steam CD Key', price: 19.84, oldPrice: 1204.7, discount: '%99', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=100&q=80' },
        { id: 5, name: 'Hypermarket Tycoon Man...', price: 19.84, oldPrice: 1497.13, discount: '%99', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=100&q=80' },
        { id: 6, name: 'Sid Meier\'s Civilization VI - ...', price: 9.4, oldPrice: 1398.96, discount: '%99', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=100&q=80' },
      ]
    },
    {
      title: 'En Çok Satanlar',
      subtitle: 'En popüler Epin ürünleri!',
      icon: '💎',
      items: [
        { id: 7, name: 'PlayStation Network 750 TL...', price: 750.00, image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=100&q=80' },
        { id: 8, name: 'PUBG Mobile 8100 UC', price: 4179.99, oldPrice: 4399.99, discount: '%5', image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=100&q=80' },
        { id: 9, name: 'Xbox Live Hediye Kartı 50 TL', price: 50.00, image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=100&q=80' },
      ]
    }
  ];

  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="text-2xl">{col.icon}</div>
                <div>
                  <h3 className="text-white font-bold text-lg">{col.title}</h3>
                  <p className="text-white/50 text-xs">{col.subtitle}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="bg-[#1a1b23] rounded-xl p-3 flex items-center gap-4 hover:bg-[#23242f] transition-colors border border-transparent hover:border-white/10 group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate group-hover:text-[#facc15] transition-colors">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {item.discount && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {item.discount}
                          </span>
                        )}
                        <div className="flex flex-col">
                          {item.oldPrice && (
                            <span className="text-white/40 text-[10px] line-through leading-none">{item.oldPrice.toFixed(2)} ₺</span>
                          )}
                          <span className="text-[#10b981] font-bold text-sm leading-none mt-0.5">{item.price.toFixed(2)} ₺</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-[#8b5cf6] group-hover:text-white transition-colors shrink-0">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

