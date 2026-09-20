import React, { useState, useEffect } from 'react';
import { ShieldCheck, Volume2, VolumeX, Maximize, Minimize, Moon, Sun } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function TVDisplayHeader({ onToggleFullscreen, isFullscreen, isMuted, onToggleMute }) {
  const { settings, toggleHighContrast } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Hospital Seal & Title */}
      <div className="flex items-center gap-3.5 text-center md:text-left">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-medical-cyan flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black font-display tracking-tight text-white uppercase">
            {settings.hospitalName}
          </h1>
          <p className="text-xs sm:text-sm font-malayalam text-brand-300 font-semibold">
            {settings.hospitalMalayalam}
          </p>
        </div>
      </div>

      {/* Center: Malayalam/English Notice Subtitle */}
      <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-slate-300">
          Please proceed when your token is called • നിങ്ങളുടെ ടോക്കൺ വിളിക്കുമ്പോൾ കൗണ്ടറിലേക്ക് വരിക
        </span>
      </div>

      {/* Right: Live Clock & Screen Controls */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="text-right px-4 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <p className="text-lg sm:text-xl font-mono font-bold text-white tracking-wider">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2.5 rounded-xl border transition-colors ${
            isMuted
              ? 'bg-rose-950/60 border-rose-800 text-rose-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-brand-400'
          }`}
          title={isMuted ? 'Voice Announcements Muted' : 'Voice Announcements Active'}
          aria-label="Toggle Voice Mute"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter TV Fullscreen Mode'}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
