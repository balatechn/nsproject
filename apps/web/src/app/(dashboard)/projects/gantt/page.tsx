'use client';

export const dynamic = 'force-dynamic';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { cn, projectStatusColors } from '@/lib/utils';

interface GanttTask {
  id: string;
  title: string;
  startDate?: string;
  dueDate?: string;
  status: string;
  priority: string;
  project?: { id: string; name: string; color?: string };
}

interface GanttProject {
  id: string;
  name: string;
  color?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  tasks: GanttTask[];
}

const DAY_WIDTH = 30;
const ROW_HEIGHT = 40;

export default function GanttPage() {
  const [zoom, setZoom] = useState(1);
  const [offsetDays, setOffsetDays] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: projects, isLoading } = useQuery<GanttProject[]>({
    queryKey: ['projects-gantt'],
    queryFn: () => api.get('/projects/gantt').then((r) => r.data),
  });

  const today = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 14 + offsetDays);
    return d;
  }, [today, offsetDays]);

  const totalDays = Math.round(60 / zoom);
  const dayWidth = DAY_WIDTH * zoom;

  const dayHeaders = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startDate, totalDays]);

  function dayOffset(dateStr?: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gantt Chart</h1>
          <p className="text-muted-foreground text-sm">Project timeline view</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setOffsetDays((d) => d - 7)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOffsetDays(0)}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => setOffsetDays((d) => d + 7)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(z * 1.5, 3))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(z / 1.5, 0.5))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gantt body */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="flex">
          {/* Left panel - project/task names */}
          <div className="w-64 shrink-0 border-r bg-muted/20">
            <div className="h-10 border-b flex items-center px-4 text-xs font-semibold text-muted-foreground uppercase">
              Project / Task
            </div>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-2 border-b"><Skeleton className="h-5" /></div>
                ))
              : projects?.flatMap((proj) => [
                  <div
                    key={proj.id}
                    className="flex items-center gap-2 px-4 h-10 border-b bg-muted/40"
                    style={{ borderLeft: `3px solid ${proj.color || '#22c55e'}` }}
                  >
                    <span className="text-sm font-semibold truncate">{proj.name}</span>
                    <Badge className={cn('text-xs ml-auto', projectStatusColors[proj.status])}>
                      {proj.status}
                    </Badge>
                  </div>,
                  ...proj.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 pl-8 pr-4 h-10 border-b hover:bg-muted/30"
                    >
                      <span className="text-xs truncate text-muted-foreground">{task.title}</span>
                    </div>
                  )),
                ])}
          </div>

          {/* Right panel - timeline */}
          <div className="flex-1 overflow-x-auto" ref={containerRef}>
            {/* Day header */}
            <div className="flex h-10 border-b sticky top-0 bg-background z-10">
              {dayHeaders.map((day, i) => {
                const isToday =
                  day.toDateString() === today.toDateString();
                const isMonthStart = day.getDate() === 1;
                return (
                  <div
                    key={i}
                    className={cn(
                      'shrink-0 flex flex-col items-center justify-center text-center border-r',
                      'text-xs text-muted-foreground',
                      isToday && 'bg-primary/10 font-bold text-primary',
                      isMonthStart && 'bg-muted/40',
                    )}
                    style={{ width: dayWidth }}
                  >
                    {isMonthStart && (
                      <span className="text-[9px] font-medium">
                        {day.toLocaleString('default', { month: 'short' })}
                      </span>
                    )}
                    <span>{day.getDate()}</span>
                  </div>
                );
              })}
            </div>

            {/* Task rows */}
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-10 border-b flex items-center px-2">
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              : projects?.flatMap((proj) => {
                  const projStart = dayOffset(proj.startDate ?? proj.tasks[0]?.startDate);
                  const projEnd = dayOffset(proj.endDate ?? proj.tasks[proj.tasks.length - 1]?.dueDate);
                  return [
                    // Project row
                    <div key={proj.id} className="relative h-10 border-b bg-muted/20">
                      {projStart != null && projEnd != null && projEnd >= 0 && projStart < totalDays && (
                        <div
                          className="absolute top-2 rounded-md h-6"
                          style={{
                            left: Math.max(0, projStart) * dayWidth,
                            width: (projEnd - Math.max(0, projStart) + 1) * dayWidth - 4,
                            backgroundColor: proj.color || '#22c55e',
                            opacity: 0.7,
                          }}
                        />
                      )}
                      {/* Today line */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-red-400/60 z-10"
                        style={{ left: (14 - offsetDays) * dayWidth }}
                      />
                    </div>,
                    // Task rows
                    ...proj.tasks.map((task) => {
                      const ts = dayOffset(task.startDate);
                      const te = dayOffset(task.dueDate);
                      const priorityColor =
                        task.priority === 'URGENT' ? '#ef4444'
                        : task.priority === 'HIGH' ? '#f97316'
                        : task.priority === 'MEDIUM' ? '#3b82f6'
                        : '#94a3b8';
                      return (
                        <div key={task.id} className="relative h-10 border-b hover:bg-muted/20">
                          {ts != null && te != null && te >= 0 && ts < totalDays && (
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              className="absolute top-2.5 rounded h-5 flex items-center px-2"
                              style={{
                                left: Math.max(0, ts) * dayWidth + 2,
                                width: Math.max(dayWidth, (te - Math.max(0, ts) + 1) * dayWidth - 4),
                                backgroundColor: priorityColor,
                                opacity: task.status === 'DONE' ? 0.5 : 0.8,
                              }}
                            >
                              <span className="text-white text-[10px] truncate">{task.title}</span>
                            </motion.div>
                          )}
                          <div
                            className="absolute top-0 bottom-0 w-px bg-red-400/40"
                            style={{ left: (14 - offsetDays) * dayWidth }}
                          />
                        </div>
                      );
                    }),
                  ];
                })}
          </div>
        </div>
      </div>
    </div>
  );
}
