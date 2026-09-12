import { IsString, IsOptional, IsUUID, IsBoolean, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTargetDto {
  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ required: false, enum: ['PRODUCTION', 'STAGING', 'DEVELOPMENT'] })
  @IsOptional()
  @IsEnum(['PRODUCTION', 'STAGING', 'DEVELOPMENT'])
  environment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  authRequired?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cookies?: string;

  @ApiProperty()
  @IsObject()
  scope: {
    allowedDomains: string[];
    excludedPaths: string[];
    maxDepth: number;
  };
}

export class UpdateTargetDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  scope?: any;
}
