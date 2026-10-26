import React, { useState, useRef, useCallback, useEffect } from 'react';

const ResizablePanes = ({ leftPane, rightPane, defaultLeftWidth = '58%' }) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      
      // Calculate new width relative to the container
      const offsetX = clientX - containerRect.left;
      const newWidthPercentage = (offsetX / containerRect.width) * 100;

      // Enforce min and max limits (e.g., between 25% and 75% width)
      if (newWidthPercentage >= 25 && newWidthPercentage <= 75) {
        setLeftWidth(`${newWidthPercentage}%`);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      window.addEventListener('touchmove', resize);
      window.addEventListener('touchend', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', resize);
      window.removeEventListener('touchend', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-120px)] relative select-none overflow-hidden"
    >
      {/* Left Pane */}
      <div 
        style={{ width: window.innerWidth >= 1024 ? leftWidth : '100%' }}
        className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-0 lg:pr-3 transition-none"
      >
        {leftPane}
      </div>

      {/* Resizer Handle (Hidden on small mobile screens) */}
      <div
        onMouseDown={startResizing}
        onTouchStart={startResizing}
        className={`hidden lg:flex items-center justify-center w-2 cursor-col-resize group transition-colors relative z-10 ${
          isResizing ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        <div className={`h-8 w-0.5 rounded-full transition-colors ${isResizing ? 'bg-white' : 'bg-vercel-card group-hover:bg-zinc-500'}`} />
      </div>

      {/* Right Pane */}
      <div 
        style={{ width: window.innerWidth >= 1024 ? `calc(100% - ${leftWidth} - 8px)` : '100%' }}
        className="flex border-l-1 border-zinc-800 flex-col h-full overflow-y-auto custom-scrollbar pl-0 lg:pl-3 lg:mt-0 transition-none"
      >
        {rightPane}
      </div>
    </div>
  );
};

export default ResizablePanes;