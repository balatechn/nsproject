import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export enum ProjectStatus {
  PLANNING = 'PLANNING', ACTIVE = 'ACTIVE', ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED', ARCHIVED = 'ARCHIVED',
}

export enum ProjectPriority {
  LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL',
}

export class CreateProjectDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() code?: string;
  @ApiProperty({ enum: ProjectStatus, required: false }) @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @ApiProperty({ enum: ProjectPriority, required: false }) @IsOptional() @IsEnum(ProjectPriority) priority?: ProjectPriority;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() startDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() endDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() budget?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() color?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() tags?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsString() locationId?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto {
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(100) limit?: number;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @IsOptional() @IsEnum(ProjectPriority) priority?: ProjectPriority;
  @IsOptional() @IsString() search?: string;
}
