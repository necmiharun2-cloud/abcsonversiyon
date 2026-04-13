import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';

export type SiteBanner = {
  label?: string;
  text: string;
  accent?: 'amber' | 'red' | 'emerald' | 'blue' | 'purple' | 'gray';
  active?: boolean;
};

export type HeroSlide = {
  imageUrl: string;
  eyebrow?: string;
  title?: string;
  query?: string;
  active?: boolean;
};

export type SiteSettings = {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  topBarMessage?: string;
  floatingChatEnabled?: boolean;
  banners?: SiteBanner[];
  heroSlides?: HeroSlide[];
};

const DEFAULTS: Required<
  Pick<SiteSettings, 'maintenanceMode' | 'maintenanceMessage' | 'topBarMessage' | 'floatingChatEnabled' | 'banners' | 'heroSlides'>
> = {
  maintenanceMode: false,
  maintenanceMessage: 'Sistem bakımdadır. Lütfen daha sonra tekrar deneyin.',
  topBarMessage: 'En uygun fiyatlarla Valorant VP satın almak için tıklayın.',
  floatingChatEnabled: true,
  banners: [
    { label: 'PUBG MOBILE', text: 'RP A18 Şimdi Oyunda!', accent: 'amber', active: true },
    { label: 'Valorant', text: 'Karaçalı Koleksiyonu Şimdi Oyunda', accent: 'red', active: true },
    { label: 'FC26 Kategorisine Özel', text: 'BIZIMCOCUKLAR koduyla 50₺ üzeri alışverişlerinde %5 indirim!', accent: 'emerald', active: true },
  ],
  heroSlides: [
    {
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2200&q=80',
      eyebrow: 'FPS',
      title: 'Valorant VP ve hesap ilanları',
      query: 'Valorant',
      active: true,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1546443046-ed1ce6ffd1f0?auto=format&fit=crop&w=2200&q=80',
      eyebrow: 'MOBA',
      title: 'League of Legends RP ve hesap ilanları',
      query: 'League of Legends',
      active: true,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=2200&q=80',
      eyebrow: 'BATTLE ROYALE',
      title: 'PUBG UC ve hesap ilanları',
      query: 'PUBG',
      active: true,
    },
  ],
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const ref = doc(db, 'siteSettings', 'global');
    const unsub = onSnapshot(ref, (snap) => {
      setSettings((snap.exists() ? (snap.data() as SiteSettings) : {}) as SiteSettings);
    }, () => {
      // don't spam UI; components can fall back to defaults
      setSettings(null);
    });
    return unsub;
  }, []);

  const merged = useMemo(() => {
    const raw = settings || {};
    return {
      maintenanceMode: Boolean(raw.maintenanceMode ?? DEFAULTS.maintenanceMode),
      maintenanceMessage: String(raw.maintenanceMessage || DEFAULTS.maintenanceMessage),
      topBarMessage: String(raw.topBarMessage || DEFAULTS.topBarMessage),
      floatingChatEnabled: Boolean(raw.floatingChatEnabled ?? DEFAULTS.floatingChatEnabled),
      banners: Array.isArray(raw.banners) && raw.banners.length > 0 ? raw.banners : DEFAULTS.banners,
      heroSlides: Array.isArray(raw.heroSlides) && raw.heroSlides.length > 0 ? raw.heroSlides : DEFAULTS.heroSlides,
    } as Required<typeof DEFAULTS> & SiteSettings;
  }, [settings]);

  return merged;
}

