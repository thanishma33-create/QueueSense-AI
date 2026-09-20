import React from 'react';
import Card from '../ui/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function WaitTimeChart({ data = [] }) {
  return (
    <Card className="space-y-4" padding="md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            Average Waiting Time Trend (Today)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hourly average patient wait duration in minutes across all active OPD departments
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-brand-500" />
            Wait Minutes
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-amber-400" />
            Congestion Index
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} unit="m" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                name === 'avgWaitMinutes' ? `${value} mins` : `${value} / 100`,
                name === 'avgWaitMinutes' ? 'Avg Waiting Time' : 'Congestion Index'
              ]}
            />
            <Area
              type="monotone"
              dataKey="avgWaitMinutes"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#waitGrad)"
              name="avgWaitMinutes"
            />
            <Area
              type="monotone"
              dataKey="congestionIndex"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#congGrad)"
              name="congestionIndex"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
