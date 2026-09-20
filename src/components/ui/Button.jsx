import React from 'react';
import clsx from 'clsx';

export default function Button({
  children,
  variant = 'primary', // primary, secondary, outline, danger, ghost, teal, warm
  size = 'md', // sm, md, lg
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 font-medium',
    md: 'px-4 py-2 text-sm gap-2 font-semibold',
    lg: 'px-5 py-2.5 text-base gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-navy-900 hover:bg-navy-800 text-white shadow-sm focus:ring-navy-900 active:scale-[0.98]',
    teal: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm focus:ring-brand-500 active:scale-[0.98]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
    outline: 'border border-slate-300 hover:border-slate-400 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-brand-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 active:scale-[0.98]',
    warm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-amber-500 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400 dark:hover:bg-slate-800 dark:text-slate-300',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
