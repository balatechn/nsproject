import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '../auth/guards/jwt-auth.guard';

@ApiTags('crm')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'crm', version: '1' })
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('leads') @Permissions('crm:read') getLeads(@Query() query: any, @Request() req: any) { return this.crmService.getLeads(query, req.user.id); }
  @Post('leads') @Permissions('crm:write') createLead(@Body() dto: any, @Request() req: any) { return this.crmService.createLead(dto, req.user.id); }
  @Patch('leads/:id') @Permissions('crm:write') updateLead(@Param('id') id: string, @Body() dto: any) { return this.crmService.updateLead(id, dto); }
  @Get('pipeline') @Permissions('crm:read') getPipeline() { return this.crmService.getPipeline(); }
  @Get('customers') @Permissions('crm:read') getCustomers(@Query() query: any) { return this.crmService.getCustomers(query); }
  @Post('customers') @Permissions('crm:write') createCustomer(@Body() dto: any) { return this.crmService.createCustomer(dto); }
  @Get('stats') @Permissions('crm:read') getStats() { return this.crmService.getLeadStats(); }
}
