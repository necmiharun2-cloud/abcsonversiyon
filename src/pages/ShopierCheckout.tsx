import { useEffect, useState } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Shopier ödeme formunu sunucudan alır ve tarayıcıda POST ile gönderir.
 * API anahtarları istemciye hiç gelmez.
 */
export default function ShopierCheckout() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('batchId');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(true);

  useEffect(() => {
    if (!batchId || !user) return;

    let cancelled = false;

    const run = async () => {
      try {
        const call = httpsCallable(functions, 'createShopierCheckout');
        const res = await call({ batchId });
        if (cancelled) return;
        const data = res.data as { actionUrl: string; fields: Record<string, string> };

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.actionUrl;
        form.style.display = 'none';
        for (const [name, value] of Object.entries(data.fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } catch (e: unknown) {
        const msg =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message?: string }).message)
            : 'Ödeme oturumu başlatılamadı.';
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [batchId, user]);

  if (loading) {
    return <div className="max-w-lg mx-auto py-24 text-center text-white">Yükleniyor…</div>;
  }
  if (!user) {
    return <Navigate to="/login?next=/sepet" replace />;
  }
  if (!batchId) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-4">
        <p className="text-white">Geçersiz ödeme oturumu.</p>
        <Link to="/sepet" className="text-[#a78bfa] underline">
          Sepete dön
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-24 px-4 text-center space-y-4">
        <p className="text-red-300 text-sm">{error}</p>
        <p className="text-white/60 text-xs">
          Firebase Console → Functions → yapılandırma:{' '}
          <code className="text-white/80">SHOPIER_API_KEY</code>,{' '}
          <code className="text-white/80">SHOPIER_API_SECRET</code>,{' '}
          <code className="text-white/80">SHOPIER_CALLBACK_URL</code>,{' '}
          <code className="text-white/80">APP_PUBLIC_URL</code>
        </p>
        <Link to="/sepet" className="inline-block text-[#a78bfa] underline">
          Sepete dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-24 text-center text-white space-y-2">
      <p className="text-lg font-semibold">Shopier&apos;ye yönlendiriliyorsunuz…</p>
      {submitting && <p className="text-white/50 text-sm">Lütfen bekleyin.</p>}
    </div>
  );
}
