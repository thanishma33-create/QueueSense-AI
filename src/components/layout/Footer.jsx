import React from 'react';
import { ShieldCheck, Info, Heart, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* Hackathon Theme & Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-brand-700 dark:text-brand-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            Hackathon Prototype • Tech for a Better Tomorrow
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            QueueSense AI — Intelligent Hospital Waiting-Time & Patient Flow System
          </span>
        </div>

        {/* Ethical AI & Clinical Governance Notice */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>
            Clinical prioritization is strictly determined by authorized medical professionals. AI provides queue flow estimates only.
          </span>
        </div>
      </div>
    </footer>
  );
}
