import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import {
  X,
  LayoutDashboard,
  UserPlus,
  Tv,
  BrainCircuit,
  BarChart3,
  ShieldAlert,
  Settings,
  Activity,
} from 'lucide-react';
import clsx from 'clsx';

export default function MobileDrawer({ isOpen, onClose }) {
  const { priorityFlags, tokens } = useQueue();

  if (!isOpen) return null;

  const navItems = [
    { to: '/dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { to: '/register', label: 'Register Patient', icon: UserPlus },
    { to: '/display', label: 'Patient TV Display', icon: Tv },
    { to: '/predictions', label: 'Wait-Time AI Engine', icon: BrainCircuit },
    { to: '/analytics', label: 'Flow & Congestion', icon: BarChart3 },
    { to: '/priority-review', label: 'Clinical Priority Review', icon: ShieldAlert },
    { to: '/settings', label: 'Settings & Counters', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-72 max-w-full bg-slate-900 text-white flex flex-col h-full z-10 shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold font-display">QueueSense AI</p>
              <p className="text-[10px] text-slate-400">Hospital Patient Flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
          Govt. General Hospital • OPD Hub
        </div>
      </div>
    </div>
  );
}
