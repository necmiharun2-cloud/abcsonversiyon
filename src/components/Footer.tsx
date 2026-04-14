import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#2d3041] border-t border-white/10 pt-10 pb-6 mt-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          {/* Column 1: Hızlı Erişim */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4">Hızlı Erişim</h3>
            <ul className="space-y-2">
              <li><Link to="/hakkimizda" className="text-white/60 hover:text-white transition-colors text-xs">Hakkımızda</Link></li>
              <li><Link to="/register" className="text-white/60 hover:text-white transition-colors text-xs">Kayıt Ol</Link></li>
              <li><Link to="/login" className="text-white/60 hover:text-white transition-colors text-xs">Giriş Yap</Link></li>
              <li><Link to="/sifremi-unuttum" className="text-white/60 hover:text-white transition-colors text-xs">Şifremi Unuttum</Link></li>
              <li><Link to="/ilan-ekle" className="text-white/60 hover:text-white transition-colors text-xs">İlan Ekle</Link></li>
              <li><Link to="/alim-ilanlari" className="text-white/60 hover:text-white transition-colors text-xs">Alım İlanları</Link></li>
              <li><Link to="/cd-key" className="text-white/60 hover:text-white transition-colors text-xs">CD Key</Link></li>
              <li><Link to="/destek-sistemi" className="text-white/60 hover:text-white transition-colors text-xs">Yardım Merkezi</Link></li>
            </ul>
          </div>

          {/* Column 2: Kurumsal */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4">Kurumsal</h3>
            <ul className="space-y-2">
              <li><Link to="/gizlilik-politikasi" className="text-white/60 hover:text-white transition-colors text-xs">Gizlilik Politikası</Link></li>
              <li><Link to="/gizlilik-politikasi" className="text-white/60 hover:text-white transition-colors text-xs">KVKK Politikası</Link></li>
              <li><Link to="/kullanici-sozlesmesi" className="text-white/60 hover:text-white transition-colors text-xs">Üyelik Sözleşmesi</Link></li>
              <li><Link to="/kullanici-sozlesmesi" className="text-white/60 hover:text-white transition-colors text-xs">Kullanım Koşulları</Link></li>
              <li><Link to="/mesafeli-satis-sozlesmesi" className="text-white/60 hover:text-white transition-colors text-xs">Mesafeli Satış</Link></li>
              <li><Link to="/iade-politikasi" className="text-white/60 hover:text-white transition-colors text-xs">İptal & İade</Link></li>
            </ul>
          </div>

          {/* Column 3: Popüler Kategoriler */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4">Popüler Kategoriler</h3>
            <ul className="space-y-2">
              <li><Link to="/ilan-pazari?q=Valorant" className="text-white/60 hover:text-white transition-colors text-xs">VALORANT VP Satın Al</Link></li>
              <li><Link to="/ilan-pazari?q=Valorant" className="text-white/60 hover:text-white transition-colors text-xs">VALORANT Hesap Satın Al</Link></li>
              <li><Link to="/ilan-pazari?q=Discord" className="text-white/60 hover:text-white transition-colors text-xs">Discord Nitro, Owo Bot</Link></li>
              <li><Link to="/roblox" className="text-white/60 hover:text-white transition-colors text-xs">Roblox Robux</Link></li>
              <li><Link to="/ilan-pazari?q=League%20of%20Legends" className="text-white/60 hover:text-white transition-colors text-xs">LoL RP & LoL Hesap</Link></li>
              <li><Link to="/ilan-pazari?q=PUBG" className="text-white/60 hover:text-white transition-colors text-xs">PUBG Mobile UC</Link></li>
              <li><Link to="/ilan-pazari?q=Steam" className="text-white/60 hover:text-white transition-colors text-xs">Steam Cüzdan Kodu</Link></li>
            </ul>
          </div>

          {/* Column 4: Sosyal Medya */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4">Sosyal Medya</h3>
            <div className="space-y-2">
              <a href="https://discord.gg/itemTR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs">
                <div className="w-6 h-6 rounded bg-[#5865F2] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                </div>
                Discord
              </a>
              <a href="https://instagram.com/itemTR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  <Instagram className="w-3.5 h-3.5 text-white" />
                </div>
                Instagram
              </a>
              <a href="https://tiktok.com/@itemTR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs">
                <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-white" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
                </div>
                TikTok
              </a>
              <a href="https://youtube.com/itemTR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs">
                <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
                  <Youtube className="w-3.5 h-3.5 text-white" />
                </div>
                YouTube
              </a>
              <a href="https://twitter.com/itemTR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs">
                <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                  <Twitter className="w-3.5 h-3.5 text-white" />
                </div>
                X (Twitter)
              </a>
            </div>
          </div>

          {/* Column 5: YAPAY ZEKADA BİZ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-white font-bold text-sm">YAPAY ZEKADA BİZ</h3>
              <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
            </div>
            <ul className="space-y-2">
              <li><a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs"><Sparkles className="w-3 h-3 text-green-400" /> ChatGPT</a></li>
              <li><a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs"><Sparkles className="w-3 h-3 text-blue-400" /> Gemini</a></li>
              <li><a href="https://perplexity.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs"><Sparkles className="w-3 h-3 text-teal-400" /> Perplexity</a></li>
              <li><a href="https://grok.x.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs"><Sparkles className="w-3 h-3 text-orange-400" /> Grok</a></li>
              <li><a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs"><Sparkles className="w-3 h-3 text-purple-400" /> Claude</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-white/10 pt-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <a href="#" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                <MessageCircle className="w-4 h-4" />
                Canlı Desteğe Bağlan
              </a>
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Phone className="w-4 h-4" />
                <span>0850 304 22 54</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Mail className="w-4 h-4" />
                <span>destek@itemTR.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-white/10 pt-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Papara', 'Visa', 'Mastercard', 'Troy', 'PayTR', 'Türkcell', 'PayPal'].map((method) => (
              <div key={method} className="bg-[#1a1d2e] border border-white/10 rounded px-3 py-1.5 text-[10px] font-bold text-white/50">
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/itemtr-logo.svg" alt="itemTR.com" className="h-8 w-auto" />
            </Link>
          </div>
          <p className="text-white/40 text-xs text-center">
            © 2024-2026 itemTR. Tüm hakları saklıdır. Bu bir klon projesidir.
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-[#1a1d2e] border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-white/40">ETBİS</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
