import { Controller, Get, Param, Patch, Body, Query, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FindingsService } from './findings.service';
import { UpdateFindingDto } from './findings.dto';

@ApiTags('findings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('findings')
export class FindingsController {
  constructor(private findingsService: FindingsService) {}

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('scanId') scanId?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('suite') suite?: string,
    @Query('page') page: string = '1',
    @Query('perPage') perPage: string = '20',
  ) {
    return this.findingsService.findAll({ projectId, scanId, severity, status, suite }, parseInt(page), parseInt(perPage));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFindingDto) {
    return this.findingsService.update(id, dto);
  }

  @Post(':id/duplicate')
  markAsDuplicate(@Param('id') id: string, @Body('duplicateOfId') duplicateOfId: string) {
    return this.findingsService.markAsDuplicate(id, duplicateOfId);
  }

  @Post(':id/false-positive')
  markAsFalsePositive(@Param('id') id: string) {
    return this.findingsService.markAsFalsePositive(id);
  }
}
