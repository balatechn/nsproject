'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FolderKanban, CheckSquare, BarChart3,
  Users, Workflow, Bell, MessageSquare, CreditCard,
  Settings, Shield, Calendar, Clock, TrendingUp,
  Building2, ChevronDown, Menu, X, Sun, Moon, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: { label: string; href: string; icon: React.ElementType }[];
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
  { label: 'Team', href: '/team-planner', icon: Clock },
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
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Admin', href: '/admin', icon: Shield },
];

export function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar: logo + search + actions */}
      <div className="flex h-14 items-center px-4 gap-4 border-b">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            NS
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">NsProject</span>
        </Link>

        {/* Search */}
        <div className="relative hidden md:flex items-center flex-1 max-w-md ml-4">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, tasks..."
            className="pl-9 h-9 bg-muted border-0"
          />
          <kbd className="absolute right-3 text-xs text-muted-foreground hidden lg:flex">⌘K</kbd>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-green-500 to-blue-600 text-white">
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : 'NS'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={logout}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Horizontal nav (desktop) */}
      <nav className="hidden lg:flex items-center px-4 h-12 gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          if (item.children) {
            return (
              <DropdownMenu key={item.href}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      active
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link href={child.href} className="flex items-center gap-2">
                        <child.icon className="h-4 w-4" />
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                active
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="lg:hidden border-t bg-background px-2 py-2 max-h-[70vh] overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                    active
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-7 border-l pl-3 my-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded"
                      >
                        <child.icon className="h-3.5 w-3.5" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}
    </header>
  );
}
