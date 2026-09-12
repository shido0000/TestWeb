// ============================================
// Multi-Tenant Controller
// ============================================

import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { MultiTenantService } from './multi-tenant.service';

@Controller('tenants')
export class MultiTenantController {
  constructor(private readonly tenantService: MultiTenantService) {}

  @Post()
  async createTenant(
    @Body('name') name: string,
    @Body('slug') slug: string,
    @Body('ownerId') ownerId: string,
    @Body('plan') plan?: 'free' | 'pro' | 'enterprise'
  ) {
    return this.tenantService.createTenant(name, slug, ownerId, plan);
  }

  @Get(':id')
  async getTenant(@Param('id') id: string) {
    return this.tenantService.getTenant(id);
  }

  @Put(':id')
  async updateTenant(
    @Param('id') id: string,
    @Body()  
  ) {
    return this.tenantService.updateTenant(id, data);
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: string) {
    return this.tenantService.deleteTenant(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    const tenant = await this.tenantService.getTenant(id);
    return tenant.members;
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('role') role?: 'owner' | 'admin' | 'member' | 'viewer'
  ) {
    return this.tenantService.addMember(id, userId, role);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.tenantService.removeMember(id, userId);
  }

  @Put(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: 'owner' | 'admin' | 'member' | 'viewer'
  ) {
    return this.tenantService.updateMemberRole(id, userId, role);
  }

  @Get('user/:userId')
  async getUserTenants(@Param('userId') userId: string) {
    return this.tenantService.getUserTenants(userId);
  }

  @Get(':id/usage')
  async getUsage(@Param('id') id: string) {
    return this.tenantService.calculateUsage(id);
  }

  @Get(':id/limits')
  async checkLimits(@Param('id') id: string) {
    return this.tenantService.checkUsageLimits(id);
  }
}
