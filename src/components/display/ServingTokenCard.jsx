import React from 'react';
import { Volume2, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { getAnnouncementCaptions } from '../../services/voiceService';

export default function ServingTokenCard({
  token,
  counterNumber = 1,
  department,
  onRepeatVoice,
  isSpeaking,
}) {
  if (!token) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border-2 border-slate-800 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <UserCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-300 font-display">
          Counter Ready / കൗണ്ടർ തയ്യാറാണ്
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Awaiting next token call from consultation room.
        </p>
      </div>
    );
  }

  const deptName = department?.name || 'General Medicine';
  const deptMalayalam = department?.malayalamName || 'ജനറൽ മെഡിസിൻ';
  const captions = getAnnouncementCaptions(token.tokenNumber, counterNumber, deptName);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 border-2 border-brand-500/50 shadow-2xl p-6 sm:p-10 flex flex-col justify-between text-white">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-medical-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Now Serving & Counter */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-500"></span>
          </span>
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-brand-400">
              Now Serving / ഇപ്പോൾ വിളിക്കുന്നത്
            </span>
            <p className="text-xs text-slate-400 font-malayalam">
              {deptMalayalam} ({deptName})
            </p>
          </div>
        </div>

        {/* Counter Number Badge */}
        <div className="px-5 py-2 rounded-2xl bg-brand-600 text-white font-extrabold font-display text-base sm:text-xl shadow-lg shadow-brand-600/30">
          Counter {counterNumber}
        </div>
      </div>

      {/* Main Massive Token Number Display */}
      <div className="py-8 text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Token Number
        </p>
        <div className="text-6xl sm:text-8xl md:text-9xl font-black font-display tracking-tight text-white drop-shadow-md select-all">
          {token.tokenNumber}
        </div>

        {token.isPriority && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold mt-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Staff Priority / മുൻഗണനാ ടോക്കൺ</span>
          </div>
        )}
      </div>

      {/* Bottom: Malayalam/English Subtitle & Voice Button */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1">
          <p className="text-sm font-bold text-slate-200">
            {captions.english}
          </p>
          <p className="text-xs font-malayalam text-brand-300 font-semibold">
            {captions.malayalam}
          </p>
        </div>

        <button
          onClick={onRepeatVoice}
          disabled={isSpeaking}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
            isSpeaking
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
          title="Repeat English & Malayalam Voice Announcement"
        >
          <Volume2 className="w-4 h-4 text-brand-400" />
          <span>{isSpeaking ? 'Announcing...' : 'Repeat Audio'}</span>
        </button>
      </div>
    </div>
  );
}
