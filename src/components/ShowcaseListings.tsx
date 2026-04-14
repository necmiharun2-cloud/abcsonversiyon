import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import {
  mapProductDocToHomeListing,
  sortDocPairsNewestFirst,
  isServerTanitimCategory,
  isVitrinProduct,
  type HomeListing,
} from '../lib/homeListingUtils';

export default function ShowcaseListings() {
  const [listings, setListings] = useState<HomeListing[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(true);

  const mergeRemote = useCallback((pairs: { id: string; data: Record<string, unknown> }[]) => {
    const sorted = sortDocPairsNewestFirst(pairs);
    const vitrinOnly = sorted.filter(
      ({ data }) => isVitrinProduct(data) && !isServerTanitimCategory(data.category)
    );
    setListings(vitrinOnly.map(({ id, data }) => mapProductDocToHomeListing(id, data)).slice(0, 24));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeoutMs = 12000;

    const run = async () => {
      try {
        const q = query(collection(db, 'products'), limit(80));
        const snapshot = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Vitrin isteği zaman aşımı')), timeoutMs)
          ),
        ]);
        if (cancelled) return;
        const pairs = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as Record<string, unknown>,
        }));
        mergeRemote(pairs);
      } catch (e) {
        console.error('ShowcaseListings:', e);
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setLoadingRemote(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [mergeRemote]);

  const visibleListings = listings;

  return (
    <section
      id="vitrin-ilanlari"
      className="py-0 scroll-mt-28"
      aria-labelledby="showcase-listings-heading"
    >
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 id="showcase-listings-heading" className="text-lg font-bold text-white">
            Vitrin İlanları
          </h2>
          {loadingRemote && (
            <span className="text-xs text-white/45">Yükleniyor…</span>
          )}
        </div>

        <div className="bg-[#1a1b23] rounded-xl p-4 mb-6 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🚀</div>
            <div>
              <h3 className="text-white font-bold text-lg">
                Öne çıkarılmış vitrin ilanları
              </h3>
              <p className="text-white/60 text-sm">
                Bu alanda yalnızca vitrin / öne çıkarma ile işaretlenen ilanlar listelenir.
              </p>
            </div>
          </div>
          <Link
            to="/ilan-yukari-tasima"
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors hidden sm:inline-block text-center"
          >
            Öne çıkarma
          </Link>
        </div>

        {loadingRemote && listings.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-[#1a1b23] rounded-xl aspect-[3/4] animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1b23]/80 px-4 py-10 text-center text-sm text-white/60">
            Henüz vitrin ilanı yok. İlanlarınızı öne çıkarmak için{' '}
            <Link to="/ilan-yukari-tasima" className="text-[#a78bfa] underline">
              ilan yükseltme
            </Link>{' '}
            sayfasını kullanın veya yönetim panelinden vitrin işaretleyin.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {visibleListings.map((listing, idx) => (
              <Link
                key={listing.id}
                to={`/product/${listing.id}`}
                className="group bg-[#1a1b23] rounded-xl overflow-hidden border border-transparent hover:border-white/10 transition-all flex flex-col"
              >
                <div
                  className={`text-center py-1.5 text-[10px] font-bold tracking-wider text-white ${
                    idx % 3 === 0 ? 'bg-purple-600' : 'bg-[#10b981]'
                  }`}
                >
                  VİTRİN İLANI
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
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {listing.seller?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-white/50 leading-none">SATICI</span>
                      <span className="text-xs text-white font-medium leading-tight truncate">
                        {listing.seller?.name || 'Satıcı'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-1 truncate">
                    {listing.category}
                  </div>

                  <div className="text-sm text-white font-medium line-clamp-2 leading-snug mb-3 group-hover:text-[#facc15] transition-colors flex-1">
                    {listing.title}
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-[#facc15] font-bold text-base">
                      {listing.price.toFixed(2)} ₺
                    </span>
                    {listing.originalPrice && listing.originalPrice > listing.price && (
                      <span className="text-white/40 text-xs line-through">
                        {listing.originalPrice.toFixed(2)} ₺
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
