import React from 'react';
import { X, Coffee } from 'lucide-react';
import { Language, Translation } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative text-white text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
          <Coffee size={32} className="text-white" />
        </div>

        <h2 className="text-2xl font-bold font-hand mb-2">{t.proModalTitle}</h2>
        <p className="text-gray-300 mb-6">{t.proModalDesc}</p>

        {/* Mock QR Code */}
        <div className="bg-white p-2 rounded-xl w-40 h-40 mx-auto mb-6">
            <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://buymeacoffee.com" 
                alt="Payment QR" 
                className="w-full h-full opacity-90"
            />
        </div>

        <button 
            onClick={onClose}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-transform active:scale-95"
        >
            {t.proAction}
        </button>
      </div>
    </div>
  );
};

export default ProModal;