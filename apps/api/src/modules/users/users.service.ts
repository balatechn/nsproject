import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, email: true, username: true, firstName: true, lastName: true,
          avatar: true, jobTitle: true, department: true, status: true,
          lastLoginAt: true, createdAt: true,
          roleAssignments: { include: { role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, username: true, firstName: true, lastName: true,
        avatar: true, phone: true, jobTitle: true, department: true, location: true,
        timezone: true, status: true, emailVerified: true, mfaEnabled: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
        roleAssignments: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const roles = user.roleAssignments.map((ra) => ra.role.name);
    const permissions = [...new Set(
      user.roleAssignments.flatMap((ra) => ra.role.permissions.map((rp) => rp.permission.name)),
    )];

    return { ...user, roles, permissions };
  }

  async update(id: string, dto: any) {
    // Never allow password update here
    const { password, email, ...data } = dto;
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, firstName: true, lastName: true, avatar: true,
        phone: true, jobTitle: true, department: true, timezone: true,
      },
    });
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.user.update({ where: { id }, data: { avatar: avatarUrl } });
  }
}
