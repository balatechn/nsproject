import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (exists) {
      throw new ConflictException('Email or username already taken');
    }

    const password = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
      select: {
        id: true, email: true, username: true,
        firstName: true, lastName: true, createdAt: true,
      },
    });

    // Assign default TEAM_MEMBER role
    const memberRole = await this.prisma.role.findUnique({ where: { name: 'TEAM_MEMBER' } });
    if (memberRole) {
      await this.prisma.userRole.create({ data: { userId: user.id, roleId: memberRole.id } });
    }

    return { message: 'Registration successful', user };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roleAssignments: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });

    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const roles = user.roleAssignments?.map((ra: any) => ra.role.name) ?? [];
    const permissions = user.roleAssignments?.flatMap((ra: any) =>
      ra.role.permissions.map((rp: any) => rp.permission.name),
    ) ?? [];

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        roles,
        permissions: [...new Set(permissions)],
      },
    };
  }

  async refreshToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      include: { roleAssignments: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user) throw new UnauthorizedException();

    // Rotate refresh token
    await this.prisma.refreshToken.delete({ where: { token } });
    return this.login(user);
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken, userId },
    });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    // Always return success to prevent email enumeration
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      // TODO: send email with reset link
    }
    return { message: 'If this email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, password: string) {
    // TODO: validate token from Redis/DB, update password
    throw new BadRequestException('Not implemented');
  }

  async getMe(userId: string) {
    return this.usersService.findOne(userId);
  }

  async oauthLogin(user: any) {
    return this.login(user);
  }
}
