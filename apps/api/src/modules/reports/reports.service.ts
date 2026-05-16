import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectReport(projectId?: string) {
    const where: any = {};
    if (projectId) where.id = projectId;
    const projects = await this.prisma.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true, members: true } },
        owner: { select: { firstName: true, lastName: true } },
      },
    });
    const enriched = await Promise.all(projects.map(async (p) => {
      const [done, inProgress, overdue] = await Promise.all([
        this.prisma.task.count({ where: { projectId: p.id, status: 'DONE' } }),
        this.prisma.task.count({ where: { projectId: p.id, status: 'IN_PROGRESS' } }),
        this.prisma.task.count({ where: { projectId: p.id, status: { notIn: ['DONE', 'CANCELLED'] }, dueDate: { lt: new Date() } } }),
      ]);
      return { ...p, doneTasks: done, inProgressTasks: inProgress, overdueTasks: overdue };
    }));
    return enriched;
  }

  async getResourceReport() {
    return this.prisma.resource.findMany({
      include: {
        allocations: { where: { endDate: { gte: new Date() } } },
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async getTimeReport(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return this.prisma.timeEntry.groupBy({
      by: ['userId'],
      where,
      _sum: { duration: true },
    });
  }
}
