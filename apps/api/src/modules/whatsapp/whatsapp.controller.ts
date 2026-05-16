import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('whatsapp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'whatsapp', version: '1' })
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send') sendMessage(@Body() dto: { to: string; message: string }) { return this.whatsappService.sendText(dto.to, dto.message); }
  @Get('status') getStatus() { return this.whatsappService.getInstanceStatus(); }
}
