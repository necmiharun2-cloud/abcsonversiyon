import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type AuthTransitionState = {
  authTransition?: boolean;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function SecureLoginOverlay() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as AuthTransitionState;

  const [shownAt] = useState(() => Date.now());
  const [minElapsed, setMinElapsed] = useState(false);
  const [maxElapsed, setMaxElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMaxElapsed(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const phase = useMemo(() => {
    if (!state.authTransition) return 'off';
    if (!user) return 'auth';
    if (loading) return 'profile';
    return 'done';
  }, [state.authTransition, user, loading]);

  const isOpen = state.authTransition && !maxElapsed && (phase !== 'done' || !minElapsed);

  useEffect(() => {
    if (!state.authTransition) return;
    if (!maxElapsed && (phase !== 'done' || !minElapsed)) return;
    // Transition bitti: state'i temizle (yenilemede tekrar görünmesin)
    navigate(location.pathname + location.search, { replace: true, state: {} });
  }, [state.authTransition, phase, minElapsed, maxElapsed, navigate, location.pathname, location.search]);

  const progress = useMemo(() => {
    const ms = Date.now() - shownAt;
    // Sadece görsel amaçlı: gerçek durum step'lerle bağlı, bar yumuşak ilerlesin
    if (phase === 'auth') return clamp01(ms / 1200) * 0.35;
    if (phase === 'profile') return 0.35 + clamp01(ms / 1600) * 0.55;
    if (phase === 'done') return 1;
    return 0;
  }, [phase, shownAt]);

  if (!isOpen) return null;

  const steps = [
    { key: 'auth', label: 'Kimlik doğrulama yapılıyor', done: phase !== 'auth', active: phase === 'auth' },
    { key: 'checks', label: 'Güvenlik kontrolleri tamamlanıyor', done: phase === 'done', active: phase === 'profile' },
    { key: 'profile', label: 'Hesap bilgileri alınıyor', done: phase === 'done', active: phase === 'profile' },
  ] as const;

  return (
    <div className="fixed inset-0 z-[200] bg-[#111218]/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[460px] rounded-2xl border border-white/10 bg-[#1a1b23] shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5b68f6]/15 border border-[#5b68f6]/30 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#8b5cf6]" />
            </div>
          </div>

          <h2 className="text-center text-white font-extrabold text-lg">Güvenli Giriş</h2>
          <p className="text-center text-gray-400 text-xs mt-1">
            Oturum açma işlemi tamamlanıyor…
          </p>

          <div className="mt-5">
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#5b68f6]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {steps.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  {s.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : s.active ? (
                    <Loader2 className="w-5 h-5 text-[#60a5fa] animate-spin" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  )}
                </div>
                <div className="text-sm">
                  <div className={`font-medium ${s.done ? 'text-gray-300' : s.active ? 'text-white' : 'text-gray-500'}`}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 text-center text-[11px] text-gray-500">
            Lütfen bu sayfayı kapatmayın.
          </div>
        </div>
      </div>
    </div>
  );
}

