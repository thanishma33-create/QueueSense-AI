import React from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
  Clock,
  User,
  ShieldAlert,
  Accessibility,
  Building,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { useQueue } from '../../context/QueueContext';

export default function TokenDetailModal({ token, isOpen, onClose, onPrintSlip }) {
  const { updateTokenStatus, triggerVoiceAnnouncement, departments } = useQueue();

  if (!token) return null;

  const dept = departments.find(d => d.id === token.departmentId) || { name: 'General OPD' };

  const handleStatusChange = async (newStatus) => {
    await updateTokenStatus(token.id, newStatus);
    onClose();
  };

  const calculateWaitTime = () => {
    if (!token.registrationTimestamp) return '15 mins';
    const diffMins = Math.max(1, Math.round((Date.now() - token.registrationTimestamp) / (60 * 1000)));
    return `${diffMins} mins`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Token Details: ${token.tokenNumber}`}
      subtitle={`Department: ${dept.name} (${token.departmentCode})`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold font-display text-navy-900 dark:text-white tracking-tight">
                {token.tokenNumber}
              </span>
              <Badge variant={token.status} size="lg">
                {token.status}
              </Badge>
              {token.isPriority && (
                <Badge variant="priority" size="lg">
                  Staff Verified Priority
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registered at {token.registrationTime} • Total waiting elapsed: <span className="font-semibold text-slate-700 dark:text-slate-300">{calculateWaitTime()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Volume2}
              onClick={() => triggerVoiceAnnouncement(token.tokenNumber, 1, dept.name)}
            >
              Announce Voice
            </Button>
            {onPrintSlip && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onPrintSlip(token);
                }}
              >
                Print Slip
              </Button>
            )}
          </div>
        </div>

        {/* Patient Profile & Intake Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-600" />
              Patient Registration Record
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Patient Identifier:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{token.patientRef}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Display Reference:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{token.anonymizedName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Age Bracket:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{token.ageGroup}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Visit Category:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{token.visitType}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-medical-cyan" />
              Counter & Service Flow
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Counter Served:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{token.counterServed || 'Not yet assigned'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Completed Time:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{token.completedAt || 'In progress'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Service Duration:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{token.serviceDurationMinutes ? `${token.serviceDurationMinutes} mins` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Accessibility & Special Assistance */}
        {token.accessibilityNeeds && token.accessibilityNeeds.length > 0 && (
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-1.5">
              <Accessibility className="w-4 h-4 text-blue-600" />
              Assisted Accessibility Requirements
            </h4>
            <div className="flex flex-wrap gap-2">
              {token.accessibilityNeeds.map((need, i) => (
                <span key={i} className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-800 font-medium text-blue-800 dark:text-blue-200">
                  ✓ {need}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Priority Audit Section */}
        {token.isPriority && (
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 text-xs space-y-2">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              Staff Clinical Priority & Audit Justification
            </h4>
            <div className="space-y-1 text-indigo-950 dark:text-indigo-200">
              <p><span className="font-semibold">Reason:</span> {token.priorityReason}</p>
              <p><span className="font-semibold">Authorized Verifier:</span> {token.priorityVerifiedBy}</p>
              {token.priorityStaffNote && (
                <p className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900 text-[11px] text-slate-700 dark:text-slate-300">
                  {token.priorityStaffNote}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {token.status === 'Waiting' && (
              <Button
                variant="teal"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleStatusChange('Called')}
              >
                Call to Counter
              </Button>
            )}

            {token.status === 'Called' && (
              <>
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => handleStatusChange('In Service')}
                >
                  Start Service
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('Skipped')}
                >
                  Skip Patient
                </Button>
              </>
            )}

            {token.status === 'In Service' && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleStatusChange('Completed')}
              >
                Mark Completed
              </Button>
            )}

            {(token.status === 'Skipped' || token.status === 'Cancelled') && (
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => handleStatusChange('Waiting')}
              >
                Recall to Queue
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
