import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '../auth/guards/jwt-auth.guard';

@ApiTags('workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'workflows', version: '1' })
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get() findAll(@Query() query: any, @Request() req: any) { return this.workflowsService.findAll(query, req.user.id); }
  @Post() @Permissions('workflows:create') create(@Body() dto: any, @Request() req: any) { return this.workflowsService.create(dto, req.user.id); }
  @Patch(':id') @Permissions('workflows:create') update(@Param('id') id: string, @Body() dto: any) { return this.workflowsService.update(id, dto); }
  @Post(':id/execute') @Permissions('workflows:execute') execute(@Param('id') id: string, @Body() input: any) { return this.workflowsService.execute(id, input); }
  @Get(':id/runs') getRuns(@Param('id') id: string) { return this.workflowsService.getRuns(id); }
}
