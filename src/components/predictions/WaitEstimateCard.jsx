import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Clock, ShieldCheck, HelpCircle, Activity, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export default function WaitEstimateCard({ estimateData }) {
  if (!estimateData) return null;

  const {
    estimatedWaitMinutes,
    minWaitMinutes,
    maxWaitMinutes,
    displayRange,
    congestionLevel,
    congestionBadge,
    operationalAdvice,
    confidenceScore,
    modelStatus,
    lastUpdated,
    waitingCount,
    activeCounters,
  } = estimateData;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white via-teal-50/20 to-sky-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 border-2 border-brand-500/20 shadow-lg" padding="lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-800 font-bold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              QueueSense Transparent Wait Model
            </span>
            <Badge variant={congestionLevel === 'High' ? 'warning' : 'success'} size="sm">
              {congestionBadge}
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
            Expected OPD Consultation Waiting Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {operationalAdvice}
          </p>

          {/* Ethical Disclaimer */}
          <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>
              Estimates are mathematical approximations for operational planning. Emergency cases receive direct clinical triage.
            </span>
          </div>
        </div>

        {/* Right Big Estimated Range Card */}
        <div className="w-full md:w-auto p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2 shrink-0 md:min-w-[220px]">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Estimated Duration Range
          </p>
          <div className="text-3xl sm:text-4xl font-extrabold font-display text-brand-700 dark:text-brand-400 tracking-tight">
            {displayRange}
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Model Confidence:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{confidenceScore}%</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Updated: {lastUpdated}
          </div>
        </div>
      </div>
    </Card>
  );
}
