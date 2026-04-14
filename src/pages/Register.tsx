import { User, Mail, Lock, UserPlus, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, db, functions, missingFirebaseEnvKeys } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { isAdminEmail } from '../config/admin';
import { tradeOrchestrator } from '../services/tradeOrchestrator';
import { httpsCallable } from 'firebase/functions';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const ensureProfileAndWelcome = async (
    user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null },
    preferredUsername?: string,
    preferredPhone?: string
  ) => {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    const isFirstTime = !snap.exists();

    if (isFirstTime) {
      const normalizedEmail = (user.email || '').toLowerCase().trim();
      const shouldBootstrapAdmin = isAdminEmail(normalizedEmail);
      const resolvedUsername = (preferredUsername || user.displayName || user.email?.split('@')[0] || 'User').trim();
      const cleanPhone = String(preferredPhone || '').replace(/[^\d+]/g, '').trim();
      const newProfile = {
        uid: user.uid,
        username: resolvedUsername,
        email: user.email || '',
        phone: cleanPhone,
        smsVerified: false,
        avatar: user.photoURL || '',
        bio: '',
        balance: 0,
        balanceAvailableCents: 0,
        balanceHeldCents: 0,
        role: shouldBootstrapAdmin ? 'admin' : 'user',
        accountStatus: 'active',
        salesEnabled: true,
        riskNote: '',
        createdAt: new Date().toISOString(),
        listingCount: 0,
        soldCount: 0,
        rating: 0,
        reviewCount: 0,
        storeLevel: 'standard',
        isVerifiedSeller: false,
        kycStatus: 'none',
        kycReferenceId: '',
        notifications: {
          orders: true,
          messages: true,
          system: true,
          marketing: false,
        },
      };
      await setDoc(userDocRef, newProfile);

      await tradeOrchestrator.notificationProvider.notifyInApp({
        userId: user.uid,
        title: 'Hoşgeldiniz!',
        message: 'itemTR’a hoş geldiniz. İlk ilanınızı inceleyebilir veya favorilerinizi oluşturmaya başlayabilirsiniz.',
        type: 'success',
      });
    }

    return { isFirstTime };
  };

  const handleGoogleRegister = async () => {
    if (missingFirebaseEnvKeys.length > 0) {
      toast.error('Firebase ayarları eksik. Sistem yöneticisiyle iletişime geçin.');
      return;
    }
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      toast.success('Kayıt/Giriş başarılı! Yönlendiriliyorsunuz...');
      navigate('/', { replace: true, state: { authTransition: true } });

      // İlk kez giriş yapan kullanıcı için profil + hoşgeldiniz bildirimi (arka planda)
      void ensureProfileAndWelcome(credential.user).catch((e) => {
        console.error('Google register profile bootstrap failed:', e);
      });
    } catch (error: unknown) {
      const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: string }).code) : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      console.error('Google register error:', error);
      toast.error('Google ile kayıt olunamadı. Firebase Console’da Google provider açık olduğundan emin olun.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !phone) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }
    const cleanPhone = phone.replace(/[^\d+]/g, '').trim();
    if (cleanPhone.length < 8) {
      toast.error('Geçerli bir telefon girin.');
      return;
    }
    if (missingFirebaseEnvKeys.length > 0) {
      toast.error('Firebase ayarları eksik. Sistem yöneticisiyle iletişime geçin.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with username
      try {
        await updateProfile(user, { displayName: username });
      } catch (e) {
        console.error('Profile displayName update failed:', e);
      }

      // Send email verification (best-effort)
      void sendEmailVerification(user, {
        url: `${window.location.origin}/login?emailVerified=1`,
        handleCodeInApp: false,
      }).catch(() => {});

      toast.success('Kayıt başarılı! E-posta doğrulaması gerekli. Yönlendiriliyorsunuz...');
      navigate('/', { replace: true, state: { authTransition: true } });

      // Profil + (ilk kayıt ise) hoşgeldiniz bildirimi (arka planda)
      void ensureProfileAndWelcome(user, username, cleanPhone).catch((e: any) => {
        console.error('Profile bootstrap failed:', e);
        toast.error('Kayıt tamamlandı fakat profil/bildirim oluşturulamadı.');
      });

      // Phone verification (mock functions): try to auto-verify if devCode is available
      void (async () => {
        try {
          const send = httpsCallable(functions, 'smsSend');
          const resp = await send({ phone: cleanPhone });
          const devCode = (resp.data as any)?.devCode as string | null;
          if (devCode && /^\d{6}$/.test(devCode)) {
            const verify = httpsCallable(functions, 'smsVerify');
            await verify({ phone: cleanPhone, code: devCode });
          }
        } catch (err) {
          console.warn('Auto phone verify skipped/failed:', err);
        }
      })();
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Bu e-posta adresi zaten kullanımda.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Şifre en az 6 karakter olmalıdır.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('E-posta/Şifre girişi Firebase konsolundan aktifleştirilmemiş!');
      } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid') {
        toast.error('Sistem yapılandırması eksik. Lütfen destekle iletişime geçin.');
      } else {
        toast.error('Kayıt sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600861194942-f883de0dfe96?auto=format&fit=crop&w=2400&q=85"
          alt=""
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/75" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-black/70 [clip-path:polygon(0_0,78%_0,62%_100%,0_100%)]" />
      </div>

      <div className="relative z-10 min-h-[calc(100vh-220px)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-black/55 backdrop-blur rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white mb-2">Kayıt Ol</h1>
            <p className="text-white/65 text-sm">Aramıza katılın ve avantajlardan yararlanın.</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label htmlFor="register-username" className="block text-sm font-medium text-white/75 mb-1.5">Kullanıcı Adı</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="register-username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınız"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff6a00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-white/75 mb-1.5">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff6a00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium text-white/75 mb-1.5">Telefon Numarası</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5xx xxx xx xx"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff6a00] transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-white/75 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff6a00] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 btn-accent disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl transition-all"
            >
              <UserPlus className="w-5 h-5" />
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-black/55 px-3 text-white/45">veya</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? 'Bağlanılıyor...' : 'Google ile devam et'}
          </button>

          <div className="mt-6 text-center text-sm text-white/60">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-white hover:text-white font-extrabold underline underline-offset-4">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
