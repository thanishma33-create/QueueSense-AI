import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md', // sm, md, lg, xl, full
  showClose = true,
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={clsx(
          'relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden transform transition-all',
          sizeStyles[size],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
