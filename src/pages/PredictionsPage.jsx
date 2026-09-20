import React, { useState, useEffect } from 'react';
import WaitEstimateCard from '../components/predictions/WaitEstimateCard';
import ExplainableFactors from '../components/predictions/ExplainableFactors';
import WhatIfSimulator from '../components/predictions/WhatIfSimulator';
import Card from '../components/ui/Card';
import LoadingState from '../components/ui/LoadingState';
import { useQueue } from '../context/QueueContext';
import { apiService } from '../services/api';
import { BrainCircuit, RefreshCw, Layers, ShieldCheck, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PredictionsPage() {
  const { departments, selectedDeptId, setSelectedDeptId, tokens } = useQueue();
  const [estimateData, setEstimateData] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeDeptId = selectedDeptId === 'all' ? (departments[0]?.id || 'gen-med') : selectedDeptId;
  const currentDept = departments.find(d => d.id === activeDeptId) || departments[0] || { name: 'General Medicine', code: 'GM' };

  const loadEstimate = async () => {
    setLoading(true);
    try {
      const data = await apiService.getWaitingTimeEstimate(activeDeptId);
      setEstimateData(data);
    } catch (err) {
      console.error('Failed to calculate wait estimate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstimate();
  }, [activeDeptId, tokens]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Explainable Wait-Time Estimation AI
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
              Operational Model
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transparent mathematical heuristics calculating OPD queue duration with factor attribution
          </p>
        </div>

        {/* Department Switcher & Refresh */}
        <div className="flex items-center gap-2">
          <select
            value={activeDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadEstimate}
          >
            Re-evaluate
          </Button>
        </div>
      </div>

      {loading || !estimateData ? (
        <LoadingState message="Evaluating queue depth, active counters, and arrival surge parameters..." />
      ) : (
        <>
          {/* Main Wait Estimate Hero Card */}
          <WaitEstimateCard estimateData={estimateData} />

          {/* Mathematical Explainability Breakdown */}
          <ExplainableFactors factors={estimateData.explainableFactors} />

          {/* What-If Planning Sandbox */}
          <WhatIfSimulator
            currentWaitingCount={estimateData.waitingCount || 8}
            currentCounters={estimateData.activeCounters || 3}
            currentAvgService={currentDept?.avgServiceTimeMinutes || 8.0}
          />

          {/* Clinical Governance & Ethical Safeguards */}
          <Card className="bg-slate-50/80 dark:bg-slate-900/60 border-dashed" padding="md">
            <div className="flex items-start gap-3 text-xs">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Ethical AI &amp; Clinical Operational Governance Notice
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  QueueSense AI is engineered specifically for operational queue transparency and administrative resource planning. The algorithm does NOT make medical diagnoses, determine patient severity, or automate clinical triage. Emergency and acute clinical prioritization is strictly determined by authorized medical personnel.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
