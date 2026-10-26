import React from 'react';

const SkeletonLoader = ({ type = "table", rows = 5 }) => {
  if (type === "list") {
    return (
      <div className="divide-y divide-zinc-800 animate-pulse w-full">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-2 w-1/2">
              <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
              <div className="h-3 bg-zinc-900 rounded w-1/3"></div>
            </div>
            <div className="space-y-2 w-1/4 flex flex-col items-end">
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
              <div className="h-3 bg-zinc-900 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default Table Skeleton
  return (
    <div className="w-full animate-pulse">
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex gap-4">
        <div className="h-3 bg-zinc-800 rounded w-16"></div>
        <div className="h-3 bg-zinc-800 rounded w-32"></div>
        <div className="h-3 bg-zinc-800 rounded w-20"></div>
        <div className="h-3 bg-zinc-800 rounded w-24 ml-auto"></div>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-4 flex items-center justify-between gap-4">
            <div className="h-4 bg-zinc-900 rounded w-16"></div>
            <div className="h-4 bg-zinc-900 rounded w-40"></div>
            <div className="h-4 bg-zinc-900 rounded w-20"></div>
            <div className="h-4 bg-zinc-900 rounded w-24"></div>
            <div className="h-4 bg-zinc-900 rounded w-16 ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;