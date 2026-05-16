import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(userId: string) {
    const now = new Date();
    const startOfMonth = dayjs().startOf('month').toDate();

    const [
      totalProjects,
      activeProjects,
      myTasks,
      overdueTasksCount,
      completedTasksThisMonth,
      pendingApprovals,
    ] = await Promise.all([
      this.prisma.project.count({
        where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      }),
      this.prisma.project.count({
        where: {
          status: 'ACTIVE',
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      }),
      this.prisma.task.count({
        where: { assigneeId: userId, status: { notIn: ['DONE', 'CANCELLED'] } },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: { notIn: ['DONE', 'CANCELLED'] },
          dueDate: { lt: now },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'DONE',
          completedAt: { gte: startOfMonth },
        },
      }),
      this.prisma.workflowApproval.count({
        where: { approverId: userId, status: 'PENDING' },
      }),
    ]);

    return {
      totalProjects,
      activeProjects,
      myTasks,
      overdueTasksCount,
      completedTasksThisMonth,
      pendingApprovals,
    };
  }

  async getRecentActivity(userId: string, limit?: number) {
    const take = Number(limit) > 0 ? Number(limit) : 20;
    return this.prisma.activityLog.findMany({
      where: { userId },
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async getUpcomingTasks(userId: string, days?: number) {
    const d = Number(days) > 0 ? Number(days) : 7;
    const dueBy = dayjs().add(d, 'day').toDate();
    return this.prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { notIn: ['DONE', 'CANCELLED'] },
        dueDate: { lte: dueBy, gte: new Date() },
      },
      include: {
        project: { select: { id: true, name: true, code: true, color: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });
  }

  async getProjectProgress(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        _count: { select: { tasks: true } },
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });

    const progress = await Promise.all(
      projects.map(async (p) => {
        const doneTasks = await this.prisma.task.count({
          where: { projectId: p.id, status: 'DONE' },
        });
        return {
          ...p,
          taskProgress: p._count.tasks > 0 ? Math.round((doneTasks / p._count.tasks) * 100) : 0,
        };
      }),
    );

    return progress;
  }

  async getTaskStatusChart(userId: string) {
    const result = await this.prisma.task.groupBy({
      by: ['status'],
      where: {
        OR: [{ assigneeId: userId }, { creatorId: userId }],
      },
      _count: { id: true },
    });

    return result.map((r) => ({ status: r.status, count: r._count.id }));
  }

  async getTeamUtilization() {
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true, avatar: true, jobTitle: true },
      take: 20,
    });

    const utilization = await Promise.all(
      users.map(async (u) => {
        const activeTasks = await this.prisma.task.count({
          where: { assigneeId: u.id, status: 'IN_PROGRESS' },
        });
        const totalTasks = await this.prisma.task.count({
          where: { assigneeId: u.id, status: { notIn: ['DONE', 'CANCELLED'] } },
        });
        return { ...u, activeTasks, totalTasks };
      }),
    );

    return utilization;
  }

  async getMonthlyTaskCompletion(userId: string) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = dayjs().subtract(i, 'month').startOf('month').toDate();
      const end = dayjs().subtract(i, 'month').endOf('month').toDate();
      const count = await this.prisma.task.count({
        where: { completedAt: { gte: start, lte: end } },
      });
      months.push({ month: dayjs().subtract(i, 'month').format('MMM YYYY'), count });
    }
    return months;
  }
}
