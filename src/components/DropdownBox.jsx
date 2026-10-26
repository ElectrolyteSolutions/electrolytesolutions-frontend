import React, { useState, useRef, useEffect } from 'react';

const VercelDropdown = ({ value, onSelect,leftOptions=[] ,rightOptions=[], placeholder = "Select option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Left column options
 

  const handleItemClick = (id) => {
    setIsOpen(false);
    if (onSelect) onSelect(id);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button matching your screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-3 bg-white text-black px-3 py-2 rounded-md text-sm font-semibold hover:opacity-80 transition-all cursor-pointer shadow-sm border-white border-1"
      >
        <span>{value.label}</span>
        <svg 
          className={`w-5 h-5 text-black transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Two-Column Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[180px] rounded-xl shadow-2xl p-1 z-50  gap-x-1 animate-in fade-in zoom-in-95 duration-150 bg-vercel-surface">
          
        {/* Right Column */}
            {rightOptions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-3 py-2 px-2.5 rounded-lg text-sm font-medium text-zinc-200 hover:bg-vercel-secondary hover:text-white transition-colors text-left group"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

      )}
    </div>
  );
};

export default VercelDropdown;