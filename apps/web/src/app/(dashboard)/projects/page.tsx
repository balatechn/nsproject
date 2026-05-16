'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, LayoutGrid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { cn, formatDate, getInitials, projectStatusColors } from '@/lib/utils';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  progress?: number;
  _count?: { tasks: number; members: number };
  members?: { user: { id: string; firstName: string; lastName: string; avatar?: string } }[];
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: () =>
      api.get('/projects', { params: { search, limit: 50 } }).then((r) => r.data),
  });

  const projects: Project[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm">{data?.total ?? 0} projects total</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode('grid')}
            className={cn(viewMode === 'grid' && 'bg-accent')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setViewMode('list')}
            className={cn(viewMode === 'list' && 'bg-accent')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm">Create your first project to get started</p>
        </div>
      ) : (
        <motion.div
          className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} listView={viewMode === 'list'} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function ProjectCard({ project, listView }: { project: Project; listView: boolean }) {
  const statusClass = projectStatusColors[project.status] ?? 'bg-gray-100 text-gray-700';
  const taskCount = project._count?.tasks ?? 0;
  const memberCount = project._count?.members ?? 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className={cn(
        'hover:shadow-md transition-all cursor-pointer group',
        listView && 'flex flex-row items-center',
      )}>
        <div
          className={cn('h-1 rounded-t-xl', !listView && 'block', listView && 'hidden')}
          style={{ backgroundColor: project.color || '#22c55e' }}
        />
        <CardHeader className={cn('pb-2', listView && 'flex-1 flex-row items-center gap-4 py-3')}>
          {listView && (
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: project.color || '#22c55e' }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <Badge className={cn('text-xs shrink-0', statusClass)}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            {project.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>
        </CardHeader>

        {!listView && (
          <>
            <CardContent className="pb-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{project.progress ?? 0}%</span>
                </div>
                <Progress value={project.progress ?? 0} className="h-1.5" />
              </div>
              {project.endDate && (
                <p className="text-xs text-muted-foreground">Due: {formatDate(project.endDate)}</p>
              )}
            </CardContent>

            <CardFooter className="pt-0 flex items-center justify-between">
              <div className="flex -space-x-2">
                {project.members?.slice(0, 4).map((m) => (
                  <Avatar key={m.user.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={m.user.avatar} />
                    <AvatarFallback className="text-[9px]">
                      {getInitials(m.user.firstName, m.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {memberCount > 4 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] text-muted-foreground">
                    +{memberCount - 4}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{taskCount} tasks</span>
            </CardFooter>
          </>
        )}

        {listView && (
          <div className="flex items-center gap-6 pr-6 shrink-0">
            <span className="text-xs text-muted-foreground">{taskCount} tasks</span>
            {project.endDate && (
              <span className="text-xs text-muted-foreground">{formatDate(project.endDate)}</span>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}
