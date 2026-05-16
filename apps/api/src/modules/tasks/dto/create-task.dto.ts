import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() projectId: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() milestoneId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() parentId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() assigneeId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() priority?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() startDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() estimatedHours?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() order?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() tags?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() slaHours?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isRecurring?: boolean;
  @ApiProperty({ required: false }) @IsOptional() recurringConfig?: any;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional() @IsNumber() progress?: number;
}

export class TaskQueryDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() assigneeId?: string;
  @IsOptional() @IsString() search?: string;
}
