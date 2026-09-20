import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import {
  LayoutDashboard,
  UserPlus,
  Tv,
  BrainCircuit,
  BarChart3,
  ShieldAlert,
  Settings,
  Sparkles,
  HeartHandshake,
  Volume2,
} from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const { currentUser, isReception, isDoctor, isAdmin } = useAuth();
  const { priorityFlags, tokens } = useQueue();

  const pendingPriorityCount = priorityFlags.filter(f => f.status === 'Pending').length;
  const waitingTokenCount = tokens.filter(t => t.status === 'Waiting').length;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Main Dashboard',
      malayalam: 'ഡാഷ്‌ബോർഡ്',
      icon: LayoutDashboard,
      badge: waitingTokenCount > 0 ? `${waitingTokenCount} waiting` : null,
      badgeVariant: 'warning',
    },
    {
      to: '/register',
      label: 'Register Patient',
      malayalam: 'രജിസ്ട്രേഷൻ',
      icon: UserPlus,
      roleRequired: null,
    },
    {
      to: '/display',
      label: 'Patient TV Display',
      malayalam: 'ക്യൂ ഡിസ്‌പ്ലേ (TV)',
      icon: Tv,
      highlight: true,
      badge: 'Bilingual',
      badgeVariant: 'teal',
    },
    {
      to: '/predictions',
      label: 'Wait-Time AI Engine',
      malayalam: 'കാത്തിരിപ്പ് സമയം',
      icon: BrainCircuit,
      badge: 'Explainable',
      badgeVariant: 'info',
    },
    {
      to: '/analytics',
      label: 'Flow & Congestion',
      malayalam: 'അനലിറ്റിക്സ്',
      icon: BarChart3,
      roleRequired: null,
    },
    {
      to: '/priority-review',
      label: 'Clinical Priority Review',
      malayalam: 'ക്ലിനിക്കൽ മുൻഗണന',
      icon: ShieldAlert,
      badge: pendingPriorityCount > 0 ? `${pendingPriorityCount} Pending` : null,
      badgeVariant: 'danger',
    },
    {
      to: '/settings',
      label: 'Settings & Counters',
      malayalam: 'ക്രമീകരണങ്ങൾ',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none min-h-[calc(100vh-4rem)]">
      {/* OPD Wing Context Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-ping" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white tracking-wide truncate">Govt. General Hospital</p>
            <p className="text-[10px] text-brand-300 truncate">OPD Queue Management Hub</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Hospital Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  item.highlight && !isActive && 'text-brand-300 bg-brand-950/30 border border-brand-800/40'
                )
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <div className="truncate">
                  <span className="block leading-tight">{item.label}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-200 block font-normal leading-tight font-malayalam">
                    {item.malayalam}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2',
                    item.badgeVariant === 'danger' && 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
                    item.badgeVariant === 'warning' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                    item.badgeVariant === 'teal' && 'bg-brand-500/20 text-brand-300 border border-brand-500/30',
                    item.badgeVariant === 'info' && 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Safety & Compliance Card */}
      <div className="p-3 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 text-brand-300 font-bold mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Govt. Health Mission</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Elderly-first priority queueing & bilingual Malayalam voice guidance active.
          </p>
        </div>
      </div>
    </aside>
  );
}
