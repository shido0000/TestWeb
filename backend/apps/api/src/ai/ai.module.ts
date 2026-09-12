// ============================================
// AI Module
// ============================================

import { Module } from '@nestjs/common';
import { AIPrioritizationService } from './ai-prioritization.service';
import { AIController } from './ai.controller';

@Module({
  controllers: [AIController],
  providers: [AIPrioritizationService],
  exports: [AIPrioritizationService],
})
export class AIModule {}
