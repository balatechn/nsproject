import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({
        skip: (page - 1) * limit, take: limit,
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } }, allocations: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count(),
    ]);
    return { data, total, page, limit };
  }

  async create(dto: any) {
    return this.prisma.resource.create({ data: dto });
  }

  async update(id: string, dto: any) {
    return this.prisma.resource.update({ where: { id }, data: dto });
  }

  async getAllocations(resourceId: string) {
    return this.prisma.resourceAllocation.findMany({
      where: { resourceId },
      orderBy: { startDate: 'asc' },
    });
  }

  async allocate(dto: any) {
    return this.prisma.resourceAllocation.create({ data: dto });
  }

  async getCapacityReport() {
    const resources = await this.prisma.resource.findMany({
      include: { allocations: { where: { endDate: { gte: new Date() } } } },
    });
    return resources.map((r) => ({
      ...r,
      totalAllocated: r.allocations.reduce((sum, a) => sum + Number(a.allocation), 0),
      overAllocated: r.allocations.reduce((sum, a) => sum + Number(a.allocation), 0) > Number(r.availability),
    }));
  }
}
