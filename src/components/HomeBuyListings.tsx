import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import {
  mapProductDocToHomeListing,
  sortDocPairsNewestFirst,
  type HomeListing,
} from '../lib/homeListingUtils';

export default function HomeBuyListings() {
  const [listings, setListings] = useState<HomeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  const applyPairs = useCallback((pairs: { id: string; data: Record<string, unknown> }[]) => {
    const sorted = sortDocPairsNewestFirst(pairs);
    const buyOnly = sorted.filter(({ data }) => {
      const type = String(data.type ?? '').toLowerCase();
      const status = String(data.status ?? '').toLowerCase();
      return type === 'buy' && status === 'active';
    });
    setListings(buyOnly.map(({ id, data }) => mapProductDocToHomeListing(id, data)).slice(0, 32));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const q = query(collection(db, 'products'), limit(80));
        const snapshot = await getDocs(q);
        if (cancelled) return;
        const pairs = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as Record<string, unknown>,
        }));
        applyPairs(pairs);
      } catch (e) {
        console.error('HomeBuyListings:', e);
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [applyPairs]);

  const visibleListings = listings.slice(0, visibleCount);

  return (
    <section className="py-0">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Alım İlanları</h2>
            <p className="text-white/50 text-sm">Yalnızca aktif alım ilanları listeleniyor.</p>
          </div>
          <Link to="/alim-ilanlari" className="text-amber-400 text-sm font-medium hover:underline">
            Tümünü gör
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-[#1a1b23] rounded-xl aspect-[3/4] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-[#1a1b23] rounded-xl p-8 text-center border border-white/5">
            <p className="text-white/50">Henüz aktif alım ilanı bulunmuyor.</p>
            <Link to="/alim-ilanlari" className="inline-block mt-4 text-amber-400 text-sm font-medium hover:underline">
              Alım ilanları sayfasına git
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {visibleListings.map((listing, idx) => (
                <Link
                  key={`${listing.id}-${idx}`}
                  to={`/product/${listing.id}`}
                  className="group bg-[#1a1b23] rounded-xl overflow-hidden border border-transparent hover:border-white/10 transition-all flex flex-col"
                >
                  <div className="text-center py-1.5 text-[10px] font-bold tracking-wider text-white bg-amber-500">
                    ALIM İLANI
                  </div>

                  <div className="relative aspect-[16/9] overflow-hidden shrink-0">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-1 truncate">
                      {listing.category}
                    </div>

                    <div className="text-sm text-white font-medium line-clamp-2 leading-snug mb-3 group-hover:text-[#facc15] transition-colors flex-1">
                      {listing.title}
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-[#facc15] font-bold text-base">{listing.price.toFixed(2)} ₺</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {listings.length > visibleCount && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-8 py-2.5 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  + Daha fazla alım ilanı göster
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
