import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string[]>(); // userId -> socketIds[]

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }

      const payload = this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') });
      const userId = payload.sub;
      client.data.userId = userId;

      const existing = this.connectedUsers.get(userId) || [];
      this.connectedUsers.set(userId, [...existing, client.id]);
      client.join(`user:${userId}`);
      console.log(`User ${userId} connected via socket ${client.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = (this.connectedUsers.get(userId) || []).filter((id) => id !== client.id);
      if (sockets.length === 0) {
        this.connectedUsers.delete(userId);
      } else {
        this.connectedUsers.set(userId, sockets);
      }
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'notification', notification);
  }

  broadcastTaskUpdate(projectId: string, task: any) {
    this.server.to(`project:${projectId}`).emit('task:update', task);
  }

  @SubscribeMessage('join:project')
  handleJoinProject(@MessageBody() projectId: string, @ConnectedSocket() client: Socket) {
    client.join(`project:${projectId}`);
    return { event: 'joined', data: projectId };
  }

  @SubscribeMessage('leave:project')
  handleLeaveProject(@MessageBody() projectId: string, @ConnectedSocket() client: Socket) {
    client.leave(`project:${projectId}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: Date.now() };
  }
}
