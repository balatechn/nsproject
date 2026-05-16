import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format = 'MMM DD, YYYY') {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeTime(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const statusColors: Record<string, string> = {
  BACKLOG: 'bg-gray-100 text-gray-600',
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-600',
  IN_REVIEW: 'bg-purple-100 text-purple-600',
  DONE: 'bg-green-100 text-green-600',
  CANCELLED: 'bg-red-100 text-red-600',
  PLANNING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

export const projectStatusColors: Record<string, string> = {
  PLANNING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};
