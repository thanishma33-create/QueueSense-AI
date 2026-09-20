import React from 'react';
import { Clock, ArrowRight, CheckCircle2, Sparkles, User } from 'lucide-react';
import Badge from '../ui/Badge';

export default function UpcomingTokens({ tokens = [], avgServiceMinutes = 8 }) {
  const waitingTokens = tokens.filter(t => t.status === 'Waiting').slice(0, 5);

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between text-white">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Next In Line / അടുത്ത ടോക്കണുകൾ
              </h3>
              <p className="text-[11px] text-slate-400">
                Estimated wait times are approximate
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {waitingTokens.length} in queue
          </span>
        </div>

        {waitingTokens.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="text-sm font-semibold">No more patients waiting</p>
            <p className="text-xs text-slate-600 font-malayalam mt-0.5">കാത്തിരിക്കുന്ന രോഗികൾ ഇല്ല</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitingTokens.map((tok, idx) => {
              const estimatedWait = Math.round((idx + 1) * avgServiceMinutes);
              return (
                <div
                  key={tok.id}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 text-xs font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-display text-white tracking-wide">
                          {tok.tokenNumber}
                        </span>
                        {tok.isPriority && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                            ⚡ Priority
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {tok.visitType} • Registered {tok.registrationTime}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-medium">Est. Wait</p>
                    <p className="text-xs font-bold text-amber-300">
                      ~{estimatedWait} mins
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info on Public Display Safety */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
        🔒 Patient privacy protected • No clinical information is broadcast on public monitors.
      </div>
    </div>
  );
}
