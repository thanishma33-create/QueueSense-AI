import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import AuditTrailModal from './AuditTrailModal';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  MessageSquarePlus,
  AlertTriangle,
  User,
} from 'lucide-react';

export default function PriorityReviewTable() {
  const { priorityFlags, updatePriorityFlag } = useQueue();
  const { currentUser } = useAuth();

  const [selectedFlagForAudit, setSelectedFlagForAudit] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [noteModalFlag, setNoteModalFlag] = useState(null);
  const [customNote, setCustomNote] = useState('');

  const filteredFlags = priorityFlags.filter(f => {
    if (filterStatus === 'all') return true;
    return f.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleConfirm = async (flag) => {
    await updatePriorityFlag(flag.id, {
      status: 'Confirmed',
      action: 'Priority Confirmed by Medical Officer',
      note: `Clinically validated by ${currentUser?.name || 'Authorized Staff'}. Token expedited to next available counter.`,
    });
  };

  const handleOverride = async (flag) => {
    await updatePriorityFlag(flag.id, {
      status: 'Overridden',
      action: 'Priority Flag Overridden / Reverted to Normal',
      note: `Clinical priority criteria not met upon review by ${currentUser?.name}. Reverted to standard sequential OPD queue.`,
    });
  };

  const handleAddNoteSubmit = async () => {
    if (!noteModalFlag || !customNote.trim()) return;
    await updatePriorityFlag(noteModalFlag.id, {
      action: 'Staff Clinical Note Added',
      note: customNote.trim(),
    });
    setNoteModalFlag(null);
    setCustomNote('');
  };

  return (
    <div className="space-y-4">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
            Authorized Healthcare Clinical Governance
          </h4>
          <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
            Medical prioritization is strictly determined by authorized clinical personnel. All triage flags, confirmations, and overrides are permanently recorded in the audit trail.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'pending', 'confirmed', 'overridden'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-navy-900 text-white dark:bg-brand-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {status} {status === 'pending' && `(${priorityFlags.filter(f => f.status === 'Pending').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden" padding="none">
        {filteredFlags.length === 0 ? (
          <EmptyState
            title="No Flagged Cases"
            description="No clinical priority flags found matching this status filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Token & Patient</th>
                  <th className="py-3.5 px-4 font-bold">Department</th>
                  <th className="py-3.5 px-4 font-bold">Clinical Reason / Notes</th>
                  <th className="py-3.5 px-4 font-bold">Initiated By</th>
                  <th className="py-3.5 px-4 font-bold">Review Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Token & Patient */}
                    <td className="py-3.5 px-4 font-bold">
                      <div>
                        <span className="text-sm font-extrabold font-display text-navy-900 dark:text-white">
                          {flag.tokenNumber}
                        </span>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {flag.patientRef} ({flag.ageGroup})
                        </p>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {flag.departmentName}
                    </td>

                    {/* Reason & Staff Note */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-300">
                          {flag.reason}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {flag.staffNote}
                        </p>
                      </div>
                    </td>

                    {/* Reviewer & Time */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{flag.reviewer}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{flag.timestamp}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          flag.status === 'Confirmed'
                            ? 'success'
                            : flag.status === 'Pending'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {flag.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {flag.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleConfirm(flag)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                              title="Confirm clinical priority"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleOverride(flag)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-rose-700 dark:bg-slate-800 dark:text-rose-400 font-semibold text-xs transition-colors"
                              title="Override & revert to standard queue"
                            >
                              Override
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setNoteModalFlag(flag);
                            setCustomNote('');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                          title="Add Doctor / Staff Note"
                        >
                          <MessageSquarePlus className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedFlagForAudit(flag)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                          title="View Full Audit History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Audit History Modal */}
      <AuditTrailModal
        flag={selectedFlagForAudit}
        isOpen={!!selectedFlagForAudit}
        onClose={() => setSelectedFlagForAudit(null)}
      />

      {/* Add Staff Note Simple Dialog */}
      {noteModalFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Append Clinical Audit Note
            </h3>
            <p className="text-xs text-slate-500">
              For token <span className="font-bold">{noteModalFlag.tokenNumber}</span> ({noteModalFlag.patientRef})
            </p>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Enter clinical justification or triage observation..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setNoteModalFlag(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddNoteSubmit}>
                Save Audit Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
