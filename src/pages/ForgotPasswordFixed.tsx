import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Lock } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

export default function ForgotPasswordFixed() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error('E-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed, {
        url: `${window.location.origin}/login?reset=1`,
        handleCodeInApp: false,
      });
      setSent(true);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (e: any) {
      const code = String(e?.code || '');
      if (code === 'auth/user-not-found') {
        toast.success('Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderilecektir.');
        setSent(true);
      } else if (code === 'auth/too-many-requests') {
        toast.error('Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.');
      } else {
        toast.error('Bağlantı gönderilemedi. Firebase Auth ayarlarını kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#1a1b23] rounded-2xl border border-white/5 p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500/15 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Şifremi Unuttum</h1>
          <p className="text-gray-400 text-center mt-2">
            {sent
              ? 'Sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.'
              : 'E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.'}
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-400 mb-2">
              E-posta Adresi
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-amber-400 transition-colors" />
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111218] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-all"
                placeholder="ornek@mail.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Bağlantı Gönder
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
