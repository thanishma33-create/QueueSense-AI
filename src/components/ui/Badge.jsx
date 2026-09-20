import React from 'react';
import clsx from 'clsx';
import { Clock, CheckCircle2, UserCheck, AlertCircle, XCircle, ArrowUpRight, Sparkles } from 'lucide-react';

export default function Badge({
  children,
  variant = 'default', // waiting, called, in-service, completed, skipped, cancelled, priority, success, warning, danger, info, neutral
  size = 'md', // sm, md, lg
  dot = false,
  icon = true,
  className = '',
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1 rounded-md',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5 rounded-lg',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2 rounded-xl',
  };

  const getVariantConfig = () => {
    switch (variant.toLowerCase()) {
      case 'waiting':
        return {
          style: 'bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
          dotColor: 'bg-amber-500',
          icon: Clock,
        };
      case 'called':
        return {
          style: 'bg-teal-50 text-teal-800 border border-teal-300 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-700 font-bold animate-pulse',
          dotColor: 'bg-teal-500 ring-4 ring-teal-200 dark:ring-teal-900',
          icon: Sparkles,
        };
      case 'in service':
      case 'in-service':
      case 'active':
        return {
          style: 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
          dotColor: 'bg-emerald-500',
          icon: UserCheck,
        };
      case 'completed':
        return {
          style: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dotColor: 'bg-slate-400',
          icon: CheckCircle2,
        };
      case 'skipped':
        return {
          style: 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
          dotColor: 'bg-rose-500',
          icon: AlertCircle,
        };
      case 'cancelled':
        return {
          style: 'bg-slate-100 text-slate-500 border border-slate-200 line-through dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
          dotColor: 'bg-slate-400',
          icon: XCircle,
        };
      case 'priority':
        return {
          style: 'bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
          dotColor: 'bg-indigo-600',
          icon: ArrowUpRight,
        };
      case 'success':
        return {
          style: 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
          dotColor: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'warning':
        return {
          style: 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
          dotColor: 'bg-amber-500',
          icon: AlertCircle,
        };
      case 'danger':
        return {
          style: 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
          dotColor: 'bg-rose-500',
          icon: XCircle,
        };
      default:
        return {
          style: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dotColor: 'bg-slate-400',
          icon: null,
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center select-none shrink-0',
        sizeStyles[size],
        config.style,
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
      )}
      {icon && IconComponent && !dot && (
        <IconComponent className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>{children}</span>
    </span>
  );
}
