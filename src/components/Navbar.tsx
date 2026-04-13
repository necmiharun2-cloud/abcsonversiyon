import { LayoutGrid, Store, ShoppingBag, Gift, Building2, Key, CreditCard, CreditCard as GiftCard, Users, Megaphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AllCategoriesSection from './AllCategoriesSection';

export default function Navbar() {
  const location = useLocation();
  const { profile } = useAuth();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isCategoriesPinned, setIsCategoriesPinned] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  const navItems = [
    { name: 'Kategoriler', icon: LayoutGrid, hasDropdown: true, path: '/' },
    { name: 'İlan Pazarı', icon: Store, path: '/ilan-pazari' },
    { name: 'Alım İlanları', icon: ShoppingBag, path: '/alim-ilanlari' },
    { name: 'Çekilişler', icon: Gift, color: 'text-yellow-500', path: '/cekilisler' },
    { name: 'Mağazalar', icon: Building2, path: '/magazalar' },
    { name: 'CD-Key', icon: Key, path: '/cd-key' },
    { name: 'Top Up', icon: CreditCard, path: '/top-up' },
    { name: 'Hediye Kartları', icon: GiftCard, path: '/hediye-kartlari' },
    { name: 'Topluluk', icon: Users, path: '/topluluk' },
    { name: 'Server Tanıtımı', icon: Megaphone, color: 'text-yellow-500', path: '/server-tanitimi' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
        setIsCategoriesPinned(false);
      }
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsCategoriesOpen(false);
        setIsCategoriesPinned(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <nav ref={navRef} className="bg-black/35 backdrop-blur border-b border-white/10 relative z-40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <ul className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isCategoriesItem = item.hasDropdown;
              return (
                <li
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => isCategoriesItem && setIsCategoriesOpen(true)}
                  onMouseLeave={() => {
                    if (isCategoriesItem && !isCategoriesPinned) setIsCategoriesOpen(false);
                  }}
                >
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      if (isCategoriesItem) {
                        e.preventDefault();
                        if (isCategoriesPinned || isCategoriesOpen) {
                          setIsCategoriesPinned(false);
                          setIsCategoriesOpen(false);
                          return;
                        }
                        setIsCategoriesPinned(true);
                        setIsCategoriesOpen(true);
                      }
                    }}
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 whitespace-nowrap group ${
                      item.color 
                        ? `${item.color} drop-shadow-[0_0_8px_rgba(234,179,8,0.6)] hover:drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]` 
                        : isActive 
                          ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]' 
                          : 'text-white/75 hover:text-white hover:drop-shadow-[0_0_14px_rgba(255,106,0,0.80)]'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 transition-transform duration-300 ${!item.color && !isActive ? 'group-hover:scale-110' : ''}`} />
                    {item.name}
                    {item.hasDropdown && <span className="text-[10px] ml-1">▼</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {isStaff && (
              <Link
                to="/admin"
                className="flex items-center gap-2 bg-[#1f2937] hover:bg-[#374151] text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-white/10"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {isCategoriesOpen && (
        <div
          className="absolute top-full left-0 right-0 px-4 sm:px-6 lg:px-8 pt-2"
          onMouseEnter={() => setIsCategoriesOpen(true)}
          onMouseLeave={() => {
            if (!isCategoriesPinned) setIsCategoriesOpen(false);
          }}
        >
          <div
            className="max-w-[1400px] mx-auto"
            onClick={() => {
              setIsCategoriesOpen(false);
              setIsCategoriesPinned(false);
            }}
          >
            <AllCategoriesSection />
          </div>
        </div>
      )}
    </nav>
  );
}
