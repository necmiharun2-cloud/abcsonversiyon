import { useState, useRef, useEffect } from "react";
import { LayoutGrid, ShoppingBag, ShoppingCart, Store, Key, CreditCard, Gift, Users, Plus, Dice5, ChevronDown, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import MegaMenu from "./MegaMenu";

const navItems = [
  { icon: ShoppingBag, label: "İlan Pazarı", href: "/ilan-pazari" },
  { icon: ShoppingCart, label: "Alım İlanları", href: "/alim-ilanlari" },
  { icon: Store, label: "Mağazalar", href: "/magazalar" },
  { icon: Key, label: "CD-Key", href: "/cd-key" },
  { icon: CreditCard, label: "Top Up", href: "/top-up" },
  { icon: Gift, label: "Hediye Kartları", href: "/hediye-kartlari" },
  { icon: Users, label: "Topluluk", href: "/topluluk" },
];

const NavMenu = () => {
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleEnter = () => {
    clearTimeout(timerRef.current);
    setMegaOpen(true);
  };

  const handleLeave = () => {
    timerRef.current = setTimeout(() => {
      setMegaOpen(false);
    }, 200);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="bg-card/50 border-b border-border relative z-30">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-1.5">
            {/* Kategoriler with mega menu */}
            <div
              ref={megaRef}
              className="relative"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap font-medium">
                <LayoutGrid className="h-4 w-4" />
                <span>Kategoriler</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>

              {megaOpen && <MegaMenu />}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            ))}

            <Link
              to="/giveaways"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap bg-success/10 text-success hover:bg-success/20 transition-colors"
            >
              <Dice5 className="h-3.5 w-3.5" />
              🎲 Çekilişler
            </Link>

            <Link
              to="/category"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-1"
            >
              <Flame className="h-3.5 w-3.5" />
              🔥 İndirimler
            </Link>
          </div>

          <Link
            to="/create-listing"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0 ml-2"
          >
            <Plus className="h-4 w-4" />
            İlan Ekle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
