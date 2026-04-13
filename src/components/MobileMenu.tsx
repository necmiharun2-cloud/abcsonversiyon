import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, LayoutGrid, ShoppingBag, ShoppingCart, Store, Key,
  CreditCard, Gift, Users, Dice5, User, Settings, MessageCircle,
  Bell, Wallet, HelpCircle, LogIn, UserPlus, ChevronRight, LayoutDashboard, Package, Star, Flame
} from "lucide-react";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  const mainLinks = [
    { icon: Home, label: "Ana Sayfa", to: "/" },
    { icon: LayoutGrid, label: "Kategoriler", to: "/tum-kategoriler" },
    { icon: ShoppingBag, label: "İlan Pazarı", to: "/ilan-pazari" },
    { icon: ShoppingCart, label: "Alım İlanları", to: "/alim-ilanlari" },
    { icon: Store, label: "Mağazalar", to: "/magazalar" },
    { icon: Key, label: "CD-Key", to: "/cd-key" },
    { icon: CreditCard, label: "Top Up", to: "/top-up" },
    { icon: Gift, label: "Hediye Kartları", to: "/hediye-kartlari" },
    { icon: Dice5, label: "Çekilişler", to: "/cekilisler" },
    { icon: Flame, label: "İndirimler", to: "/firsatlar" },
    { icon: Users, label: "Topluluk", to: "/topluluk" },
  ];

  const accountLinks = [
    { icon: LogIn, label: "Giriş Yap", to: "/login" },
    { icon: UserPlus, label: "Kayıt Ol", to: "/register" },
    { icon: LayoutDashboard, label: "Kullanıcı Paneli", to: "/kontrol-merkezi" },
    { icon: Package, label: "Siparişlerim", to: "/siparislerim" },
    { icon: Wallet, label: "Bakiye Yükle", to: "/bakiye-yukle" },
    { icon: MessageCircle, label: "Mesajlar", to: "/mesajlarim" },
    { icon: Settings, label: "Ayarlar", to: "/profile" },
    { icon: HelpCircle, label: "Destek", to: "/destek-sistemi" },
    { icon: Star, label: "Admin Panel", to: "/admin" },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-card border-r border-border z-50 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-lg">İ</div>
                <span className="text-lg font-bold text-foreground">
                  item<span className="text-primary">satış</span>
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-b border-border">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/create-listing" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                  <Package className="h-4 w-4" /> İlan Ekle
                </Link>
                <Link to="/deposit" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-success/10 text-success text-sm font-semibold">
                  <Wallet className="h-4 w-4" /> Bakiye Yükle
                </Link>
              </div>
            </div>

            <div className="p-3">
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menü</p>
              {mainLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ))}

              <div className="my-3 border-t border-border" />

              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hesap</p>
              {accountLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    link.label === "Admin Panel"
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileMenu;
