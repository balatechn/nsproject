import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, creatorId: string) {
    return this.prisma.task.create({
      data: { ...dto, creatorId },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { subtasks: true, comments: true, attachments: true } },
      },
    });
  }

  async findAll(query: TaskQueryDto, userId: string) {
    const { page = 1, limit = 50, status, priority, projectId, assigneeId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (!projectId) {
      where.OR = [{ assigneeId: userId }, { creatorId: userId }];
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
          milestone: { select: { id: true, name: true } },
          _count: { select: { subtasks: true, comments: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data: tasks, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
        comments: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
        milestone: true,
        timeEntries: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);
    return this.prisma.task.update({ where: { id }, data: dto, include: {
      assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
  }

  async addComment(taskId: string, userId: string, content: string) {
    return this.prisma.taskComment.create({
      data: { taskId, userId, content },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async getKanbanBoard(projectId: string) {
    const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const tasks = await this.prisma.task.findMany({
      where: { projectId, parentId: null },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { subtasks: true, comments: true } },
      },
      orderBy: { order: 'asc' },
    });

    return statuses.reduce((board: any, status) => {
      board[status] = tasks.filter((t) => t.status === status);
      return board;
    }, {});
  }

  async bulkUpdateStatus(ids: string[], status: string) {
    await this.prisma.task.updateMany({ where: { id: { in: ids } }, data: { status: status as any } });
    return { message: `${ids.length} tasks updated` };
  }
}
