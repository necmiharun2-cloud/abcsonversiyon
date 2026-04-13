import { useState } from "react";
import { LayoutGrid } from "lucide-react";

const tabs = [
  { name: "Tümü", emoji: "" },
  { name: "Instagram", emoji: "📸" },
  { name: "Roblox", emoji: "🎮" },
  { name: "TikTok", emoji: "🎵" },
  { name: "Minecraft", emoji: "⛏️" },
  { name: "OpenAI", emoji: "🤖" },
  { name: "Hayday", emoji: "🌾" },
  { name: "YouTube", emoji: "▶️" },
  { name: "Yapay Zeka", emoji: "🧠" },
  { name: "Kick", emoji: "🟢" },
  { name: "Netflix", emoji: "🎬" },
  { name: "Brawl Stars", emoji: "⭐" },
];

const subCategories = [
  { name: "Steam", emoji: "🎯" },
  { name: "Discord", emoji: "💬" },
  { name: "Valorant Random Hesap", emoji: "🎲" },
  { name: "Steam Random Key", emoji: "🔑" },
  { name: "ARC Raiders", emoji: "🚀" },
  { name: "Valorant", emoji: "🎯" },
  { name: "Microsoft", emoji: "🪟" },
  { name: "PUBG Mobile", emoji: "🔫" },
  { name: "FC 26", emoji: "⚽" },
  { name: "Mail Hesapları", emoji: "📧" },
];

const CategoryTabs = () => {
  const [active, setActive] = useState("Tümü");

  return (
    <div className="space-y-3">
      {/* Main tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActive(tab.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              active === tab.name
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.name === "Tümü" ? <LayoutGrid className="h-3.5 w-3.5" /> : <span className="text-base">{tab.emoji}</span>}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Sub-categories */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {subCategories.map((sub) => (
          <a
            key={sub.name}
            href="#"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all whitespace-nowrap group"
          >
            <span className="text-base group-hover:scale-110 transition-transform">{sub.emoji}</span>
            {sub.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
