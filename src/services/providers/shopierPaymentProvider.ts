import {
  PaymentProvider,
  PaymentInitInput,
  PaymentInitResult,
  PaymentConfirmInput,
  PaymentCaptureInput,
  PaymentRefundInput,
} from './paymentProvider';

/**
 * Sepet akışı Shopier için `prepareShopierBatchOrders` + `/odeme/shopier` üzerinden
 * `createShopierCheckout` ile yürür; bu sınıf doğrudan `initPayment` ile kullanılmamalıdır.
 */
export class ShopierPaymentProvider implements PaymentProvider {
  async initPayment(_input: PaymentInitInput): Promise<PaymentInitResult> {
    return {
      providerRef: 'shopier-use-cart-checkout',
      status: 'requires_action',
      redirectUrl: undefined,
      // @ts-ignore
      errorMessage:
        'Shopier ödemesi sepet üzerinden yapılır. Lütfen Sepeti tamamlayın veya VITE_PAYMENT_PROVIDER ayarını kontrol edin.',
    };
  }

  async confirm3DS(_input: PaymentConfirmInput): Promise<{ status: 'authorized' | 'failed', errorMessage?: string }> {
    return { status: 'failed', errorMessage: 'Shopier ödeme altyapısı şu anda aktif değildir.' };
  }

  async capture(_input: PaymentCaptureInput): Promise<{ status: 'captured' | 'failed', errorMessage?: string }> {
    return { status: 'failed', errorMessage: 'Shopier ödeme altyapısı şu anda aktif değildir.' };
  }

  async refund(_input: PaymentRefundInput): Promise<{ status: 'refunded' | 'failed', errorMessage?: string }> {
    return { status: 'failed', errorMessage: 'Shopier ödeme altyapısı şu anda aktif değildir.' };
  }
}

