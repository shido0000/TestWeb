import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFindingDto {
  @ApiProperty({ required: false, enum: ['OPEN', 'ACCEPTED', 'FALSE_POSITIVE', 'FIXED', 'RETEST'] })
  @IsOptional()
  @IsEnum(['OPEN', 'ACCEPTED', 'FALSE_POSITIVE', 'FIXED', 'RETEST'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
