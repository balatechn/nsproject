import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '../auth/guards/jwt-auth.guard';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Permissions('projects:create')
  @ApiOperation({ summary: 'Create project' })
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Get()
  @Permissions('projects:read')
  @ApiOperation({ summary: 'List projects' })
  findAll(@Query() query: ProjectQueryDto, @Request() req: any) {
    return this.projectsService.findAll(query, req.user.id);
  }

  @Get(':id')
  @Permissions('projects:read')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @Permissions('projects:update')
  @ApiOperation({ summary: 'Update project' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Request() req: any) {
    return this.projectsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Permissions('projects:delete')
  @ApiOperation({ summary: 'Delete project' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Post(':id/members')
  @Permissions('projects:update')
  @ApiOperation({ summary: 'Add project member' })
  addMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role: string },
    @Request() req: any,
  ) {
    return this.projectsService.addMember(id, body.userId, body.role, req.user.id);
  }

  @Get(':id/stats')
  @Permissions('projects:read')
  @ApiOperation({ summary: 'Get project statistics' })
  getStats(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.getStats(id, req.user.id);
  }

  @Get(':id/gantt')
  @Permissions('projects:read')
  @ApiOperation({ summary: 'Get Gantt chart data' })
  getGantt(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.getGanttData(id, req.user.id);
  }
}
