import React from 'react';
import Card from '../ui/Card';
import { Users, Building, Timer, TrendingUp, Stethoscope, Info } from 'lucide-react';

export default function ExplainableFactors({ factors = [] }) {
  const iconMap = {
    'Waiting Patients Ahead': Users,
    'Active Service Counters': Building,
    'Average Consult Duration': Timer,
    'Peak Rush Adjustment': TrendingUp,
    'Specialty Case Complexity': Stethoscope,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Explainable AI Feature Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transparent mathematical parameters determining the current waiting estimate
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          5 Core Factors
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {factors.map((factor, index) => {
          const Icon = iconMap[factor.title] || Info;
          return (
            <Card key={index} className="space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all" padding="sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {factor.title}
                    </h4>
                    <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300">
                      {factor.weight}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Observed Value:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{factor.value}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Impact on Wait:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{factor.impact}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {factor.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
