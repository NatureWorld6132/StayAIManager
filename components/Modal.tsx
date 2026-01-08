
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'light' | 'dark';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, variant = 'light' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = variant === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative ${isDark ? 'bg-[#1a202c] text-white' : 'bg-white text-slate-800'} w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
        <div className={`px-6 pt-6 pb-4 flex justify-between items-center`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h2>
          <button 
            onClick={onClose}
            className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        
        <div className="px-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
};
