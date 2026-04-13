type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function getStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!('localStorage' in window)) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function safeGetItem(key: string): string | null {
  try {
    const s = getStorage();
    return s ? s.getItem(key) : null;
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    const s = getStorage();
    if (!s) return;
    s.setItem(key, value);
  } catch {
    // no-op
  }
}

export function safeRemoveItem(key: string): void {
  try {
    const s = getStorage();
    if (!s) return;
    s.removeItem(key);
  } catch {
    // no-op
  }
}

