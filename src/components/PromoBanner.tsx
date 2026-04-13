import { X, Sparkles } from "lucide-react";
import { useState } from "react";

const PromoBanner = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-accent text-white relative">
      <div className="container flex items-center justify-center py-2 text-sm font-medium gap-2">
        <Sparkles className="h-4 w-4" />
        <span>🔥 %95'e Varan İndirimler! Haftanın en iyi fırsatlarını kaçırmayın</span>
        <a href="#" className="underline font-bold ml-1">Göz Atın →</a>
        <button onClick={() => setVisible(false)} className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
