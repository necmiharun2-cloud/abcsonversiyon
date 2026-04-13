/**
 * Uygulamada `/category/:slug` route'u yok; ilan arama ve sabit sayfalara yönlendirme.
 */
export function marketplaceCategoryHref(name: string, slug: string): string {
  if (slug === 'cd-key') return '/cd-key';
  if (slug === 'hediye-kartlari') return '/hediye-kartlari';
  if (slug === 'roblox') return '/roblox';
  return `/ilan-pazari?q=${encodeURIComponent(name)}`;
}
