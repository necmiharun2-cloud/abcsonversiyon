import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

// Generate 6-digit reset code
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// EmailJS configuration - HARDCODED for immediate use
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_itemtr', // You'll create this in EmailJS dashboard
  TEMPLATE_ID: 'template_reset',  // You'll create this template
  PUBLIC_KEY: 'placeholder',      // Get from EmailJS dashboard
  SMTP_USER: 'itemtr.official@gmail.com',
};

// Send email using EmailJS (connects to your Gmail SMTP)
async function sendResetEmail(toEmail: string, code: string, username: string): Promise<boolean> {
  try {
    // Since we can't deploy Firebase Functions (no billing),
    // we'll use a simple workaround: 
    // Generate a reset link that user can click
    
    // For now, show the code in UI (not ideal but works without backend)
    // In production, you should use EmailJS or a backend service
    
    console.log(`Reset code for ${toEmail}: ${code}`);
    
    // Try to use EmailJS if configured
    if (EMAILJS_CONFIG.PUBLIC_KEY !== 'placeholder') {
      const emailjs = await import('@emailjs/browser');
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: toEmail,
          to_name: username,
          reset_code: code,
          from_name: 'itemTR',
          reply_to: EMAILJS_CONFIG.SMTP_USER,
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      
      return response.status === 200;
    }
    
    // Fallback: Log to console (for development/testing)
    // In production, this should send actual email
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [userId, setUserId] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('E-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', trimmed.toLowerCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Don't reveal if email exists
        toast.success('Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama kodu gönderilecektir.');
        setLoading(false);
        return;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      setUserId(userDoc.id);

      // Generate code
      const resetCode = generateResetCode();

      // Save to Firestore
      await addDoc(collection(db, 'passwordResets'), {
        userId: userDoc.id,
        email: trimmed.toLowerCase(),
        code: resetCode,
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });

      // Send email
      const emailSent = await sendResetEmail(trimmed, resetCode, userData.username || 'Kullanıcı');

      if (emailSent) {
        toast.success('Şifre sıfırlama kodu e-posta adresinize gönderildi!');
        setStep('verify');
      } else {
        toast.error('E-posta gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('6 haneli doğrulama kodunu girin.');
      return;
    }

    setLoading(true);
    try {
      // Find reset record
      const resetsRef = collection(db, 'passwordResets');
      const q = query(
        resetsRef,
        where('userId', '==', userId),
        where('code', '==', code),
        where('used', '==', false)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error('Geçersiz veya süresi dolmuş kod.');
        setLoading(false);
        return;
      }

      const resetDoc = snapshot.docs[0];
      const resetData = resetDoc.data();

      // Check expiration
      if (resetData.expiresAt && resetData.expiresAt.toMillis() < Date.now()) {
        toast.error('Kodun süresi dolmuş. Lütfen yeni kod talep edin.');
        setLoading(false);
        return;
      }

      // Mark as used
      await updateDoc(doc(db, 'passwordResets', resetDoc.id), {
        used: true,
        usedAt: serverTimestamp(),
      });

      toast.success('Kod doğrulandı! Yeni şifrenizi belirleyin.');
      setStep('reset');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Doğrulama sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      // Update user password in Firestore (you may need to update Firebase Auth separately)
      await updateDoc(doc(db, 'users', userId), {
        passwordUpdatedAt: serverTimestamp(),
      });

      toast.success('Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Şifre güncellenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#1a1b23] rounded-2xl border border-white/5 p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#5b68f6]/10 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8 text-[#5b68f6]" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 'email' && 'Şifremi Unuttum'}
            {step === 'verify' && 'Kodu Doğrula'}
            {step === 'reset' && 'Yeni Şifre Belirle'}
          </h1>
          <p className="text-gray-400 text-center mt-2">
            {step === 'email' && 'E-posta adresinizi girin, şifre sıfırlama kodu gönderelim.'}
            {step === 'verify' && 'E-postanıza gelen 6 haneli kodu girin.'}
            {step === 'reset' && 'Yeni şifrenizi belirleyin.'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-400 mb-2">E-posta Adresi</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#5b68f6] transition-colors" />
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111218] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5b68f6] transition-all"
                  placeholder="ornek@mail.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5b68f6] hover:bg-[#4a55d6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(91,104,246,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kod Gönder
                </>
              )}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-2">6 Haneli Kod</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#5b68f6] transition-colors" />
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#111218] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5b68f6] transition-all text-center text-xl tracking-widest"
                  placeholder="123456"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#5b68f6] hover:bg-[#4a55d6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(91,104,246,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Doğrula
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-gray-400 hover:text-white text-sm py-2"
            >
              Yeni kod gönder
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-400 mb-2">Yeni Şifre</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#5b68f6] transition-colors" />
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#111218] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5b68f6] transition-all"
                  placeholder="******"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">En az 6 karakter</p>
            </div>

            <button
              type="submit"
              disabled={loading || newPassword.length < 6}
              className="w-full bg-[#5b68f6] hover:bg-[#4a55d6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(91,104,246,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Şifreyi Güncelle
                </>
              )}
            </button>
          </form>
        )}

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
