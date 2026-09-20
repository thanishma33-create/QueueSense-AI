import React from 'react';
import clsx from 'clsx';
import Card from './Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subvalue,
  trend, // { value: '+12%', isPositive: true|false, isNeutral: boolean }
  icon: Icon,
  variant = 'teal', // teal, blue, amber, indigo, emerald, rose
  tooltip,
  className = '',
}) {
  const colorMap = {
    teal: {
      bgIcon: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300',
      borderAccent: 'border-l-4 border-l-brand-500',
      highlight: 'text-brand-700 dark:text-brand-300',
    },
    blue: {
      bgIcon: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
      borderAccent: 'border-l-4 border-l-sky-500',
      highlight: 'text-sky-700 dark:text-sky-300',
    },
    amber: {
      bgIcon: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      borderAccent: 'border-l-4 border-l-amber-500',
      highlight: 'text-amber-700 dark:text-amber-300',
    },
    indigo: {
      bgIcon: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      borderAccent: 'border-l-4 border-l-indigo-500',
      highlight: 'text-indigo-700 dark:text-indigo-300',
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      borderAccent: 'border-l-4 border-l-emerald-500',
      highlight: 'text-emerald-700 dark:text-emerald-300',
    },
    rose: {
      bgIcon: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      borderAccent: 'border-l-4 border-l-rose-500',
      highlight: 'text-rose-700 dark:text-rose-300',
    }
  };

  const scheme = colorMap[variant] || colorMap.teal;

  return (
    <Card className={clsx('relative overflow-hidden', scheme.borderAccent, className)} padding="md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              {value}
            </h3>
            {subvalue && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {subvalue}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={clsx('p-3 rounded-xl shrink-0', scheme.bgIcon)}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium">
            {trend.isNeutral ? (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            ) : trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span className={trend.isNeutral ? 'text-slate-500' : trend.isPositive ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-400 font-semibold'}>
              {trend.value}
            </span>
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
            {trend.label || 'vs yesterday'}
          </span>
        </div>
      )}
    </Card>
  );
}
