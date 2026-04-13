import { ClipboardList, Heart, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, documentId, where } from 'firebase/firestore';
import { findMockListingById } from '../lib/catalog';

export default function Favorites() {
  const { user, loading } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setFavoriteProducts([]);
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      try {
        // Firestore 'in' query has a limit of 10 items.
        // For a real app, you might need to chunk the array or fetch individually if > 10.
        // Here we'll chunk it to be safe.
        const chunks = [];
        for (let i = 0; i < favorites.length; i += 10) {
          chunks.push(favorites.slice(i, i + 10));
        }

        let allFetched: any[] = [];
        for (const chunk of chunks) {
          const q = query(collection(db, 'products'), where(documentId(), 'in', chunk));
          const snapshot = await getDocs(q);
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) }));
          allFetched = [...allFetched, ...fetched];
        }
        const fetchedIds = new Set(allFetched.map((p) => String(p.id)));
        const missing = favorites.filter((fid) => !fetchedIds.has(String(fid)));
        const mockFallback = missing
          .map((fid) => findMockListingById(String(fid)))
          .filter(Boolean);

        setFavoriteProducts([...allFetched, ...(mockFallback as any[])]);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  if (loading) return <div className="text-center py-20 text-white">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white mb-6">Favori İlanlarım ({favoriteProducts.length})</h1>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {favoriteProducts.map((listing) => (
            <div key={listing.id} className="bg-[#1a1b23] rounded-lg overflow-hidden border border-white/5 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105 transition-all duration-300 group relative flex flex-col">
              <Link to={`/product/${listing.id}`} className="flex-1 flex flex-col">
                <div className="relative aspect-[4/3]">
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">{listing.category}</span>
                  <h4 className="text-sm text-white font-medium line-clamp-2 mb-3 leading-snug group-hover:text-blue-400 transition-colors">
                    {listing.title}
                  </h4>
                  <div className="mt-auto flex items-end gap-2">
                    <span className="text-yellow-500 font-bold text-lg leading-none">{Number(listing.price || 0).toFixed(2)} ₺</span>
                  </div>
                </div>
              </Link>
              <button 
                onClick={() => toggleFavorite(listing.id.toString())}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1b23] border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-24 h-24 mb-6 relative">
            <ClipboardList className="w-full h-full text-gray-400 opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Favori ilan bulunamadı.</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Favorilerinize eklediğiniz hiçbir ilan bulunamadı.<br/>
            İlanları yakından takip edebilmek için hemen bir kaç tane ilanı favorilerinize ekleyin.
          </p>
        </div>
      )}
    </div>
  );
}
