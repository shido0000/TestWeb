// ============================================
// Multi-Tenant Module
// ============================================

import { Module } from '@nestjs/common';
import { MultiTenantService } from './multi-tenant.service';
import { MultiTenantController } from './multi-tenant.controller';

@Module({
  controllers: [MultiTenantController],
  providers: [MultiTenantService],
  exports: [MultiTenantService],
})
export class MultiTenantModule {}
