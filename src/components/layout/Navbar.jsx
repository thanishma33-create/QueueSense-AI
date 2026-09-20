import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { useSettings } from '../../context/SettingsContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Radio,
  RefreshCw,
  Play,
  Square,
  Moon,
  Sun,
  Menu,
  Eye,
  ShieldCheck,
  ChevronDown,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar({ onOpenMobileMenu }) {
  const { currentUser, switchRole, availableRoles } = useAuth();
  const {
    departments,
    selectedDeptId,
    setSelectedDeptId,
    refreshData,
    isLoading,
    isSimulating,
    setIsSimulating,
    lastRefreshed,
    isWsConnected,
    backendAvailable,
  } = useQueue();
  const { settings, toggleDarkMode, toggleHighContrast, updateSettings } = useSettings();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-medical-cyan flex items-center justify-center text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black font-display tracking-tight text-slate-900 dark:text-white">
                  QueueSense<span className="text-brand-600 dark:text-brand-400">AI</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-800">
                  OPD v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] xl:max-w-[320px]">
                {settings.hospitalName}
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Department Switcher & Live Polling Status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative flex items-center">
            <label htmlFor="dept-selector" className="sr-only">Select Department</label>
            <select
              id="dept-selector"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="all">🏥 All OPD Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code}) — {dept.activeCounters} Counters
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Connection Status Badge */}
          {backendAvailable ? (
            isWsConnected ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium" title="Live WebSocket stream active on ws://localhost:8000/ws">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden lg:inline">Live WebSockets</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 text-xs font-medium" title="REST API Connected on http://localhost:8000">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="hidden lg:inline">REST Synced</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-medium" title="Demo Offline Fallback Mode">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="hidden lg:inline">Demo Fallback</span>
            </div>
          )}
        </div>

        {/* Right: Actions, Simulation Toggle, Role Switcher, Quick Displays */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Simulation Mode Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            title={isSimulating ? 'Pause Live Patient Flow Simulation' : 'Start Live Flow Simulation'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isSimulating
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/30 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isSimulating ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isSimulating ? 'Simulating Arrivals' : 'Simulate Flow'}</span>
          </button>

          {/* Refresh Data Button */}
          <button
            onClick={() => refreshData(false)}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            title={`Last refreshed: ${lastRefreshed.toLocaleTimeString()}`}
            aria-label="Refresh Queue Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          {/* TV Display Link Button */}
          <Link
            to="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
            title="Open Waiting-Hall TV Display in new tab"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>TV Display</span>
          </Link>

          {/* Role Switcher Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <div className="text-left hidden md:block">
                <p className="leading-tight font-bold">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{currentUser?.roleName}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 hidden group-hover:block z-50 animate-fade-in">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Demo Perspective
              </div>
              {availableRoles.map((roleObj) => (
                <button
                  key={roleObj.id}
                  onClick={() => switchRole(roleObj.role)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    currentUser?.role === roleObj.role ? 'font-bold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{roleObj.name}</p>
                    <p className="text-[10px] text-slate-500 font-normal">{roleObj.roleName}</p>
                  </div>
                  {currentUser?.role === roleObj.role && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </button>
              ))}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-3">
                <Link
                  to="/login"
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold block py-1"
                >
                  Switch Account / Exit Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            title="Toggle Light / Dark theme"
            aria-label="Toggle Theme"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
