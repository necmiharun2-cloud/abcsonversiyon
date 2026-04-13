import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  type = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1b23] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">{message}</p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 text-white font-bold py-3 rounded-xl transition-all shadow-lg ${
                type === 'danger' 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-[#5b68f6] hover:bg-[#4a55d6] shadow-blue-500/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
