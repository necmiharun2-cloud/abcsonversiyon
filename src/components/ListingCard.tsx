import { User, Heart, Eye, CheckCircle2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface ListingCardProps {
  title: string;
  category: string;
  seller: string;
  price: string;
  oldPrice?: string;
  imageColor: string;
  emoji?: string;
  views?: number;
  verified?: boolean;
  online?: boolean;
}

const ListingCard = ({ title, category, seller, price, oldPrice, imageColor, emoji = "🎮", views = Math.floor(Math.random() * 500 + 50), verified = Math.random() > 0.3, online = Math.random() > 0.4 }: ListingCardProps) => {
  const discount = oldPrice ? Math.round((1 - parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) / parseFloat(oldPrice.replace(/[^\d,]/g, '').replace(',', '.'))) * 100) : 0;

  return (
    <Link to="/ilan-pazari" className="group block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 duration-200">
      {/* Image area */}
      <div className="relative">
        <div className={`w-full h-[130px] ${imageColor} flex items-center justify-center`}>
          <span className="text-4xl opacity-60 group-hover:scale-110 transition-transform">{emoji}</span>
        </div>
        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-[hsl(var(--badge-vitrin))] text-[hsl(var(--badge-vitrin-foreground))] text-[10px] font-bold uppercase tracking-wide">
          Vitrin
        </span>
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[10px] font-bold">
            -{discount}%
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors">
            <Heart className="h-4 w-4 text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors">
            <ShoppingCart className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        {/* Seller */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
              {online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success border border-card" />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">SATICI</span>
            <span className="text-xs text-foreground font-medium truncate max-w-[80px]">{seller}</span>
            {verified && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
          </div>
        </div>

        {/* Category */}
        <p className="text-[10px] text-primary font-medium">{category}</p>

        {/* Title */}
        <h3 className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[32px]">
          {title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <span className="text-sm font-bold text-accent">{price}</span>
          {oldPrice && (
            <span className="text-[10px] text-muted-foreground line-through">{oldPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
