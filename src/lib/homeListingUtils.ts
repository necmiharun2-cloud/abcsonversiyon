/**
 * Anasayfa vitrin / yeni ilanlar / server tanıtım bölümleri için ortak yardımcılar.
 */

export type HomeListing = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  seller: {
    name: string;
    avatar?: string;
  };
  isVitrin?: boolean;
  type?: string;
};

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80';

export function mapProductDocToHomeListing(id: string, data: Record<string, unknown>): HomeListing {
  const d = data as {
    title?: string;
    price?: number;
    originalPrice?: number;
    oldPrice?: number;
    image?: string;
    images?: string[];
    category?: string;
    seller?: { name?: string; avatar?: string };
    sellerName?: string;
    isVitrin?: boolean;
    featured?: boolean;
    type?: string;
  };
  return {
    id,
    title: d.title || 'İlan',
    price: Number(d.price) || 0,
    originalPrice:
      d.originalPrice != null ? Number(d.originalPrice) : d.oldPrice != null ? Number(d.oldPrice) : undefined,
    image: d.image || d.images?.[0] || PLACEHOLDER_IMAGE,
    category: d.category || 'Genel',
    seller: {
      name: d.seller?.name || d.sellerName || 'Satıcı',
      ...(d.seller?.avatar ? { avatar: d.seller.avatar } : {}),
    },
    isVitrin: d.isVitrin || d.featured,
    type: d.type,
  };
}

export function createdAtMs(data: Record<string, unknown>): number {
  const c = data.createdAt as { toDate?: () => Date } | undefined;
  if (c && typeof c.toDate === 'function') {
    try {
      return c.toDate().getTime();
    } catch {
      /* ignore */
    }
  }
  return 0;
}

export function isServerTanitimCategory(category: unknown): boolean {
  return String(category ?? '').toUpperCase() === 'SERVER TANITIMI';
}

/** Vitrin bölümü: yönetim / öne çıkarma ile işaretlenen ilanlar */
export function isVitrinProduct(data: Record<string, unknown>): boolean {
  if (data.isVitrin === true || data.featured === true) return true;
  const t = String(data.type ?? '').toUpperCase();
  return t.includes('VİTRİN') || t.includes('VITRIN');
}

/** Yeni ilanlar: server tanıtımı değil ve vitrin öne çıkarma değil (günlük ilanlar) */
export function isYeniIlanProduct(data: Record<string, unknown>): boolean {
  if (isServerTanitimCategory(data.category)) return false;
  return !isVitrinProduct(data);
}

export function sortDocPairsNewestFirst(
  pairs: { id: string; data: Record<string, unknown> }[]
): { id: string; data: Record<string, unknown> }[] {
  return [...pairs].sort((a, b) => createdAtMs(b.data) - createdAtMs(a.data));
}
