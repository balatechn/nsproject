import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '../auth/guards/jwt-auth.guard';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Permissions('tasks:create')
  create(@Body() dto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(dto, req.user.id);
  }

  @Get()
  @Permissions('tasks:read')
  findAll(@Query() query: TaskQueryDto, @Request() req: any) {
    return this.tasksService.findAll(query, req.user.id);
  }

  @Get('kanban/:projectId')
  @Permissions('tasks:read')
  @ApiOperation({ summary: 'Get Kanban board for project' })
  getKanban(@Param('projectId') projectId: string) {
    return this.tasksService.getKanbanBoard(projectId);
  }

  @Get(':id')
  @Permissions('tasks:read')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @Permissions('tasks:update')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('tasks:delete')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/comments')
  @Permissions('tasks:update')
  addComment(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.tasksService.addComment(id, req.user.id, body.content);
  }

  @Post('bulk/status')
  @Permissions('tasks:update')
  bulkUpdateStatus(@Body() body: { ids: string[]; status: string }) {
    return this.tasksService.bulkUpdateStatus(body.ids, body.status);
  }
}
