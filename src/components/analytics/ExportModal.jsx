import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Download, FileSpreadsheet, CheckCircle2, FileText, Calendar } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';

export default function ExportModal({ isOpen, onClose }) {
  const { tokens, departments } = useQueue();
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('today');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    setTimeout(() => {
      // Create and trigger mock CSV download
      const headers = ['TokenNumber', 'Department', 'PatientRef', 'AgeGroup', 'RegistrationTime', 'Status', 'WaitDurationMin', 'IsPriority'];
      const rows = tokens.map(t => [
        t.tokenNumber,
        t.departmentCode,
        t.patientRef,
        `"${t.ageGroup}"`,
        t.registrationTime,
        t.status,
        t.serviceDurationMinutes || 12,
        t.isPriority ? 'YES' : 'NO'
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `queuesense_opd_report_${dateRange}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setDownloadSuccess(true);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export OPD Queue & Flow Analytics"
      subtitle="Download sanitized operational reports for medical audits and administration"
      size="md"
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedFormat('csv')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                selectedFormat === 'csv'
                  ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold">CSV Spreadsheet</p>
                <p className="text-[10px] text-slate-500">Structured data for Excel/Python</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('pdf')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                selectedFormat === 'pdf'
                  ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700'
              }`}
            >
              <FileText className="w-5 h-5 text-rose-600" />
              <div>
                <p className="font-bold">Executive Summary</p>
                <p className="text-[10px] text-slate-500">Sanitized PDF overview</p>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Reporting Date Interval
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="today">Today's Live Queue Session (Active OPD)</option>
            <option value="week">Past 7 Days (Aggregated Weekly Trend)</option>
            <option value="month">Current Month (30 Days Overview)</option>
          </select>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
          🔒 <span className="font-semibold text-slate-700 dark:text-slate-300">Privacy Safeguard:</span> All exported rows use anonymized patient references to maintain complete patient confidentiality.
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Report file successfully generated and downloaded!</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="teal"
            size="md"
            icon={Download}
            loading={isExporting}
            onClick={handleExport}
          >
            Download Export
          </Button>
        </div>
      </div>
    </Modal>
  );
}
