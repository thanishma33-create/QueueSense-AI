import React from 'react';
import Card from '../ui/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function PeakHoursChart({ data = [] }) {
  return (
    <Card className="space-y-4" padding="md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            Hourly Patient Inflow vs Consultations Completed
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compares newly registered patients against throughput across consultation counters
          </p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                `${value} patients`,
                name === 'patientsArrived' ? 'New Registrations' : 'Patients Completed'
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(val) => (val === 'patientsArrived' ? 'Arrived / Registered' : 'Consultations Served')}
            />
            <Bar dataKey="patientsArrived" fill="#0284c7" radius={[4, 4, 0, 0]} name="patientsArrived" />
            <Bar dataKey="patientsServed" fill="#10b981" radius={[4, 4, 0, 0]} name="patientsServed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
