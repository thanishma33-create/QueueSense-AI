import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useSettings } from '../context/SettingsContext';
import { useQueue } from '../context/QueueContext';
import { playHospitalChime, announceToken } from '../services/voiceService';
import {
  Settings as SettingsIcon,
  Volume2,
  Globe,
  Building,
  ShieldCheck,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Tv,
  Bell,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, toggleDarkMode, toggleHighContrast } = useSettings();
  const { departments, updateDepartmentCounters, resetDemo, addToast } = useQueue();

  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || 'gen-med');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const currentDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  const handleToggleCounterStatus = (counterId) => {
    const updatedCounters = currentDept.counters.map(c => {
      if (c.id === counterId) {
        const nextStatus = c.status === 'offline' ? 'available' : 'offline';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    updateDepartmentCounters(currentDept.id, updatedCounters);
  };

  const handleTestAudio = () => {
    playHospitalChime();
    setTimeout(() => {
      announceToken({
        tokenNumber: 'GM-104',
        counterNumber: 1,
        departmentName: 'General Medicine',
        language: settings.defaultLanguage,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        volume: settings.speechVolume,
      });
    }, 400);
  };

  const handleConfirmReset = async () => {
    await resetDemo();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            System &amp; Counter Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage hospital departments, multilingual voice synthesizer, TV display, and demo state
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={() => setIsResetConfirmOpen(true)}
        >
          Reset Demo Data
        </Button>
      </div>

      {/* 1. Hospital & Department Branding */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Building className="w-5 h-5 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            Hospital Identification &amp; Header Branding
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Hospital Official Name (English)
            </label>
            <input
              type="text"
              value={settings.hospitalName}
              onChange={(e) => updateSettings({ hospitalName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 font-malayalam">
              ഹോസ്പിറ്റൽ പേര് (Malayalam Display Name)
            </label>
            <input
              type="text"
              value={settings.hospitalMalayalam}
              onChange={(e) => updateSettings({ hospitalMalayalam: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-malayalam text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </Card>

      {/* 2. Department Counter Staffing Configuration */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Counter Staffing &amp; Doctor Assignment
            </h3>
          </div>

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold py-1.5 px-3 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          {currentDept.counters.map((ctr) => {
            const isOnline = ctr.status !== 'offline';
            return (
              <div
                key={ctr.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-display ${
                    isOnline
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {ctr.number}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Counter {ctr.number} — {ctr.doctor}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Status: <span className={isOnline ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>{isOnline ? 'Online (Accepting Tokens)' : 'Offline'}</span>
                    </p>
                  </div>
                </div>

                <Button
                  variant={isOnline ? 'outline' : 'teal'}
                  size="sm"
                  onClick={() => handleToggleCounterStatus(ctr.id)}
                >
                  {isOnline ? 'Set Offline' : 'Activate Counter'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Voice Announcement & Audio Settings */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Bilingual Voice Synthesizer &amp; Procedural Chime
            </h3>
          </div>

          <Button variant="secondary" size="sm" icon={Volume2} onClick={handleTestAudio}>
            Test Audio Announcement
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Language Selection */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Broadcast Language Preference
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            >
              <option value="bilingual">Bilingual Dual (English + Malayalam)</option>
              <option value="ml">Malayalam Only (മലയാളം മാത്രം)</option>
              <option value="en">English Only</option>
            </select>
          </div>

          {/* Speech Speed */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Speech Rate (Clear Delivery)
              </label>
              <span className="text-brand-600 font-bold">{settings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-brand-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-announce-toggle"
              checked={settings.autoAnnounceOnCall}
              onChange={(e) => updateSettings({ autoAnnounceOnCall: e.target.checked })}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="auto-announce-toggle" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Automatically broadcast voice announcement when a token is called
            </label>
          </div>
        </div>
      </Card>

      {/* 4. Privacy & Prototype Compliance */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            Patient Privacy &amp; Data Safeguards
          </h3>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p><span className="font-semibold">Public Display Isolation:</span> The patient TV display shows only anonymous token numbers (e.g. GM-104) and counter numbers without any medical diagnoses or contact info.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p><span className="font-semibold">Clinical Priority Governance:</span> Priority queues require authorized healthcare staff justification notes and maintain an immutable audit trail.</p>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Reset Demo Dataset?
            </h3>
            <p className="text-xs text-slate-500">
              This will restore all departments, sample queue tokens, and clinical priority records to their default hackathon demo state.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReset}>
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
