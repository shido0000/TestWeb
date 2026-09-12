// ============================================
// Anomaly Detection Module
// ============================================

import { Module } from '@nestjs/common';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { AnomalyDetectionController } from './anomaly-detection.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [AnomalyDetectionController],
  providers: [AnomalyDetectionService],
  exports: [AnomalyDetectionService],
})
export class AnomalyDetectionModule {}
