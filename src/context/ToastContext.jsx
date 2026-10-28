import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to add a toast (message, type: 'success' | 'error' | 'info', duration in ms)
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper function to assign matching border color based on status type
  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/50 shadow-emerald-500/10';
      case 'error':
        return 'border-red-500/50 shadow-red-500/10';
      case 'info':
      default:
        return 'border-zinc-700 shadow-white/5';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Floating Toast Container (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 bg-vercel-card text-zinc-100 px-4 py-3 rounded-md border-1 ${getBorderColor(
              toast.type
            )} shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {toast.type === 'success' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              )}
              {toast.type === 'error' && (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              )}
              {toast.type === 'info' && (
                <span className="w-2 h-2 rounded-full bg-white shrink-0"></span>
              )}
              <span className="text-zinc-200">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white transition-colors text-xs font-bold cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};