import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Sliders, ArrowRight, TrendingDown, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { simulateWhatIf } from '../../services/estimationEngine';

export default function WhatIfSimulator({
  currentWaitingCount = 8,
  currentCounters = 3,
  currentAvgService = 8.0,
}) {
  const [simCounters, setSimCounters] = useState(currentCounters + 1);
  const [simWaiting, setSimWaiting] = useState(currentWaitingCount);
  const [simServiceTime, setSimServiceTime] = useState(currentAvgService);

  const simulation = useMemo(() => {
    return simulateWhatIf({
      baseWaitingCount: simWaiting,
      currentCounters: currentCounters,
      simulatedCounters: simCounters,
      baseAvgServiceTime: currentAvgService,
      simulatedAvgServiceTime: simServiceTime,
    });
  }, [simCounters, simWaiting, simServiceTime, currentCounters, currentAvgService]);

  const handleReset = () => {
    setSimCounters(currentCounters);
    setSimWaiting(currentWaitingCount);
    setSimServiceTime(currentAvgService);
  };

  return (
    <Card className="space-y-6" padding="lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Hospital Flow "What-If" Capacity Sandbox
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Model the operational impact of staffing adjustments or patient surges before taking action
          </p>
        </div>

        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleReset}>
          Reset Baseline
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Sliders Area */}
        <div className="space-y-5">
          {/* Active Counters Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Active Consultation Counters</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold text-sm">
                {simCounters} Counters
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={simCounters}
              onChange={(e) => setSimCounters(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 (Severe Bottleneck)</span>
              <span>3 (Standard)</span>
              <span>6 (Full Wing)</span>
            </div>
          </div>

          {/* Waiting Queue Size */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Simulated Queue Depth</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold text-sm">
                {simWaiting} Patients
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={simWaiting}
              onChange={(e) => setSimWaiting(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 Patient</span>
              <span>15 Patients</span>
              <span>35 (Peak Surge)</span>
            </div>
          </div>

          {/* Average Consult Duration */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Avg. Service Duration / Consult</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold text-sm">
                {simServiceTime} mins
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="16"
              step="1"
              value={simServiceTime}
              onChange={(e) => setSimServiceTime(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>4m (Fast Review)</span>
              <span>8m (Standard)</span>
              <span>16m (Detailed Exam)</span>
            </div>
          </div>
        </div>

        {/* Outcome Comparison Box */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Projected Flow Outcome
            </span>
            <div className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
              simulation.isImprovement
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
            }`}>
              {simulation.isImprovement ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              <span>{Math.abs(simulation.percentageChange)}% {simulation.isImprovement ? 'Wait Reduction' : 'Increased Delay'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium">Baseline Estimate</p>
              <p className="text-2xl font-bold font-display text-slate-700 dark:text-slate-300 mt-0.5">
                ~{simulation.currentEstimated}m
              </p>
              <p className="text-[10px] text-slate-400">{currentCounters} counters online</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-brand-500 dark:border-brand-400">
              <p className="text-[11px] text-brand-600 dark:text-brand-400 font-bold">Simulated Estimate</p>
              <p className="text-2xl font-extrabold font-display text-brand-700 dark:text-brand-300 mt-0.5">
                ~{simulation.simulatedEstimated}m
              </p>
              <p className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">{simCounters} counters configured</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {simulation.isImprovement
              ? `Opening ${simCounters - currentCounters > 0 ? `${simCounters - currentCounters} additional counter(s)` : 'faster throughput'} reduces overall patient waiting duration by approximately ${Math.abs(simulation.differenceMinutes)} minutes per token.`
              : `Operating with fewer counters will increase waiting time by ${simulation.differenceMinutes} minutes, creating potential OPD hallway congestion.`}
          </p>
        </div>
      </div>
    </Card>
  );
}
