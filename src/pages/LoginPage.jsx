import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  Activity,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Building,
  ArrowRight,
  Sparkles,
  Lock,
  HeartHandshake,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login, switchRole } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [selectedRoleKey, setSelectedRoleKey] = useState('reception');
  const [email, setEmail] = useState('reception@queuesense.demo');
  const [password, setPassword] = useState('Reception@123');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleCardSelect = (roleKey) => {
    setSelectedRoleKey(roleKey);
    if (roleKey === 'reception') {
      setEmail('reception@queuesense.demo');
      setPassword('Reception@123');
    } else if (roleKey === 'doctor') {
      setEmail('doctor@queuesense.demo');
      setPassword('Doctor@123');
    } else if (roleKey === 'admin') {
      setEmail('admin@queuesense.demo');
      setPassword('Admin@123');
    }
    setErrorMessage('');
  };

  const handleQuickLogin = async (roleKey) => {
    setIsLoading(true);
    setErrorMessage('');
    const targetKey = roleKey || selectedRoleKey;
    try {
      const result = await switchRole(targetKey);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.error || 'Failed to authenticate.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error. Please verify backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter your hospital email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to sign in. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleCards = [
    {
      role: 'reception',
      email: 'reception@queuesense.demo',
      title: 'Reception & Triage Staff',
      malayalam: 'റിസപ്ഷൻ & ട്രയേജ് സ്റ്റാഫ്',
      icon: UserCheck,
      desc: 'Register incoming walk-in and referral patients, issue token slips, assist elderly patients, and record verified priority flags.',
      badge: 'Front Desk',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
    },
    {
      role: 'doctor',
      email: 'doctor@queuesense.demo',
      title: 'Doctor / Counter Staff',
      malayalam: 'ഡോക്ടർ / കൗണ്ടർ സ്റ്റാഫ്',
      icon: Stethoscope,
      desc: 'Call next token to consultation room, manage in-service status, complete visits, and trigger Malayalam/English voice announcements.',
      badge: 'Consultation Room',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    },
    {
      role: 'admin',
      email: 'admin@queuesense.demo',
      title: 'Hospital Administrator / RMO',
      malayalam: 'ഹോസ്പിറ്റൽ അഡ്മിനിസ്ട്രേറ്റർ',
      icon: Building,
      desc: 'Monitor whole-hospital OPD congestion, explainable AI wait models, counter capacity planning, and flow analytics.',
      badge: 'Administration',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-medical-blue/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-medical-cyan flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black font-display tracking-tight text-white">
                QueueSense<span className="text-brand-400">AI</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-800">
                Full-Stack Integration
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {settings.hospitalName}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Tech for a Better Tomorrow</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 text-brand-300 border border-brand-800 text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Accessible Government Outpatient Flow Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white tracking-tight">
            Intelligent OPD Waiting-Time &amp; Patient Flow
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Select an authorized staff role below to obtain a live JWT token or enter custom hospital staff credentials.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Perspective Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleCards.map((card) => {
            const isSelected = selectedRoleKey === card.role;
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                onClick={() => handleRoleCardSelect(card.role)}
                className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/95 border-brand-500 ring-2 ring-brand-500/30 shadow-xl'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-brand-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-display mb-0.5">
                    {card.title}
                  </h3>
                  <p className="text-xs font-malayalam text-brand-300 font-semibold mb-2">
                    {card.malayalam}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {card.desc}
                  </p>
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    {card.email}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-400">
                    {isSelected ? 'Selected Role' : 'Select Role'}
                  </span>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(card.role);
                    }}
                    className="p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition-transform hover:scale-105 disabled:opacity-50"
                    title={`Authenticate as ${card.title}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credentials Form / Quick Access Card */}
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">
                FastAPI JWT Authentication
              </h4>
              <p className="text-xs text-slate-400">
                Connects directly to <code className="text-brand-300 font-mono">POST /api/auth/login</code> on localhost:8000
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsManualMode(!isManualMode)}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              {isManualMode ? 'Switch to Quick Role Cards' : 'Enter Custom Email & Password'}
            </button>
          </div>

          {isManualMode ? (
            <form onSubmit={handleFormLogin} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Hospital Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. doctor@queuesense.demo"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password123"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  variant="teal"
                  size="md"
                  loading={isLoading}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Sign In with Credentials
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Ready to launch dashboard as <strong className="text-white">{roleCards.find(r => r.role === selectedRoleKey)?.title}</strong> ({email}).
              </div>

              <Button
                variant="teal"
                size="lg"
                loading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => handleQuickLogin()}
              >
                Sign In &amp; Launch Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Notice */}
      <div className="max-w-4xl w-full mx-auto pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 text-center space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Healthcare Governance &amp; Security: JWT authentication with role-based access control. Clinical decisions remain strictly human-controlled.</span>
        </p>
        <p>Govt. General Hospital • Outpatient Department (OPD) System</p>
      </div>
    </div>
  );
}
