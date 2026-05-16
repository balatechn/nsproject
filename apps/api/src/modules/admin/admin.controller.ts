import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats') getStats() { return this.adminService.getStats(); }
  @Get('audit-logs') getAuditLogs(@Query() query: any) { return this.adminService.getAuditLogs(query); }
  @Get('roles') getRoles() { return this.adminService.getRoles(); }
  @Get('settings') getSettings() { return this.adminService.getSettings(); }
  @Patch('settings/:key') updateSetting(@Param('key') key: string, @Body() body: { value: any }) { return this.adminService.updateSetting(key, body.value); }
  @Post('users/:id/suspend') suspendUser(@Param('id') id: string) { return this.adminService.suspendUser(id); }
  @Post('users/:id/activate') activateUser(@Param('id') id: string) { return this.adminService.activateUser(id); }
}
