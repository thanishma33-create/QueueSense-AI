import React from 'react';
import clsx from 'clsx';

export default function LoadingState({
  rows = 4,
  message = 'Loading queue data...',
  className = '',
}) {
  return (
    <div className={clsx('space-y-4 py-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{message}</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="w-full h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}
