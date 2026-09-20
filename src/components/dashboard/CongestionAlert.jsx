import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function CongestionAlert({
  waitingCount = 0,
  estimatedWaitMinutes = 15,
  activeCounters = 3,
  congestionLevel = 'Low',
  operationalAdvice = 'Flow is optimal.',
  departmentName = 'General Medicine',
}) {
  const isHigh = congestionLevel === 'High' || waitingCount > 12;
  const isModerate = congestionLevel === 'Moderate' || (waitingCount > 6 && waitingCount <= 12);

  const config = isHigh
    ? {
        bg: 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80',
        text: 'text-amber-900 dark:text-amber-100',
        subtext: 'text-amber-700 dark:text-amber-300',
        icon: AlertCircle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        badge: 'Elevated OPD Waiting Load',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
      }
    : isModerate
    ? {
        bg: 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800/80',
        text: 'text-sky-900 dark:text-sky-100',
        subtext: 'text-sky-700 dark:text-sky-300',
        icon: TrendingUp,
        iconColor: 'text-sky-600 dark:text-sky-400',
        badge: 'Moderate Patient Inflow',
        badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
      }
    : {
        bg: 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80',
        text: 'text-emerald-900 dark:text-emerald-100',
        subtext: 'text-emerald-700 dark:text-emerald-300',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        badge: 'Optimal Patient Flow',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
      };

  const IconComponent = config.icon;

  return (
    <div
      className={clsx(
        'p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
        config.bg
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className={clsx('p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm shrink-0', config.iconColor)}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={clsx('text-sm font-bold', config.text)}>
              {departmentName} Queue Status
            </h4>
            <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-md', config.badgeBg)}>
              {config.badge}
            </span>
          </div>
          <p className={clsx('text-xs mt-1 leading-relaxed max-w-2xl', config.subtext)}>
            {operationalAdvice}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/40">
        <div className="text-right">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Estimated Waiting</p>
          <p className={clsx('text-base sm:text-lg font-bold font-display', config.text)}>
            ~{estimatedWaitMinutes} mins
          </p>
        </div>

        <Link
          to="/predictions"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold shadow-sm hover:shadow transition-all text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
        >
          <span>Explain Wait AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
