import React, { useState, useEffect } from 'react';
import TVDisplayHeader from '../components/display/TVDisplayHeader';
import ServingTokenCard from '../components/display/ServingTokenCard';
import UpcomingTokens from '../components/display/UpcomingTokens';
import { useQueue } from '../context/QueueContext';
import { useSettings } from '../context/SettingsContext';
import { announceToken, playHospitalChime } from '../services/voiceService';
import { Volume2, VolumeX, Maximize, Clock, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

export default function PatientDisplayPage() {
  const {
    tokens,
    departments,
    selectedDeptId,
    setSelectedDeptId,
    triggerVoiceAnnouncement,
    isSpeaking,
    latestCalledToken,
  } = useQueue();
  const { settings } = useSettings();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeDeptIndex, setActiveDeptIndex] = useState(0);

  // Auto-rotate departments every 15s if viewing "all"
  useEffect(() => {
    if (selectedDeptId !== 'all' || departments.length === 0) return;
    const interval = setInterval(() => {
      setActiveDeptIndex(prev => (prev + 1) % departments.length);
    }, settings.tvDisplayRotateIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [selectedDeptId, departments, settings.tvDisplayRotateIntervalSec]);

  const currentDept = selectedDeptId === 'all'
    ? (departments[activeDeptIndex] || departments[0] || { id: 'gen-med', name: 'General Medicine', code: 'GM' })
    : (departments.find(d => d.id === selectedDeptId) || departments[0]);

  const deptTokens = tokens.filter(t => t.departmentId === currentDept.id);
  
  // Find current active token (Called or In Service)
  const currentlyServingToken = deptTokens.find(t => t.status === 'Called') ||
                                deptTokens.find(t => t.status === 'In Service') ||
                                latestCalledToken;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request rejected:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleRepeatVoice = () => {
    if (currentlyServingToken && !isMuted) {
      announceToken({
        tokenNumber: currentlyServingToken.tokenNumber,
        counterNumber: 1,
        departmentName: currentDept.name,
        language: settings.defaultLanguage,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        volume: settings.speechVolume,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500">
      {/* Top TV Screen Header */}
      <TVDisplayHeader
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* Main Waiting Room Display Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-center">
        {/* Department Switcher Pills for TV Operator */}
        <div className="flex items-center justify-between gap-4 pb-6 overflow-x-auto">
          <div className="flex items-center gap-2">
            {departments.map((dept, idx) => {
              const isActive = (selectedDeptId === 'all' && idx === activeDeptIndex) || selectedDeptId === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-2 ring-brand-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span>{dept.name}</span>
                  <span className="font-malayalam opacity-80 text-xs">({dept.malayalamName})</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSelectedDeptId('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedDeptId === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Auto-Cycle Departments (15s)
          </button>
        </div>

        {/* Display Grid: Currently Serving (Left) & Upcoming (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Currently Serving Token (2 Columns) */}
          <div className="lg:col-span-2">
            <ServingTokenCard
              token={currentlyServingToken}
              counterNumber={1}
              department={currentDept}
              onRepeatVoice={handleRepeatVoice}
              isSpeaking={isSpeaking}
            />
          </div>

          {/* Next in Line Tokens (1 Column) */}
          <div className="lg:col-span-1">
            <UpcomingTokens
              tokens={deptTokens}
              avgServiceMinutes={currentDept.avgServiceTimeMinutes || 8}
            />
          </div>
        </div>

        {/* Multilingual Subtitle Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Audio Chime &amp; Bilingual Voice Announcement Active
              </p>
              <p className="text-xs font-malayalam text-brand-300">
                ശ്രദ്ധിക്കുക: നിങ്ങളുടെ ടോക്കൺ നമ്പർ വിളിക്കുമ്പോൾ ഡോക്ടറുടെ കൗണ്ടറിലേക്ക് വരിക.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Govt. Health Mission OPD Wing</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 bg-slate-950 border-t border-slate-800/80 text-center text-xs text-slate-500">
        QueueSense AI • Waiting Room Public TV Display Mode • Fullscreen &amp; Voice Enabled
      </footer>
    </div>
  );
}
