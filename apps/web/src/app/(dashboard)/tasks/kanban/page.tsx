'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { cn, formatDate, getInitials, priorityColors, statusColors } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  project?: { id: string; name: string; color?: string };
  assignees?: { user: { id: string; firstName: string; lastName: string; avatar?: string } }[];
}

const STATUS_COLUMNS = [
  { key: 'TODO', label: 'To Do', color: 'border-t-slate-400' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-blue-500' },
  { key: 'IN_REVIEW', label: 'In Review', color: 'border-t-purple-500' },
  { key: 'DONE', label: 'Done', color: 'border-t-green-500' },
];

export default function KanbanPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tasks-kanban', search],
    queryFn: () =>
      api.get('/tasks/board').then((r) => r.data),
  });

  const board: Record<string, Task[]> = data ?? {};

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground text-sm">Drag and drop tasks between columns</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
        <Button variant="outline" size="sm">
          <SortAsc className="h-4 w-4 mr-2" /> Sort
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {STATUS_COLUMNS.map((col) => {
          const tasks: Task[] = board[col.key] ?? [];
          return (
            <div key={col.key} className="flex-1 min-w-[280px] max-w-sm">
              <div className={cn('bg-muted/40 rounded-xl border-t-4 flex flex-col h-full', col.color)}>
                <div className="flex items-center justify-between p-3 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{col.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {isLoading ? '-' : tasks.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                      ))
                    : tasks.map((task) => (
                        <KanbanCard key={task.id} task={task} />
                      ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({ task }: { task: Task }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="cursor-pointer hover:shadow-md transition-shadow group">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
              {task.title}
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          {task.project && (
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.project.color || '#3b82f6' }}
              />
              <span className="text-xs text-muted-foreground">{task.project.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Badge className={cn('text-xs', priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</span>
            )}
          </div>
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1.5 pt-1">
              {task.assignees.slice(0, 3).map((a) => (
                <Avatar key={a.user.id} className="h-5 w-5 border-2 border-background">
                  <AvatarImage src={a.user.avatar} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(a.user.firstName, a.user.lastName)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
