import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get KPI cards data' })
  getKpis(@Request() req: any) {
    return this.dashboardService.getKpis(req.user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  getActivity(@Request() req: any, @Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivity(req.user.id, limit);
  }

  @Get('upcoming-tasks')
  @ApiOperation({ summary: 'Get upcoming tasks due soon' })
  getUpcomingTasks(@Request() req: any, @Query('days') days?: number) {
    return this.dashboardService.getUpcomingTasks(req.user.id, days);
  }

  @Get('project-progress')
  @ApiOperation({ summary: 'Get active project progress' })
  getProjectProgress(@Request() req: any) {
    return this.dashboardService.getProjectProgress(req.user.id);
  }

  @Get('task-status-chart')
  @ApiOperation({ summary: 'Task status distribution chart data' })
  getTaskStatusChart(@Request() req: any) {
    return this.dashboardService.getTaskStatusChart(req.user.id);
  }

  @Get('team-utilization')
  @ApiOperation({ summary: 'Team utilization data' })
  getTeamUtilization() {
    return this.dashboardService.getTeamUtilization();
  }

  @Get('monthly-completion')
  @ApiOperation({ summary: 'Monthly task completion trend' })
  getMonthlyCompletion(@Request() req: any) {
    return this.dashboardService.getMonthlyTaskCompletion(req.user.id);
  }
}
