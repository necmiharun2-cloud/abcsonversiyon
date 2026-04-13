import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { safeGetItem, safeSetItem } from '../lib/safeStorage';

type Lang = 'tr' | 'en';

const DICT: Record<Lang, Record<string, string>> = {
  tr: {
    searchPlaceholder: 'Ürün, kategori veya mağaza ara...',
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    cart: 'Sepet',
    nav_deals: 'Fırsatlar',
    nav_market: 'İlan Pazarı',
  },
  en: {
    searchPlaceholder: 'Search product, category or store...',
    login: 'Sign in',
    register: 'Sign up',
    cart: 'Cart',
    nav_deals: 'Deals',
    nav_market: 'Marketplace',
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const s = safeGetItem('lang');
    return s === 'en' ? 'en' : 'tr';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    safeSetItem('lang', l);
    document.documentElement.lang = l === 'en' ? 'en' : 'tr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'tr';
  }, [lang]);

  const t = useCallback(
    (key: string) => DICT[lang][key] ?? DICT.tr[key] ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
