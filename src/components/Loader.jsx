import React from 'react';

const VercelSpinner = ({ size = "w-5 h-5", text = "" }) => {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`border-2 border-zinc-700 border-t-white rounded-full animate-spin ${size}`} />
      {text && (
        <span className="text-xs font-medium text-zinc-400 tracking-wider">
          {text}
        </span>
      )}
    </div>
  );
};

export default VercelSpinner;