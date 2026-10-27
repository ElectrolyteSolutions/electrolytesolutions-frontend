import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  isDestructive = false,
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-vercel-black border-1 border-zinc-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header / Content */}
        <div className="p-6 space-y-2">
          <h3 className="text-base font-semibold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-4 bg-zinc-950/60 border-t border-zinc-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-transparent hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-md text-xs font-semibold transition-colors border-1 border-zinc-800 cursor-pointer"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/10'
            }`}
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-md animate-spin"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;