import React from 'react';
import clsx from 'clsx';

export default function Card({
  children,
  className = '',
  hoverEffect = false,
  padding = 'md', // none, sm, md, lg
  onClick,
  ...props
}) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-200',
        hoverEffect && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
