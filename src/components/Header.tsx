import { Search, User, LogOut, ShoppingCart, Plus, Bell, MessageSquare, ChevronDown, Menu, X, Wallet, Package, Tag, Star, LifeBuoy, ShieldCheck, PlusCircle } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, profile } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isCreateListingActive = location.pathname === '/ilan-ekle';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ilan-pazari?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAction = (path: string, state?: any) => {
    navigate(path, { state });
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Çıkış yapıldı.');
      setIsDropdownOpen(false);
    } catch (error) {
      toast.error('Çıkış yapılırken bir hata oluştu.');
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-[#2d3041] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-1 group">
              <div className="bg-gradient-to-br from-[#8b5cf6] to-purple-600 text-white font-black text-xl sm:text-2xl italic tracking-tighter px-3 py-1 rounded-xl shadow-[0_0_15px_rgba(91,97,255,0.4)] group-hover:shadow-[0_0_25px_rgba(91,97,255,0.7)] transition-all">
                itemTR
              </div>
              <span className="text-white/80 font-bold text-sm mt-2 group-hover:text-white transition-colors hidden sm:block">.com</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-[#1a1d2e] border border-white/10 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                placeholder="Buraya tıklayarak arama yap..."
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  to="/ilan-ekle"
                  className={`hidden sm:flex items-center gap-1.5 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isCreateListingActive
                      ? 'bg-purple-700 ring-1 ring-purple-300/40'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">İlan Ekle</span>
                </Link>
                
                <Link to="/sepet" className="relative p-2 text-white/70 hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link to="/mesajlarim" className="hidden sm:block relative p-2 text-white/70 hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <Link to="/bildirimler" className="relative p-2 text-white/70 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1d2e] rounded-xl border border-white/10 shadow-xl overflow-hidden">
                      <div className="p-3 border-b border-white/5">
                        <div className="text-white font-semibold text-sm truncate">{profile?.username || user.displayName || 'Kullanıcı'}</div>
                        <div className="text-white/50 text-xs truncate">{user.email}</div>
                      </div>
                      
                      <div className="p-2">
                        <button onClick={() => handleAction('/kontrol-merkezi', { activeView: 'balance' })} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors text-sm">
                          <PlusCircle className="w-4 h-4" /> Bakiye Yükle
                        </button>
                        <button onClick={() => handleAction('/kontrol-merkezi', { activeView: 'security' })} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-emerald-400 transition-colors text-sm">
                          <ShieldCheck className="w-4 h-4" /> Güvenli Hesap
                        </button>
                      </div>

                      <div className="p-2 border-t border-white/5">
                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors text-sm">
                          <User className="w-4 h-4" /> Profilim
                        </Link>
                        <Link to="/kontrol-merkezi" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors text-sm">
                          <Wallet className="w-4 h-4" /> Kontrol Merkezi
                        </Link>
                        <Link to="/siparislerim" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors text-sm">
                          <ShoppingCart className="w-4 h-4" /> Siparişlerim
                        </Link>
                        <Link to="/ilanlarim" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors text-sm">
                          <Tag className="w-4 h-4" /> İlanlarım
                        </Link>
                        <Link to="/favorilerim" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors text-sm">
                          <Star className="w-4 h-4" /> Favorilerim
                        </Link>
                        <Link to="/destek-sistemi" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors text-sm">
                          <LifeBuoy className="w-4 h-4" /> Destek
                        </Link>
                      </div>

                      <div className="p-2 border-t border-white/5">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-sm">
                          <LogOut className="w-4 h-4" /> Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
                  Giriş Yap
                </Link>
                <Link to="/register" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-3">
            <nav className="flex flex-col gap-1">
              <Link to="/ilan-pazari" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white text-sm">İlan Pazarı</Link>
              <Link to="/magazalar" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white text-sm">Mağazalar</Link>
              <Link to="/cd-key" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white text-sm">CD Key</Link>
              <Link to="/roblox" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white text-sm">Roblox</Link>
              <Link to="/destek-sistemi" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white text-sm">Destek</Link>
              {user && (
                <Link
                  to="/ilan-ekle"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold mt-2 ${
                    isCreateListingActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-600/20 text-purple-400'
                  }`}
                >
                  <Plus className="w-4 h-4" /> İlan Ekle
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
