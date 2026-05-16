import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [users, projects, tasks, leads] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.task.count(),
      this.prisma.lead.count(),
    ]);
    return { users, projects, tasks, leads };
  }

  async getAuditLogs(query: any) {
    const { page = 1, limit = 50 } = query;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count(),
    ]);
    return { data, total, page, limit };
  }

  async getRoles() {
    return this.prisma.role.findMany({ include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } } });
  }

  async getSettings() {
    return this.prisma.systemSetting.findMany();
  }

  async updateSetting(key: string, value: any) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async suspendUser(id: string) {
    return this.prisma.user.update({ where: { id }, data: { status: 'SUSPENDED' } });
  }

  async activateUser(id: string) {
    return this.prisma.user.update({ where: { id }, data: { status: 'ACTIVE' } });
  }
}
