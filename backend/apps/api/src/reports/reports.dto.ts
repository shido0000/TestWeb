import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty()
  @IsUUID()
  scanId: string;

  @ApiProperty({ enum: ['PDF', 'HTML', 'JSON'] })
  @IsEnum(['PDF', 'HTML', 'JSON'])
  format: 'PDF' | 'HTML' | 'JSON';
}
