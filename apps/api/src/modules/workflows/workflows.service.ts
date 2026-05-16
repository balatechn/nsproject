import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findAll(query: any, userId: string) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await Promise.all([
      this.prisma.workflow.findMany({
        skip: (page - 1) * limit, take: limit,
        include: { creator: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { runs: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.workflow.count(),
    ]);
    return { data, total, page, limit };
  }

  async create(dto: any, creatorId: string) {
    return this.prisma.workflow.create({ data: { ...dto, creatorId } });
  }

  async update(id: string, dto: any) {
    return this.prisma.workflow.update({ where: { id }, data: dto });
  }

  async execute(id: string, input: any) {
    const workflow = await this.prisma.workflow.findUniqueOrThrow({ where: { id } });
    const run = await this.prisma.workflowRun.create({
      data: { workflowId: id, status: 'RUNNING', input },
    });

    try {
      // Trigger n8n webhook if configured
      if (workflow.n8nWorkflowId) {
        const n8nUrl = this.config.get('N8N_URL');
        await axios.post(`${n8nUrl}/webhook/${workflow.n8nWorkflowId}`, input);
      }

      await this.prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: 'COMPLETED', finishedAt: new Date() },
      });
      await this.prisma.workflow.update({
        where: { id },
        data: { runCount: { increment: 1 }, lastRunAt: new Date() },
      });

      return { runId: run.id, status: 'COMPLETED' };
    } catch (error: any) {
      await this.prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: 'FAILED', error: error.message, finishedAt: new Date() },
      });
      throw error;
    }
  }

  async getRuns(workflowId: string) {
    return this.prisma.workflowRun.findMany({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }
}
