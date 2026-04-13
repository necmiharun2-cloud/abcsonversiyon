import { Smartphone, Download, Star } from "lucide-react";

const MobileAppBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary via-card to-secondary border border-border p-6 md:p-8">
      <div className="absolute -right-4 -bottom-4 opacity-5">
        <Smartphone className="w-48 h-48 text-foreground" />
      </div>
      <div className="relative flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="text-lg font-bold text-foreground">itemTR Mobil Uygulama</h3>
          <p className="text-sm text-muted-foreground">
            Her yerden güvenle alışveriş yapın. Anlık bildirimler, hızlı erişim ve özel mobil fırsatlar!
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 text-accent fill-accent" />)}
            </div>
            <span>4.8 · 10K+ indirme</span>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity">
            <Download className="h-4 w-4" />
            App Store
          </a>
          <a href="#" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity">
            <Download className="h-4 w-4" />
            Google Play
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileAppBanner;
