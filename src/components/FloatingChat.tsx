import { MessageCircle, Star, X } from 'lucide-react';
import { useState } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function FloatingChat() {
  const [showTooltip, setShowTooltip] = useState(true);
  const settings = useSiteSettings();

  if (!settings.floatingChatEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
      {showTooltip && (
        <div className="bg-[#23242f] border border-white/10 text-white px-4 py-2.5 rounded-md flex items-center gap-3 text-sm shadow-xl animate-fade-in">
          <Star className="w-4 h-4 text-white fill-current" />
          <span className="font-medium">7/24 Canlı Destek</span>
          <button 
            onClick={() => setShowTooltip(false)}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <button className="w-14 h-14 bg-[#5b68f6] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4a55d6] transition-colors hover:scale-105 active:scale-95">
        <MessageCircle className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
