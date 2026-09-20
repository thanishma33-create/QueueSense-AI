import React from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { History, ShieldCheck, UserCheck, Clock } from 'lucide-react';

export default function AuditTrailModal({ flag, isOpen, onClose }) {
  if (!flag) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clinical Audit Log: ${flag.tokenNumber}`}
      subtitle={`Patient: ${flag.patientRef} • Department: ${flag.departmentName}`}
      size="md"
    >
      <div className="space-y-4 text-xs">
        {/* Flag Summary Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{flag.reason}</p>
            <p className="text-[11px] text-slate-500">Initiated by {flag.reviewer} at {flag.timestamp}</p>
          </div>
          <Badge variant={flag.status === 'Confirmed' ? 'success' : 'warning'} size="sm">
            {flag.status}
          </Badge>
        </div>

        {/* Audit Timeline */}
        <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {(flag.auditLog || []).map((entry, idx) => (
            <div key={idx} className="relative space-y-1">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white dark:ring-slate-900" />
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  {entry.action}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {entry.time}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  {entry.note}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  <UserCheck className="w-3 h-3 text-brand-500" />
                  <span>Authorized Staff: {entry.user}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
