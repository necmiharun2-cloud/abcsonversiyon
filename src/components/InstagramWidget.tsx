import { Instagram, ExternalLink } from "lucide-react";

const InstagramWidget = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-400/10 rounded-2xl border border-border p-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Instagram className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">İtemSatış Instagram Hesabı</p>
            <p className="text-xs text-muted-foreground">@itemsatis • 25K+ Takipçi</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
          Çekiliş, kampanya ve güncel haberler için Instagram'da bizi takip edin! Özel indirim kodları ve sürpriz hediyeler sizi bekliyor 🎁
        </p>
        <a
          href="#"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-lg shadow-pink-500/20"
        >
          <Instagram className="h-4 w-4" />
          Takip Et
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default InstagramWidget;
