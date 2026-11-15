import React, { useEffect, useState } from 'react';

export function BottomSheet({ isOpen, onClose, title, children }) {
  const [touchStartY, setTouchStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  // Lock background scroll and listen for Escape key when open
  useEffect(() => {
    if (!isOpen) {
      setTranslateY(0);
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Touch handlers for swipe-down to close
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 100) {
      onClose();
    }
    setTranslateY(0);
  };

  return (
    <>
      {/* Dark Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          transform: isOpen ? `translateY(${translateY}px)` : 'translateY(100%)',
        }}
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-vercel-card shadow-2xl ${
          translateY > 0 ? 'transition-none' : 'transition-transform duration-300 ease-out'
        }`}
      >
        {/* Drag Handle & Header */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="cursor-grab d-flex select-none px-4 py-1 active:cursor-grabbing items-center"
        >
          {/* Pill Handle */}
          
          <div className="mx-auto h-1.5 w-10 rounded-full bg-gray-300" />

          <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
              
        </div>


        {/* Scrollable Content */}
        <div className=" h-[80vh] pb-6">{children}</div>
      </div>
    </>
  );
}
