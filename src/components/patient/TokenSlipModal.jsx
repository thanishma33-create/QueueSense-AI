import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Printer, Download, Share2, CheckCircle2, ShieldCheck, Heart, QrCode } from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { useSettings } from '../../context/SettingsContext';

export default function TokenSlipModal({ token, isOpen, onClose }) {
  const { departments } = useQueue();
  const { settings } = useSettings();

  if (!token) return null;

  const dept = departments.find(d => d.id === token.departmentId) || {
    name: 'General Medicine',
    malayalamName: 'ജനറൽ മെഡിസിൻ',
    location: 'Ground Floor, Block A'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OPD Patient Token Ticket"
      subtitle="Official Queue Slip — Please retain until consultation is completed"
      size="sm"
    >
      <div className="space-y-4">
        {/* Printable Ticket Area */}
        <div id="printable-token-slip" className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-teal-50/40 border-2 border-dashed border-teal-300 dark:border-teal-700/60 text-center space-y-3 dark:from-slate-800 dark:to-slate-800/80">
          {/* Hospital Seal & Header */}
          <div className="border-b border-teal-200/60 dark:border-slate-700 pb-3">
            <div className="flex items-center justify-center gap-1.5 text-brand-700 dark:text-brand-300 font-extrabold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>{settings.hospitalName}</span>
            </div>
            <p className="text-[11px] font-malayalam text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
              {settings.hospitalMalayalam}
            </p>
            <p className="text-[10px] text-slate-400">Govt. Health Mission • OPD Token Slip</p>
          </div>

          {/* Token Big Display */}
          <div className="py-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Token Number / ടോക്കൺ നമ്പർ
            </p>
            <div className="text-4xl sm:text-5xl font-black font-display text-navy-900 dark:text-white tracking-tight my-1">
              {token.tokenNumber}
            </div>
            {token.isPriority && (
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-200">
                ⚡ Staff Verified Priority / മുൻഗണന
              </div>
            )}
          </div>

          {/* Department & Location */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-teal-100 dark:border-slate-700 text-xs text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{dept.name}</span>
            </div>
            <div className="flex justify-between font-malayalam">
              <span className="text-slate-400">വിഭാഗം:</span>
              <span className="font-bold text-brand-700 dark:text-brand-300">{dept.malayalamName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Location:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{dept.location || 'Block A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Issued At:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{token.registrationTime}</span>
            </div>
          </div>

          {/* QR Code Placeholder & Instructions */}
          <div className="pt-2 flex items-center justify-between gap-3 text-left">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <QrCode className="w-12 h-12" />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight space-y-1">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                • Please watch the TV display in the waiting area.
              </p>
              <p className="font-malayalam">
                • കാത്തിരിപ്പ് സ്ഥലത്തെ ടിവി ഡിസ്‌പ്ലേ ശ്രദ്ധിക്കുക.
              </p>
              <p className="text-[9px] text-slate-400">
                Scan QR or SMS status sent to registered phone.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Ticket
          </Button>
        </div>
      </div>
    </Modal>
  );
}
