import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: { participants: { has: userId } },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' }, include: { sender: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMessages(roomId: string, query: any) {
    const { page = 1, limit = 50 } = query;
    const [data, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { roomId, isDeleted: false },
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      }),
      this.prisma.chatMessage.count({ where: { roomId } }),
    ]);
    return { data: data.reverse(), total, page, limit };
  }

  async sendMessage(roomId: string, senderId: string, content: string, type = 'TEXT') {
    const message = await this.prisma.chatMessage.create({
      data: { roomId, senderId, content, type },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    await this.prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });
    return message;
  }

  async createRoom(name: string, participants: string[], projectId?: string) {
    return this.prisma.chatRoom.create({
      data: { name, participants, projectId, isGroup: participants.length > 2 },
    });
  }
}
