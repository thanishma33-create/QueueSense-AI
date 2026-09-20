import React from 'react';
import PriorityReviewTable from '../components/priority/PriorityReviewTable';
import { ShieldAlert, UserCheck, HeartHandshake } from 'lucide-react';

export default function PriorityReviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Clinical Priority Review &amp; Audit Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
              Staff Only
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorized clinical review desk for expedited medical attention, elderly support, and triage logs
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 text-xs font-semibold">
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <span>Medical Officer Governance Active</span>
        </div>
      </div>

      {/* Priority Review Table Component */}
      <PriorityReviewTable />
    </div>
  );
}
