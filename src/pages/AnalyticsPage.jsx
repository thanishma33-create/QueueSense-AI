import React, { useState, useEffect } from 'react';
import WaitTimeChart from '../components/analytics/WaitTimeChart';
import PeakHoursChart from '../components/analytics/PeakHoursChart';
import DepartmentComparisonChart from '../components/analytics/DepartmentComparisonChart';
import ExportModal from '../components/analytics/ExportModal';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import { apiService } from '../services/api';
import {
  BarChart3,
  Calendar,
  Download,
  Clock,
  UserCheck,
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiService.getAnalytics(timeRange);
        setAnalyticsData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* Header with Date Range & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Hospital Flow &amp; Congestion Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
              Department Insights
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical waiting metrics, rush hour patterns, and department capacity benchmarks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {['today', 'week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="teal"
            size="sm"
            icon={Download}
            onClick={() => setIsExportOpen(true)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {loading || !analyticsData ? (
        <LoadingState message="Aggregating department throughput and queue duration history..." />
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Consultations Completed"
              value={analyticsData.summary.totalServedToday}
              subvalue="patients"
              icon={UserCheck}
              variant="emerald"
              trend={{ value: '+14% vs avg', isPositive: true }}
            />

            <StatCard
              title="Avg. Consultation Wait"
              value={`${analyticsData.summary.avgWaitOverallMinutes}m`}
              subvalue="overall average"
              icon={Clock}
              variant="blue"
              trend={{ value: '-3.2m faster', isPositive: true }}
            />

            <StatCard
              title="Peak Congestion Period"
              value="10–11:30 AM"
              subvalue="morning rush"
              icon={AlertTriangle}
              variant="amber"
              trend={{ value: '68 arrivals/hr', isNeutral: true, label: 'Highest Load' }}
            />

            <StatCard
              title="Queue Retention Rate"
              value="96.8%"
              subvalue="completed tokens"
              icon={TrendingDown}
              variant="indigo"
              trend={{ value: '3.2% skip rate', isPositive: true }}
            />
          </div>

          {/* Hourly Waiting Trend & Hourly Inflow Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WaitTimeChart data={analyticsData.hourlyTrend} />
            <PeakHoursChart data={analyticsData.hourlyTrend} />
          </div>

          {/* Department Capacity Comparison */}
          <DepartmentComparisonChart data={analyticsData.departmentComparison} />
        </>
      )}

      {/* Export CSV / Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
