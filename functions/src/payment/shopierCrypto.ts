import * as crypto from 'crypto';

/** Ödeme formu: data = random_nr + platform_order_id + total_order_value + currency (string birleşim) */
export function signShopierForm(data: string, apiSecret: string): string {
  const h = crypto.createHmac('sha256', apiSecret).update(data, 'utf8').digest();
  return Buffer.from(h).toString('base64');
}

/**
 * Shopier geri dönüş / webhook: çoğu entegrasyonda doğrulama
 * HMAC-SHA256(random_nr + platform_order_id, secret) == base64_decode(signature)
 */
export function verifyShopierReturnSignature(payload: Record<string, string>, apiSecret: string): boolean {
  const randomNr = String(payload.random_nr ?? '');
  const platformOrderId = String(payload.platform_order_id ?? '');
  const sigB64 = String(payload.signature ?? '');
  if (!randomNr || !platformOrderId || !sigB64) return false;
  const data = `${randomNr}${platformOrderId}`;
  const expected = crypto.createHmac('sha256', apiSecret).update(data, 'utf8').digest();
  let decoded: Buffer;
  try {
    decoded = Buffer.from(sigB64, 'base64');
  } catch {
    return false;
  }
  if (expected.length !== decoded.length) return false;
  return crypto.timingSafeEqual(expected, decoded);
}
