import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { safeGetItem, safeSetItem } from '../lib/safeStorage';

export default function ProfileWarningModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Sadece ilk girişte göstermek için localStorage kontrolü
    const hasSeenWarning = safeGetItem('hasSeenProfileWarning');
    if (!hasSeenWarning) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    safeSetItem('hasSeenProfileWarning', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#23242f] rounded-xl max-w-[550px] w-full relative shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Dikkat</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="mb-6">
            <AlertCircle className="w-20 h-20 text-[#ff4747]" strokeWidth={2} />
          </div>
          
          <p className="text-white text-lg font-semibold leading-relaxed mb-8 px-4">
            Kendini itemTR Yetkilisi veya Teslimat Görevlisi olarak tanıtanlara inanmayınız canlı desteğe bildiriniz.
          </p>
          
          <div className="w-full flex justify-end">
            <button 
              onClick={handleClose}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-2.5 rounded-lg font-medium transition-colors shadow-lg"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
