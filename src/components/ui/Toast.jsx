import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export default function ToastContainer() {
  const { toasts, removeToast } = useQueue();

  if (!toasts || toasts.length === 0) return null;

  const iconMap = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
  };

  const styleMap = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/90 dark:border-amber-800 dark:text-amber-100',
    error: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-100',
    info: 'bg-slate-900 border-slate-800 text-white dark:bg-navy-900 dark:border-slate-700',
  };

  const iconColorMap = {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-rose-600 dark:text-rose-400',
    info: 'text-brand-400',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 opacity-100',
              styleMap[toast.type] || styleMap.info
            )}
            role="alert"
          >
            <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', iconColorMap[toast.type])} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs opacity-90 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
