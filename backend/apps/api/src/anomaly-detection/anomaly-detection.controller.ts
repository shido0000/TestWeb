// ============================================
// Anomaly Detection Controller
// ============================================

import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { AnomalyDetectionService } from './anomaly-detection.service';

@Controller('anomalies')
export class AnomalyDetectionController {
  constructor(private readonly anomalyService: AnomalyDetectionService) {}

  @Get()
  async getAnomalies(
    @Query('targetId') targetId?: string,
    @Query('status') status?: string
  ) {
    return this.anomalyService.getAnomalies(targetId, status);
  }

  @Get('stats/:targetId')
  async getStats(@Param('targetId') targetId: string) {
    return this.anomalyService.getAnomalyStats(targetId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'new' | 'acknowledged' | 'resolved' | 'ignored'
  ) {
    return this.anomalyService.updateAnomalyStatus(id, status);
  }
}
