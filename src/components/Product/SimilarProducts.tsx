import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { findSimilarMockListings } from '../../lib/catalog';
import { getShowcaseFallback } from '../../lib/catalog';

interface SimilarProductsProps {
  category?: string;
  currentProductId?: string;
}

type ProductLike = { id: string; [key: string]: unknown };

export default function SimilarProducts({ category, currentProductId }: SimilarProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        let q;
        if (category) {
          q = query(
            collection(db, 'products'),
            where('category', '==', category),
            where('status', '==', 'active'),
            limit(5) // Fetch 5 to filter out current product
          );
        } else {
          q = query(
            collection(db, 'products'),
            where('status', '==', 'active'),
            limit(4)
          );
        }

        const snapshot = await getDocs(q);
        let fetchedProducts: ProductLike[] = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as object) }) as ProductLike);
        
        if (currentProductId) {
          fetchedProducts = fetchedProducts.filter((p) => p.id !== currentProductId);
        }

        let next = fetchedProducts.slice(0, 4);
        if (next.length < 4) {
          const seen = new Set<string>(next.map((p) => String(p.id)));
          const extras = (findSimilarMockListings(category, currentProductId, 8) as any[]).filter(
            (p) => !seen.has(String(p.id))
          );
          next = [...next, ...extras].slice(0, 4);
        }

        if (next.length < 4) {
          const seen = new Set<string>(next.map((p) => String(p.id)));
          if (currentProductId) seen.add(String(currentProductId));
          const fallback = (getShowcaseFallback() as ProductLike[])
            .filter((p: any) => !seen.has(String(p.id)))
            .slice(0, 4 - next.length);
          next = [...next, ...fallback];
        }
        setProducts(next);
      } catch (error) {
        console.error('Error fetching similar products:', error);
        const base = findSimilarMockListings(category, currentProductId, 4) as any[];
        if (base.length >= 4) setProducts(base.slice(0, 4));
        else {
          const seen = new Set<string>(base.map((p) => String(p.id)));
          if (currentProductId) seen.add(String(currentProductId));
          const fallback = (getShowcaseFallback() as ProductLike[])
            .filter((p: any) => !seen.has(String(p.id)))
            .slice(0, 4 - base.length);
          setProducts([...base, ...fallback]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [category, currentProductId]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <div className="mt-12 mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Benzer İlanlar</h2>
        <Link to="/ilan-pazari" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          Tümünü Gör →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link 
            to={`/product/${product.id}`} 
            key={product.id} 
            className="bg-[#1a1b23] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-colors group cursor-pointer"
          >
            <div className="relative aspect-[4/3]">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-[10px] text-gray-300 font-medium mb-1">{product.category}</div>
                <div className="text-sm text-white font-bold line-clamp-1">{product.title}</div>
                <div className="text-emerald-500 font-bold mt-1">{Number(product.price ?? 0).toFixed(2)} ₺</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
