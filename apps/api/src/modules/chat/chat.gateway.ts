import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join:room')
  handleJoin(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    client.join(`room:${roomId}`);
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @MessageBody() data: { roomId: string; content: string; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendMessage(data.roomId, data.senderId, data.content);
    this.server.to(`room:${data.roomId}`).emit('message:new', message);
    return message;
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(@MessageBody() data: { roomId: string; userId: string }, @ConnectedSocket() client: Socket) {
    client.to(`room:${data.roomId}`).emit('typing:start', { userId: data.userId });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@MessageBody() data: { roomId: string; userId: string }, @ConnectedSocket() client: Socket) {
    client.to(`room:${data.roomId}`).emit('typing:stop', { userId: data.userId });
  }
}
