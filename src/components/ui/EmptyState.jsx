import React from 'react';
import Button from './Button';
import { Inbox } from 'lucide-react';
import clsx from 'clsx';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active items to display for the current selection.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
