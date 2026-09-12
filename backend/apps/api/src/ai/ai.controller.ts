// ============================================
// AI Controller
// ============================================

import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { AIPrioritizationService } from './ai-prioritization.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIPrioritizationService) {}

  @Get('insights/:projectId')
  async getInsights(@Param('projectId') projectId: string) {
    return this.aiService.getInsights(projectId);
  }

  @Get('patterns/:projectId')
  async getPatterns(@Param('projectId') projectId: string) {
    return this.aiService.getPatterns(projectId);
  }

  @Get('predictions/:projectId')
  async getPredictions(@Param('projectId') projectId: string) {
    return this.aiService.getPredictions(projectId);
  }

  @Post('prioritize/:projectId')
  async prioritizeFindings(@Param('projectId') projectId: string) {
    return this.aiService.prioritizeFindings(projectId);
  }
}
