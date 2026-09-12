// ============================================
// Scans Controller
// ============================================

import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScansService } from './scans.service';
import { CreateScanDto } from './scans.dto';

@ApiTags('scans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('scans')
export class ScansController {
  constructor(private scansService: ScansService) {}

  @Post()
  @ApiOperation({ summary: 'Create and start a new scan' })
  @ApiResponse({ status: 201, description: 'Scan created and queued' })
  async create(@Body() dto: CreateScanDto, @Request() req) {
    return this.scansService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all scans' })
  @ApiResponse({ status: 200, description: 'List of scans' })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('page') page: string = '1',
    @Query('perPage') perPage: string = '20',
  ) {
    return this.scansService.findAll(projectId, parseInt(page), parseInt(perPage));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get scan details' })
  @ApiResponse({ status: 200, description: 'Scan details' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  async findOne(@Param('id') id: string) {
    return this.scansService.findOne(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a running scan' })
  @ApiResponse({ status: 200, description: 'Scan cancelled' })
  @ApiResponse({ status: 400, description: 'Cannot cancel scan' })
  async cancel(@Param('id') id: string) {
    return this.scansService.cancel(id);
  }
}
