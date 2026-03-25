import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0h 0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const STATUS_COLORS = {
  'todo': 'bg-slate-100 text-slate-700 border-slate-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'review': 'bg-amber-50 text-amber-700 border-amber-200',
  'done': 'bg-green-50 text-green-700 border-green-200',
  'planning': 'bg-purple-50 text-purple-700 border-purple-200',
  'active': 'bg-blue-50 text-blue-700 border-blue-200',
  'on-hold': 'bg-amber-50 text-amber-700 border-amber-200',
  'completed': 'bg-green-50 text-green-700 border-green-200',
  'cancelled': 'bg-red-50 text-red-700 border-red-200',
} as const;

export const PRIORITY_COLORS = {
  'low': 'bg-slate-50 text-slate-600 border-slate-200',
  'medium': 'bg-blue-50 text-blue-600 border-blue-200',
  'high': 'bg-orange-50 text-orange-600 border-orange-200',
  'urgent': 'bg-red-50 text-red-600 border-red-200',
} as const;

export const PAYMENT_COLORS = {
  'pending': 'bg-slate-50 text-slate-600 border-slate-200',
  'partial': 'bg-amber-50 text-amber-600 border-amber-200',
  'paid': 'bg-green-50 text-green-600 border-green-200',
  'overdue': 'bg-red-50 text-red-600 border-red-200',
} as const;
