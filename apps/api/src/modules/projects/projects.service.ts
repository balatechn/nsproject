import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const code = dto.code || `PRJ-${Date.now()}`;
    const data: any = { ...dto, code, ownerId: userId };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.project.create({
      data,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });
  }

  async findAll(query: ProjectQueryDto, userId: string) {
    const { page = 1, limit = 20, status, priority, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.AND = [{ OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] }];
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          _count: { select: { tasks: true, members: true, milestones: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data: projects, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, jobTitle: true } } },
        },
        milestones: { orderBy: { dueDate: 'asc' } },
        _count: { select: { tasks: true, attachments: true } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    const isMember = project.ownerId === userId ||
      project.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied');

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: dto,
      include: { owner: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);
    if (project.ownerId !== userId) throw new ForbiddenException('Only owner can delete project');
    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted' };
  }

  async addMember(projectId: string, memberId: string, role: string, userId: string) {
    await this.findOne(projectId, userId);
    return this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: memberId } },
      update: { role },
      create: { projectId, userId: memberId, role },
    });
  }

  async getStats(projectId: string, userId: string) {
    await this.findOne(projectId, userId);
    const [taskStats, timeStats] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['status'],
        where: { projectId },
        _count: { id: true },
      }),
      this.prisma.timeEntry.aggregate({
        where: { projectId },
        _sum: { duration: true },
      }),
    ]);

    return { taskStats, totalHours: timeStats._sum.duration ?? 0 };
  }

  async getGanttData(projectId: string, userId: string) {
    await this.findOne(projectId, userId);
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      select: {
        id: true, title: true, status: true, priority: true,
        startDate: true, dueDate: true, progress: true,
        dependencies: true, parentId: true, assigneeId: true,
        assignee: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return tasks;
  }
}
