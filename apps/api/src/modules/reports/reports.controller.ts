import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('projects') @Permissions('reports:read') getProjects(@Query('projectId') projectId?: string) { return this.reportsService.getProjectReport(projectId); }
  @Get('resources') @Permissions('reports:read') getResources() { return this.reportsService.getResourceReport(); }
  @Get('time') @Permissions('reports:read') getTime(@Query('projectId') projectId?: string) { return this.reportsService.getTimeReport(projectId); }
}
