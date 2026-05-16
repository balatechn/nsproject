import { Controller, Get, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('users:read')
  @ApiOperation({ summary: 'List all users' })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get own profile' })
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@Request() req: any, @Body() dto: any) {
    return this.usersService.update(req.user.id, dto);
  }

  @Patch(':id')
  @Permissions('users:update')
  @ApiOperation({ summary: 'Update user (admin)' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.update(id, dto);
  }
}
