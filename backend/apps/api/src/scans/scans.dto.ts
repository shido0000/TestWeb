// ============================================
// Scans DTOs
// ============================================

import { IsArray, IsOptional, IsUUID, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScanSuite } from '@testhub/shared';

export class CreateScanDto {
  @ApiProperty({ example: 'uuid-of-target' })
  @IsUUID()
  targetId: string;

  @ApiProperty({ 
    example: ['ACCESSIBILITY', 'PERFORMANCE'],
    isArray: true,
    enum: ScanSuite,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ScanSuite, { each: true })
  suites: ScanSuite[];

  @ApiProperty({ required: false })
  @IsOptional()
  config?: Record<string, any>;
}
