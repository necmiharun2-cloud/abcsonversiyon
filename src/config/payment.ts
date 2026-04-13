/**
 * Ödeme sağlayıcı seçimi (yalnızca VITE_* — API sırları burada olmaz).
 *
 * - `firebase`: Cloud Functions üzerinde test/mock tahsilat (geliştirme ve demo)
 * - `shopier`: Shopier form + webhook (API anahtarları Firebase Functions ortamında)
 */
export type PaymentProviderName = 'firebase' | 'shopier';

export function getPaymentProviderName(): PaymentProviderName {
  const v = String(import.meta.env.VITE_PAYMENT_PROVIDER || 'firebase').toLowerCase();
  if (v === 'shopier') return 'shopier';
  return 'firebase';
}

export function isShopierMode(): boolean {
  return getPaymentProviderName() === 'shopier';
}
