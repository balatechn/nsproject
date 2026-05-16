'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, BarChart3,
  Users, Workflow, Bell, MessageSquare, CreditCard,
  Settings, Shield, Calendar, Clock, TrendingUp,
  Building2, ChevronDown, X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Projects', href: '/projects', icon: FolderKanban,
    children: [
      { label: 'All Projects', href: '/projects', icon: FolderKanban },
      { label: 'Gantt Chart', href: '/projects/gantt', icon: BarChart3 },
      { label: 'Timeline', href: '/projects/timeline', icon: Calendar },
    ],
  },
  {
    label: 'Tasks', href: '/tasks', icon: CheckSquare,
    children: [
      { label: 'My Tasks', href: '/tasks', icon: CheckSquare },
      { label: 'Kanban Board', href: '/tasks/kanban', icon: LayoutDashboard },
      { label: 'Calendar', href: '/tasks/calendar', icon: Calendar },
    ],
  },
  { label: 'Resources', href: '/resources', icon: Users },
  { label: 'Team Planner', href: '/team-planner', icon: Clock },
  {
    label: 'CRM', href: '/crm', icon: TrendingUp,
    children: [
      { label: 'Pipeline', href: '/crm', icon: TrendingUp },
      { label: 'Leads', href: '/crm/leads', icon: CreditCard },
      { label: 'Customers', href: '/crm/customers', icon: Building2 },
    ],
  },
  { label: 'Workflows', href: '/workflows', icon: Workflow },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Notifications', href: '/notifications', icon: Bell, badge: 3 },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Admin', href: '/admin', icon: Shield },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((i) => i !== href) : [...prev, href],
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-gray-900 dark:bg-gray-950 text-white',
          'transition-all duration-300 ease-in-out flex flex-col',
          'lg:translate-x-0',
          collapsed ? 'lg:w-16' : 'lg:w-64',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  NS
                </div>
                <span className="font-bold text-lg tracking-tight">NsProject</span>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm mx-auto">
              NS
            </div>
          )}
          <button onClick={onMobileClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={isActive}
              isExpanded={expandedItems.includes(item.href)}
              onToggleExpand={() => toggleExpanded(item.href)}
            />
          ))}
        </nav>

        {/* Bottom user info */}
        {!collapsed && (
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">System Admin</p>
                <p className="text-xs text-gray-400 truncate">admin@nsproject.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function NavItemComponent({
  item, collapsed, isActive, isExpanded, onToggleExpand,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const active = isActive(item.href);
  const Icon = item.icon;

  if (item.children && !collapsed) {
    return (
      <div>
        <button
          onClick={onToggleExpand}
          className={cn(
            'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg mb-0.5',
            'text-sm transition-colors',
            active
              ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white',
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </div>
          <ChevronDown
            className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-4 pl-3 border-l border-gray-700 overflow-hidden"
            >
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5',
                    'text-xs transition-colors',
                    isActive(child.href)
                      ? 'text-green-400 bg-green-900/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                  )}
                >
                  <child.icon className="h-3.5 w-3.5" />
                  {child.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5',
        'text-sm transition-colors relative group',
        active
          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white',
        collapsed && 'justify-center',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {item.badge}
        </span>
      )}
      {collapsed && item.badge && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
          {item.badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </Link>
  );
}


