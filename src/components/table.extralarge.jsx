import React, { useState, useRef, useCallback, useEffect } from 'react';

const ResizablePanes = ({ leftPane, rightPane, defaultLeftWidth = '58%', animationKey }) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const containerRef = useRef(null);

  const hasLeft = Boolean(leftPane);
  const hasRight = Boolean(rightPane) && !isRightCollapsed;

  // Whenever a new item is clicked/selected (changing the animationKey or rightPane), automatically un-collapse!
  useEffect(() => {
    if (rightPane) {
      setIsRightCollapsed(false);
    }
  }, [animationKey, rightPane]);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e) => {
      if (!isResizing || !containerRef.current || !hasLeft || !hasRight) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      
      const offsetX = clientX - containerRect.left;
      const newWidthPercentage = (offsetX / containerRect.width) * 100;

      if (newWidthPercentage >= 25 && newWidthPercentage <= 85) {
        setLeftWidth(`${newWidthPercentage}%`);
      }
    },
    [isResizing, hasLeft, hasRight]
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

  // Case 1: Only Right Pane exists
  if (!hasLeft && hasRight) {
    return (
      <div ref={containerRef} className="flex flex-col w-full h-full overflow-hidden">
        <div key={animationKey} className="w-full h-full custom-scrollbar animate-in slide-in-from-right-4 duration-300">
          {rightPane}
        </div>
      </div>
    );
  }

  // Case 2: Only Left Pane exists or Right is collapsed
  if (hasLeft && !hasRight) {
    return (
      <div ref={containerRef} className="flex flex-col w-full h-full overflow-hidden relative">
        <div className="w-full h-full custom-scrollbar">{leftPane}</div>
        {Boolean(rightPane) && (
          <button
            type="button"
            onClick={() => setIsRightCollapsed(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2 rounded-l-md border border-zinc-700 shadow-lg transition-all cursor-pointer"
            title="Expand panel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Case 3: Both Panes exist (Resizable Split Layout)
  return (
    <div 
      ref={containerRef} 
      className="flex flex-col lg:flex-row w-full h-full relative select-none overflow-hidden"
    >
      {/* Left Pane */}
      <div 
        style={{ width: window.innerWidth >= 1024 ? leftWidth : '100%' }}
        className="flex flex-col h-full overflow-none custom-scrollbar pr-0 lg:pr-3 transition-none"
      >
        {leftPane}
      </div>

      {/* Resizer Handle with Hover Collapse Button */}
      <div
        onMouseDown={startResizing}
        onTouchStart={startResizing}
        className={`hidden lg:flex items-center justify-center w-2 cursor-col-resize group transition-colors relative z-10 ${
          isResizing ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        <div className={`h-8 w-0.5 rounded-full transition-colors ${isResizing ? 'bg-white' : 'bg-zinc-800 group-hover:bg-zinc-500'}`} />
        
        {/* Small hover button on the bar */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsRightCollapsed(true);
          }}
          className="absolute opacity-0 group-hover:opacity-100 bg-zinc-900 hover:bg-zinc-700 text-zinc-300 hover:text-white p-1 rounded shadow transition-all z-20 cursor-pointer"
          title="Collapse right panel"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Right Pane */}
      <div 
        style={{ width: window.innerWidth >= 1024 ? `calc(100% - ${leftWidth} - 8px)` : '100%' }}
        className="flex flex-col h-full overflow-none custom-scrollbar pl-0 lg:pl-3 lg:mt-0 transition-none"
      >
        <div key={animationKey} className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300 overflow-none">
          {rightPane}
        </div>
      </div>
    </div>
  );
};

export default ResizablePanes;