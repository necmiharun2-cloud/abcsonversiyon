import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, where, type QueryConstraint, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { listingImage, avatarImage } from '../lib/media';
import { ShoppingCart, Zap } from 'lucide-react';

type Filters = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  keyword?: string;
  includeDescription?: boolean;
  onlineOnly?: boolean;
  autoDelivery?: boolean;
  trustedOnly?: boolean;
  corporateOnly?: boolean;
  type?: 'buy' | 'sell';
};

function normCategory(c: unknown) {
  return String(c || '').trim().toLowerCase();
}

function matchesText(hay: string, needle: string) {
  const h = hay.toLowerCase();
  const n = needle.toLowerCase();
  return h.includes(n);
}

export default function MarketplaceListings({ filters }: { filters?: Filters | null }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const clientFilter = useMemo(() => {
    const seller = String(filters?.seller || '').trim();
    const keyword = String(filters?.keyword || '').trim();
    const includeDesc = Boolean(filters?.includeDescription);
    const category = normCategory(filters?.category || '');
    const minPrice = filters?.minPrice ? Number(filters.minPrice) : NaN;
    const maxPrice = filters?.maxPrice ? Number(filters.maxPrice) : NaN;
    return { seller, keyword, includeDesc, category, minPrice, maxPrice };
  }, [filters?.seller, filters?.keyword, filters?.includeDescription, filters?.category, filters?.minPrice, filters?.maxPrice]);

  useEffect(() => {
    setLoading(true);
    const constraints: QueryConstraint[] = [where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(40)];

    if (filters?.type) constraints.push(where('type', '==', filters.type));
    if (filters?.autoDelivery) constraints.push(where('deliveryType', '==', 'Otomatik Teslimat'));

    const q = query(collection(db, 'products'), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));
        setRows(fetched);
        setLoading(false);
      },
      () => {
        setRows([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [filters?.type, filters?.autoDelivery]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const rowCategory = normCategory(r.category);
      const sellerName = String(r.sellerName || '');
      const title = String(r.title || '');
      const desc = String(r.description || '');
      const rowPrice = Number(r.price || 0);
      if (clientFilter.category && rowCategory !== clientFilter.category) return false;
      if (!Number.isNaN(clientFilter.minPrice) && rowPrice < clientFilter.minPrice) return false;
      if (!Number.isNaN(clientFilter.maxPrice) && rowPrice > clientFilter.maxPrice) return false;
      if (clientFilter.seller && !matchesText(sellerName, clientFilter.seller)) return false;
      if (clientFilter.keyword) {
        const hay = clientFilter.includeDesc ? `${title} ${desc}` : title;
        if (!matchesText(hay, clientFilter.keyword)) return false;
      }
      return true;
    });
  }, [rows, clientFilter]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-black/25 border border-white/10 rounded-2xl h-[260px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-black/20 border border-white/10 rounded-2xl p-10 text-center text-white/65">
        Sonuç bulunamadı.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filtered.map((p) => {
        const cat = normCategory(p.category) || 'Kategori';
        const title = String(p.title || 'İlan');
        const price = Number(p.price || 0);
        const cover = String(p.image || listingImage(700, 420, title));

        return (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="group bg-black/20 border border-white/10 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105"
          >
            <div className="relative h-[170px]">
              <img src={cover} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-[1.03] transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                {p.type === 'buy' ? (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg bg-amber-500 text-white">
                    <ShoppingCart className="w-3 h-3" />
                    ALIM İLANI
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg border border-white/10 bg-black/45 text-white">
                    SATIŞ
                  </span>
                )}
                {p.deliveryType === 'Otomatik Teslimat' && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg border border-white/10 bg-black/45 text-yellow-400">
                    <Zap className="w-3 h-3" />
                    OTO
                  </span>
                )}
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-12 h-12 rounded-full bg-black/55 border border-white/15 backdrop-blur flex items-center justify-center overflow-hidden">
                <img
                  src={avatarImage(cat.slice(0, 2).toUpperCase())}
                  alt=""
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>

            <div className="p-3">
              <div className="text-[10px] text-white/60 font-extrabold uppercase tracking-wider">{cat}</div>
              <div className="mt-1 text-white font-extrabold text-xs line-clamp-2 min-h-[32px]">{title}</div>

              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="accent-text font-extrabold">{price.toFixed(2)} ₺</div>
                <div className="btn-buy text-white font-extrabold text-[11px] px-3 py-2 rounded-xl">Satın Al</div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-white/55 border-t border-white/10 pt-2">
                <div className="truncate max-w-[60%]">{String(p.sellerName || 'Satıcı')}</div>
                <div className="text-white/45">{p.isVitrin ? 'Vitrin' : 'Yeni'}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

