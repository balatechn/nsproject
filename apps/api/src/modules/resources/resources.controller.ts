import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '../auth/guards/jwt-auth.guard';

@ApiTags('resources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'resources', version: '1' })
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get() findAll(@Query() query: any) { return this.resourcesService.findAll(query); }
  @Post() @Permissions('resources:manage') create(@Body() dto: any) { return this.resourcesService.create(dto); }
  @Patch(':id') @Permissions('resources:manage') update(@Param('id') id: string, @Body() dto: any) { return this.resourcesService.update(id, dto); }
  @Get(':id/allocations') getAllocations(@Param('id') id: string) { return this.resourcesService.getAllocations(id); }
  @Post('allocate') @Permissions('resources:manage') allocate(@Body() dto: any) { return this.resourcesService.allocate(dto); }
  @Get('capacity/report') getCapacity() { return this.resourcesService.getCapacityReport(); }
}
