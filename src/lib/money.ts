export function toCents(amount: number) {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

export function fromCents(cents: number) {
  if (!Number.isFinite(cents)) return 0;
  return cents / 100;
}

export function clampNonNegativeInt(n: number) {
  if (!Number.isFinite(n)) return 0;
  const v = Math.trunc(n);
  return v < 0 ? 0 : v;
}

