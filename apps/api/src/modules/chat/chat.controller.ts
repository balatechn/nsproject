import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms') getRooms(@Request() req: any) { return this.chatService.getRooms(req.user.id); }
  @Post('rooms') createRoom(@Body() dto: any) { return this.chatService.createRoom(dto.name, dto.participants, dto.projectId); }
  @Get('rooms/:id/messages') getMessages(@Param('id') id: string, @Query() query: any) { return this.chatService.getMessages(id, query); }
  @Post('rooms/:id/messages') sendMessage(@Param('id') id: string, @Body() dto: any, @Request() req: any) { return this.chatService.sendMessage(id, req.user.id, dto.content); }
}
