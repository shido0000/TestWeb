// ============================================
// Scans Module
// ============================================

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScansService } from './scans.service';
import { ScansController } from './scans.controller';
import { ScanProcessor } from './scan.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scan-queue',
    }),
  ],
  providers: [ScansService, ScanProcessor],
  controllers: [ScansController],
  exports: [ScansService],
})
export class ScansModule {}
