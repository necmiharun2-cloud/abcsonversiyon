import { Link } from 'react-router-dom';

export default function BlogPreviewSection() {
  const posts = [
    { id: 1, title: 'Brawl Stars 35. Sezon: Melekler ve Şeytanlar', date: '04.11.2024', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Valorant 9. Bölüm 3. Kısım Savaş Bileti...', date: '21.10.2024', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'Valorant Yeni Ajan Vyse Yetenekleri Neler?', date: '26.08.2024', image: 'https://images.unsplash.com/photo-1548686304-89d188a80029?auto=format&fit=crop&w=400&q=80' },
    { id: 4, title: 'Valorant 9. Bölüm 2. Kısım Savaş Bileti...', date: '26.08.2024', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Haberler</h2>
            <p className="text-white/50 text-sm">Oyun dünyasından en güncel haberler!</p>
          </div>
          <Link
            to="/blog"
            className="bg-[#1a1b23] hover:bg-[#23242f] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-white/10"
          >
            Tüm Haberler
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group bg-[#1a1b23] rounded-xl overflow-hidden border border-transparent hover:border-white/10 transition-all">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="text-white/50 text-xs mb-2">{post.date}</div>
                <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-[#facc15] transition-colors">{post.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

