import { showcaseListings, valorantListings } from '../data/mockData';

export function normalizeListing(raw: Record<string, unknown>): Record<string, unknown> {
  const price = Number(raw.price ?? 0);
  const oldPrice = raw.oldPrice != null ? Number(raw.oldPrice) : undefined;
  return {
    ...raw,
    status: 'active',
    price,
    oldPrice,
    description: (raw.description as string) || (raw.title as string) || '',
    type: raw.type || 'YENİ İLAN',
  };
}

const allMockRaw: Record<string, unknown>[] = [...showcaseListings, ...valorantListings].map((x) =>
  normalizeListing(x as Record<string, unknown>)
);

export function findMockListingById(id: string | undefined): Record<string, unknown> | null {
  if (!id) return null;
  const found = allMockRaw.find((p) => String(p.id) === id);
  return found ? { ...found } : null;
}

export function getShowcaseFallback() {
  return showcaseListings.map((x) => normalizeListing(x as Record<string, unknown>));
}

/** Yeni ilanlar bölümü: vitrin olmayan örnek ilanlar (mock) */
export function getNewListingsFallback(): Record<string, unknown>[] {
  const rows = valorantListings.filter((x) => {
    const v = x as { isVitrin?: boolean; type?: string };
    if (v.isVitrin) return false;
    const t = String(v.type || '').toUpperCase();
    return !t.includes('VİTRİN') && !t.includes('VITRIN');
  });
  const base = rows.length > 0 ? rows : valorantListings;
  return base.map((x) => normalizeListing(x as Record<string, unknown>));
}

export function getMockListingsForCategoryTab(category: string): Record<string, unknown>[] {
  const sc = showcaseListings.map((x) => normalizeListing(x as Record<string, unknown>));
  const va = valorantListings.map((x) => normalizeListing(x as Record<string, unknown>));

  if (category === 'VALORANT') {
    const merged = [...va, ...sc.filter((l) => String(l.category).toUpperCase().includes('VALORANT'))];
    return merged.length ? merged : sc.slice(0, 8);
  }

  const match = sc.filter((l) => l.category === category);
  if (match.length) return match;

  return sc.slice(0, 6);
}

export function findSimilarMockListings(
  category: string | undefined,
  excludeId: string | undefined,
  limit = 4
): Record<string, unknown>[] {
  return allMockRaw
    .filter((p) => {
      if (p.id === excludeId) return false;
      if (!category) return true;
      const pc = String(p.category);
      const c = String(category);
      return pc === c || pc.includes(c) || c.includes(pc);
    })
    .slice(0, limit);
}
