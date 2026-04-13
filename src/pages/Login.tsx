import { Mail, Lock, LogIn, Phone, KeyRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth, missingFirebaseEnvKeys } from '../firebase';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    grecaptcha: any;
    recaptchaVerifier: any;
  }
}

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRaw = searchParams.get('next') || '/';
  const nextPath = nextRaw.startsWith('/') ? nextRaw : '/';

  const executeEnterpriseRecaptcha = async () => {
    if (window.grecaptcha && window.grecaptcha.enterprise) {
      try {
        await window.grecaptcha.enterprise.ready(async () => {
          await window.grecaptcha.enterprise.execute('6Lc5R7UsAAAAADwMZUe9ODvODtDovAplhV3Wynkl', {action: 'LOGIN'});
        });
      } catch (e) {
        console.error("Enterprise reCAPTCHA error:", e);
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (missingFirebaseEnvKeys.length > 0) {
      toast.error('Firebase ayarları eksik. Sistem yöneticisiyle iletişime geçin.');
      return;
    }
    setGoogleLoading(true);
    try {
      await executeEnterpriseRecaptcha();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      navigate(nextPath, { replace: true, state: { authTransition: true } });
    } catch (error: unknown) {
      const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: string }).code) : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      if (code === 'auth/account-exists-with-different-credential') {
        toast.error('Bu e-posta farklı bir yöntemle kayıtlı.');
        return;
      }
      console.error('Google login error:', error);
      toast.error('Google ile giriş yapılamadı. Firebase Console’da Google provider açık olduğundan emin olun.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    if (missingFirebaseEnvKeys.length > 0) {
      toast.error('Firebase ayarları eksik. Sistem yöneticisiyle iletişime geçin.');
      return;
    }

    setLoading(true);
    try {
      await executeEnterpriseRecaptcha();
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      navigate(nextPath, { replace: true, state: { authTransition: true } });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('E-posta adresi veya şifre hatalı.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('E-posta/Şifre girişi Firebase konsolundan aktifleştirilmemiş!');
      } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid') {
        toast.error('Sistem yapılandırması eksik. Lütfen destekle iletişime geçin.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Ağ hatası. Bağlantınızı kontrol edip tekrar deneyin.');
      } else {
        toast.error(`Hata: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('Lütfen telefon numaranızı girin.');
      return;
    }

    setLoading(true);
    try {
      await executeEnterpriseRecaptcha();
      
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
        });
      }

      let formattedPhone = phoneNumber.replace(/\s+/g, '');
      if (formattedPhone.startsWith('+900')) {
        formattedPhone = '+90' + formattedPhone.slice(4);
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+90' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+90' + formattedPhone;
      }
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      toast.success('Doğrulama kodu gönderildi!');
    } catch (error: any) {
      console.error('SMS send error:', error);
      
      // Reset recaptcha if it fails so user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Geçersiz telefon numarası formatı.');
      } else {
        toast.error('Kod gönderilemedi. Lütfen numaranızı kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) {
      toast.error('Lütfen doğrulama kodunu girin.');
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      navigate(nextPath, { replace: true, state: { authTransition: true } });
    } catch (error: any) {
      console.error('Code verification error:', error);
      toast.error('Geçersiz doğrulama kodu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2200&q=80"
          alt=""
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/75" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-black/70 [clip-path:polygon(0_0,78%_0,62%_100%,0_100%)]" />
      </div>

      <div className="relative z-10 min-h-[calc(100vh-220px)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-black/55 backdrop-blur rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white mb-2">Giriş Yap</h1>
            <p className="text-white/65 text-sm">Hesabınıza giriş yaparak alışverişe devam edin.</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex bg-black/30 rounded-xl p-1 mb-6 border border-white/10">
            <button
              onClick={() => { setLoginMethod('email'); setConfirmationResult(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${loginMethod === 'email' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
            >
              E-posta
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${loginMethod === 'phone' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
            >
              Telefon
            </button>
          </div>

          <div id="recaptcha-container"></div>
          
          {loginMethod === 'email' ? (
            <form className="space-y-5" onSubmit={handleEmailLogin}>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-white/75 mb-1.5">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input 
                    id="login-email"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-white/75">Şifre</label>
                  <Link to="/sifremi-unuttum" className="text-xs text-white/70 hover:text-white transition-colors">Şifremi Unuttum</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input 
                    id="login-password"
                    type="password" 
                    name="password"
                    autoComplete="current-password"
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
                <LogIn className="w-5 h-5" />
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={confirmationResult ? handleVerifyCode : handleSendCode}>
              {!confirmationResult ? (
                <div>
                  <label htmlFor="login-phone" className="block text-sm font-medium text-white/75 mb-1.5">Telefon Numarası</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input 
                      id="login-phone"
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="555 123 45 67" 
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff6a00] transition-colors" 
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="login-code" className="block text-sm font-medium text-white/75 mb-1.5">Doğrulama Kodu</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input 
                      id="login-code"
                      type="text" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="6 haneli kod" 
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff6a00] transition-colors tracking-widest" 
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 btn-accent disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl transition-all"
              >
                <LogIn className="w-5 h-5" />
                {loading ? 'İşleniyor...' : (confirmationResult ? 'Kodu Doğrula' : 'SMS Gönder')}
              </button>
              
              {confirmationResult && (
                <button
                  type="button"
                  onClick={() => setConfirmationResult(null)}
                  className="w-full text-sm text-white/60 hover:text-white transition-colors mt-2"
                >
                  Numarayı Değiştir
                </button>
              )}
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-black/55 px-3 text-white/45">veya</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
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
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-white hover:text-white font-extrabold underline underline-offset-4">
              Hemen Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
