import { 
  Newspaper, Clock, User, ArrowRight, Search, Tag, 
  TrendingUp, Bookmark, ChevronRight, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { blogPosts } from '../data/blogPosts';
import { useState, useMemo } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'Tümü', count: 12 },
  { id: 'Rehber', label: 'Rehber', count: 5 },
  { id: 'Haber', label: 'Haber', count: 4 },
  { id: 'Güncelleme', label: 'Güncelleme', count: 2 },
  { id: 'İnceleme', label: 'İnceleme', count: 1 },
];

const POPULAR_TAGS = [
  'Valorant', 'CS2', 'Steam', 'Roblox', 'PUBG', 'LoL', 'FIFA', 'Minecraft'
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const featuredPost = blogPosts[0];

  const filteredPosts = useMemo(() => {
    let posts = blogPosts;
    
    if (activeCategory !== 'all') {
      posts = posts.filter(p => p.category === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.excerpt.toLowerCase().includes(query)
      );
    }
    
    return posts;
  }, [searchQuery, activeCategory]);

  return (
    <>
    <SEOHead title="Blog" description="Oyun dünyasından haberler, ipuçları ve rehberler. Valorant, Roblox, CS2 ve daha fazlası hakkında güncel içerikler." canonical="/blog" />
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1a1b23] via-[#2a3050] to-[#1a1b23] rounded-2xl border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-pink-500/20 text-pink-400 text-xs font-bold px-3 py-1 rounded-full">
                  BLOG
                </span>
                <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Newspaper className="w-3 h-3" />
                  Oyun Haberleri
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Oyunlardan Güncel Haberler
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Rehberler, incelemeler ve en son oyun haberleri. Güncel kalın, avantajları kaçırmayın!
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Makale ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111218] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors" 
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg">
            <div className="bg-[#111218] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{blogPosts.length}</p>
              <p className="text-xs text-gray-400">Makale</p>
            </div>
            <div className="bg-[#111218] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{CATEGORIES.length - 1}</p>
              <p className="text-xs text-gray-400">Kategori</p>
            </div>
            <div className="bg-[#111218] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">5</p>
              <p className="text-xs text-gray-400">Yazar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-pink-500 text-white'
                : 'bg-[#1a1b23] text-gray-300 hover:bg-[#23242f] hover:text-white border border-white/5'
            }`}
          >
            {cat.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-white/5'}`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Post */}
          {activeCategory === 'all' && !searchQuery && featuredPost && (
            <Link 
              to={`/blog/${featuredPost.id}`}
              className="group block bg-[#1a1b23] rounded-2xl border border-white/5 overflow-hidden hover:border-pink-500/30 transition-all"
            >
              <div className="relative h-64 bg-gradient-to-r from-pink-900/30 to-purple-900/30">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ÖNE ÇIKAN
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-pink-400 text-xs font-bold uppercase tracking-wider">
                      {featuredPost.category}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featuredPost.date}
                    </span>
                    <span className="text-gray-400 text-xs">
                      10 DK OKUMA
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Post Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden hover:border-pink-500/30 transition-all"
              >
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-r from-pink-900/20 to-purple-900/20">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-pink-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-pink-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-2 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-pink-400 text-xs font-medium">
                    Devamını Oku
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="bg-[#1a1b23] rounded-xl border border-white/5 p-8 text-center">
              <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Makale bulunamadı</p>
              <p className="text-gray-500 text-sm mt-1">Farklı bir arama terimi deneyin</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Tags */}
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-pink-400" />
                Popüler Etiketler
              </h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1.5 bg-[#111218] hover:bg-pink-500/20 text-gray-300 hover:text-pink-400 rounded-lg text-xs font-medium transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Posts */}
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Trend Makaleler
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {blogPosts.slice(0, 4).map((post, i) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="flex items-start gap-3 p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm text-white font-medium line-clamp-2 group-hover:text-pink-400 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Bülten</h3>
                <p className="text-gray-400 text-xs">Güncel kalın!</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-4">
              En son haberler ve özel fırsatlardan haberdar olun.
            </p>
            <input 
              type="email"
              placeholder="E-posta adresiniz..."
              className="w-full bg-[#111218] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors mb-3"
            />
            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
              Abone Ol
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-[#1a1b23] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-bold text-white">Hızlı Erişim</h3>
            </div>
            <div className="p-2">
              {[
                { label: 'İlan Pazarı', to: '/ilan-pazari' },
                { label: 'Mağazalar', to: '/magazalar' },
                { label: 'Çekilişler', to: '/cekilisler' },
                { label: 'Yayıncılar', to: '/yayincilar' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <span className="text-sm text-gray-300 group-hover:text-white">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-pink-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
