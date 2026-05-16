import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // Leads
  async getLeads(query: any, userId: string) {
    const { page = 1, limit = 20, status, search } = query;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.lead.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async createLead(dto: any, ownerId: string) {
    return this.prisma.lead.create({ data: { ...dto, ownerId } });
  }

  async updateLead(id: string, dto: any) {
    return this.prisma.lead.update({ where: { id }, data: dto });
  }

  async getPipeline() {
    const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    const leads = await this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return statuses.reduce((acc: any, s) => {
      acc[s] = leads.filter((l) => l.status === s);
      return acc;
    }, {});
  }

  // Customers
  async getCustomers(query: any) {
    const { page = 1, limit = 20, search } = query;
    const where: any = {};
    if (search) where.companyName = { contains: search, mode: 'insensitive' };
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit }),
      this.prisma.customer.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async createCustomer(dto: any) {
    return this.prisma.customer.create({ data: dto });
  }

  async getLeadStats() {
    const stats = await this.prisma.lead.groupBy({ by: ['status'], _count: { id: true }, _sum: { value: true } });
    return stats;
  }
}
