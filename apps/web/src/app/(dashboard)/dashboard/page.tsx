'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FolderKanban, CheckSquare, AlertTriangle, Clock,
  TrendingUp, Users, Bell, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '@/lib/api';
import { formatRelativeTime, statusColors, getInitials } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const kpiIcons = {
  totalProjects: { icon: FolderKanban, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  activeProjects: { icon: Activity, color: 'from-green-500 to-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  myTasks: { icon: CheckSquare, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  overdueTasksCount: { icon: AlertTriangle, color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  completedTasksThisMonth: { icon: TrendingUp, color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  pendingApprovals: { icon: Clock, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
};

const PIE_COLORS = ['#64748b', '#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444'];

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => api.get('/dashboard/kpis').then((r) => r.data),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => api.get('/dashboard/activity').then((r) => r.data),
  });

  const { data: upcomingTasks } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: () => api.get('/dashboard/upcoming-tasks').then((r) => r.data),
  });

  const { data: projectProgress } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: () => api.get('/dashboard/project-progress').then((r) => r.data),
  });

  const { data: taskStatusChart } = useQuery({
    queryKey: ['dashboard-task-status'],
    queryFn: () => api.get('/dashboard/task-status-chart').then((r) => r.data),
  });

  const { data: monthlyCompletion } = useQuery({
    queryKey: ['dashboard-monthly'],
    queryFn: () => api.get('/dashboard/monthly-completion').then((r) => r.data),
  });

  const { data: teamUtilization } = useQuery({
    queryKey: ['dashboard-team'],
    queryFn: () => api.get('/dashboard/team-utilization').then((r) => r.data),
  });

  const kpiLabels: Record<string, string> = {
    totalProjects: 'Total Projects',
    activeProjects: 'Active Projects',
    myTasks: 'My Open Tasks',
    overdueTasksCount: 'Overdue Tasks',
    completedTasksThisMonth: 'Completed This Month',
    pendingApprovals: 'Pending Approvals',
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpisLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>
            ))
          : kpis && Object.entries(kpis).map(([key, value]) => {
              const meta = kpiIcons[key as keyof typeof kpiIcons];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <Card key={key} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className={`inline-flex p-2 rounded-lg ${meta.bg} mb-3`}>
                      <Icon className={`h-4 w-4 bg-gradient-to-br ${meta.color} bg-clip-text`} />
                    </div>
                    <div className="text-2xl font-bold">{value as number}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{kpiLabels[key]}</div>
                  </CardContent>
                </Card>
              );
            })}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly completion area chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Task Completion Trend</CardTitle>
              <CardDescription>Monthly completed tasks over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyCompletion ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyCompletion}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#colorCount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-[200px]" />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Task status pie chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tasks by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {taskStatusChart ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={taskStatusChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="count"
                      nameKey="status"
                    >
                      {taskStatusChart.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-[200px]" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project Progress */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Active Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {projectProgress
                ? projectProgress.slice(0, 6).map((p: any) => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-[160px]">{p.name}</span>
                        <span className="text-muted-foreground text-xs">{p.taskProgress}%</span>
                      </div>
                      <Progress value={p.taskProgress} className="h-1.5" />
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Due Soon</CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingTasks
                ? upcomingTasks.slice(0, 6).map((task: any) => (
                    <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div
                        className="h-2 w-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: task.project?.color || '#3b82f6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                      </div>
                      {task.dueDate && (
                        <span className="text-xs text-orange-500 whitespace-nowrap">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activityLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)
                : activity?.slice(0, 6).map((log: any) => (
                    <div key={log.id} className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={log.user?.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(log.user?.firstName || 'U', log.user?.lastName || 'S')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{log.user?.firstName}</span>{' '}
                        <span className="text-muted-foreground">{log.action}</span>{' '}
                        <span className="text-muted-foreground truncate">{log.entity}</span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Team Utilization */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Team Utilization
            </CardTitle>
            <CardDescription>Current workload across team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {teamUtilization
                ? teamUtilization.slice(0, 12).map((member: any) => (
                    <div key={member.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-green-400 to-blue-500 text-white">
                          {getInitials(member.firstName, member.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <p className="text-xs font-medium truncate max-w-full">{member.firstName}</p>
                        <p className="text-xs text-muted-foreground">{member.activeTasks} tasks</p>
                      </div>
                      <Badge variant={member.totalTasks > 10 ? 'destructive' : 'secondary'} className="text-[10px] px-1.5">
                        {member.totalTasks}
                      </Badge>
                    </div>
                  ))
                : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
