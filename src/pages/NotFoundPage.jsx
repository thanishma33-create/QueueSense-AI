import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Activity, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-sm">
        <Activity className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mb-2">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The requested outpatient department module or page could not be located in the QueueSense system.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="md" icon={Home}>
          Return to OPD Dashboard
        </Button>
      </Link>
    </div>
  );
}
