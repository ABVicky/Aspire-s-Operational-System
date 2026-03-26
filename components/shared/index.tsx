import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export function Badge({ children, className, variant = 'outline' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-premium',
        className
      )}
    >
      {children}
    </span>
  );
}

// Status badge
import { TaskStatus, ProjectStatus, Priority, PaymentStatus } from '@/lib/types';
import { STATUS_COLORS, PRIORITY_COLORS, PAYMENT_COLORS } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  'todo': 'Todo',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
  'planning': 'Planning',
  'active': 'Active',
  'on-hold': 'On Hold',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'pending': 'Pending',
  'partial': 'Partial',
  'paid': 'Paid',
  'overdue': 'Overdue',
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'urgent': 'Urgent',
};

interface StatusBadgeProps {
  status: TaskStatus | ProjectStatus;
}

interface PriorityBadgeProps {
  priority: Priority;
}

interface PaymentBadgeProps {
  status: PaymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={cn('bg-opacity-10 border-current font-bold', STATUS_COLORS[status])}>
      <span className="w-1 h-1 rounded-full bg-current mr-1.5 opacity-60" />
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge className={cn('bg-opacity-10 border-current font-bold', PRIORITY_COLORS[priority])}>
      {STATUS_LABELS[priority] ?? priority}
    </Badge>
  );
}

export function PaymentBadge({ status }: PaymentBadgeProps) {
  return (
    <Badge className={cn('bg-opacity-10 border-current font-bold', PAYMENT_COLORS[status])}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

// Skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-slate-200/60 dark:bg-slate-800/40 rounded-lg', className)} />
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-full flex items-end gap-4 p-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className={cn("w-full rounded-t-xl opacity-60", i % 2 === 0 ? "h-[60%]" : "h-[40%]")} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 w-full">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2 opacity-50" />
          </div>
          <Skeleton className="w-16 h-6 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

import { useState, useMemo } from 'react';

// Avatar
export function Avatar({ name, src, size = 'md', className }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const [imgError, setImgError] = useState(false);
  
  // Transform Google Drive links to direct direct links
  const processedSrc = useMemo(() => {
    if (!src) return src;
    if (src.includes('drive.google.com')) {
      // Handle /file/d/ID/view format
      const fileIdMatch = src.match(/\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/uc?id=${fileIdMatch[1]}`;
      }
      // Handle ?id=ID format
      const idParamMatch = src.match(/[?&]id=([^&]+)/);
      if (idParamMatch && idParamMatch[1]) {
        return `https://drive.google.com/uc?id=${idParamMatch[1]}`;
      }
    }
    // Handle `lh3.googleusercontent.com/.../d/<FILE_ID>` as well (older uploads).
    if (src.includes('googleusercontent.com')) {
      const fileIdMatch = src.match(/\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/uc?id=${fileIdMatch[1]}`;
      }
    }
    return src;
  }, [src]);

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = [
    'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20',
    'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20',
    'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
    'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs';

  return (
    <div className={cn('rounded-[1rem] flex items-center justify-center font-bold shrink-0 border shadow-sm transition-premium hover-premium overflow-hidden', color, sizeClass, className)}>
      {processedSrc && !imgError ? (
        <img 
          src={processedSrc} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={() => setImgError(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

// Empty state
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-white/5 mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white font-display tracking-tight mb-1.5">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs font-medium">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// Stat card
export function StatCard({ title, value, icon, trend, color = 'indigo', href }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'indigo' | 'green' | 'amber' | 'blue' | 'purple';
  href?: string;
}) {
  const iconColorMap = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100/50 dark:border-indigo-500/20',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-100/50 dark:border-green-500/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100/50 dark:border-amber-500/20',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-100/50 dark:border-blue-500/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-100/50 dark:border-purple-500/20',
  };

  const Content = (
    <>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className={cn('w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm shrink-0', iconColorMap[color])}>
          <div className="scale-75 md:scale-90">{icon}</div>
        </div>
        {trend && (
          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full border border-slate-100 dark:border-white/5 truncate text-right shrink-0">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5 opacity-80 truncate">{title}</p>
        <p className="text-xl md:text-2xl font-black text-slate-950 dark:text-white font-display tracking-tight tabular-nums truncate line-clamp-1 leading-none">{value}</p>
      </div>
    </>
  );

  const containerClass = cn(
    "bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 shadow-sm hover:shadow-hover transition-premium group relative overflow-hidden flex flex-col justify-between",
    href ? "active:scale-[0.98] hover-premium cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-500/30" : "cursor-default"
  );

  if (href) {
    return (
      <Link href={href} className={containerClass}>
        {Content}
      </Link>
    );
  }

  return (
    <div className={containerClass}>
      {Content}
    </div>
  );
}
// Modal
export * from './Modal';
export * from './ProjectModal';
export * from './ProfileModal';
export * from './LogoutModal';
export * from './ClientModal';
export * from './CalendarEventModal';
export * from './LeadModal';
export { default as MentionInput } from './MentionInput';
