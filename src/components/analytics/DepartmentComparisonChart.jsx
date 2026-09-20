import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function DepartmentComparisonChart({ data = [] }) {
  return (
    <Card className="space-y-4" padding="md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            OPD Department Capacity & Waiting Time Overview
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Objective operational metrics comparing specialty patient load and active counters
          </p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="m" />
            <YAxis
              type="category"
              dataKey="department"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              width={110}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value, name, props) => [
                `${value} mins (${props.payload.activeCounters} active counters, ${props.payload.totalTokens} tokens)`,
                'Average Waiting Time'
              ]}
            />
            <Bar dataKey="avgWaitMin" fill="#0d9488" radius={[0, 6, 6, 0]} name="Avg Wait (Minutes)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        {data.map((dept, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-slate-900 dark:text-white truncate">{dept.department}</p>
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
              <span>{dept.activeCounters} Counters</span>
              <span className="font-semibold text-brand-700 dark:text-brand-300">~{dept.avgWaitMin}m</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
