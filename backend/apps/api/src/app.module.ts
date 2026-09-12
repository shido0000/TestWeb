// ============================================
// TestHub API - App Module
// ============================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TargetsModule } from './targets/targets.module';
import { ScansModule } from './scans/scans.module';
import { FindingsModule } from './findings/findings.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AIModule } from './ai/ai.module';
import { AnomalyDetectionModule } from './anomaly-detection/anomaly-detection.module';
import { MultiTenantModule } from './multi-tenant/multi-tenant.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Queue (Redis)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Database
    PrismaModule,

    // Feature Modules (Phase 1)
    AuthModule,
    ProjectsModule,
    TargetsModule,
    ScansModule,
    FindingsModule,
    ReportsModule,
    HealthModule,
    StorageModule,

    // Feature Modules (Phase 2)
    IntegrationsModule,

    // Feature Modules (Phase 3)
    AIModule,
    AnomalyDetectionModule,
    MultiTenantModule,
    BillingModule,
  ],
})
export class AppModule {}
