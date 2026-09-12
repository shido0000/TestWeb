// ============================================
// Multi-Tenant Service
// ============================================
// Tenant isolation and management

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  createdAt: Date;
  members: TenantMember[];
  usage: TenantUsage;
  settings: TenantSettings;
}

export interface TenantMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface TenantUsage {
  scansThisMonth: number;
  findingsStored: number;
  storageUsedMB: number;
  apiCallsThisMonth: number;
  teamMembers: number;
  projectsCount: number;
}

export interface TenantSettings {
  defaultScanDepth: number;
  rateLimitPerSecond: number;
  dataRetentionDays: number;
  ssoEnabled: boolean;
  auditLogEnabled: boolean;
  customDomain?: string;
  ipAllowlist: string[];
}

@Injectable()
export class MultiTenantService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // TENANT CRUD
  // ============================================

  async createTenant(
    name: string,
    slug: string,
    ownerId: string,
    plan: Tenant['plan'] = 'free'
  ): Promise<Tenant> {
    // Check if slug is unique
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      throw new ForbiddenException(`Tenant slug '${slug}' is already taken`);
    }

    const tenant = await this.prisma.tenant.create({
       {
        name,
        slug,
        plan,
        status: plan === 'free' ? 'trial' : 'active',
        settings: this.getDefaultSettings(plan),
      },
    });

    // Add owner as member
    await this.prisma.tenantMember.create({
       {
        tenantId: tenant.id,
        userId: ownerId,
        role: 'owner',
      },
    });

    return this.getTenant(tenant.id);
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const usage = await this.calculateUsage(tenantId);

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      members: tenant.members.map(m => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      usage,
      settings: tenant.settings as TenantSettings,
    };
  }

  async updateTenant(tenantId: string,  Partial<Pick<Tenant, 'name' | 'settings'>>): Promise<Tenant> {
    await this.prisma.tenant.update({
      where: { id: tenantId },
       data,
    });

    return this.getTenant(tenantId);
  }

  async deleteTenant(tenantId: string): Promise<void> {
    // Soft delete by setting status to suspended
    await this.prisma.tenant.update({
      where: { id: tenantId },
       { status: 'suspended' },
    });
  }

  // ============================================
  // MEMBER MANAGEMENT
  // ============================================

  async addMember(
    tenantId: string,
    userId: string,
    role: TenantMember['role'] = 'member'
  ): Promise<TenantMember> {
    // Check if user is already a member
    const existing = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });

    if (existing) {
      throw new ForbiddenException('User is already a member of this tenant');
    }

    const member = await this.prisma.tenantMember.create({
       {
        tenantId,
        userId,
        role,
      },
    });

    return {
      id: member.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }

  async removeMember(tenantId: string, userId: string): Promise<void> {
    const member = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot remove owner from tenant');
    }

    await this.prisma.tenantMember.delete({
      where: { id: member.id },
    });
  }

  async updateMemberRole(
    tenantId: string,
    userId: string,
    role: TenantMember['role']
  ): Promise<TenantMember> {
    const member = await this.prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.tenantMember.update({
      where: { id: member.id },
       { role },
    });

    return {
      id: member.id,
      userId: member.userId,
      role,
      joinedAt: member.joinedAt,
    };
  }

  // ============================================
  // TENANT ISOLATION
  // ============================================

  async getUserTenants(userId: string): Promise<Tenant[]> {
    const memberships = await this.prisma.tenantMember.findMany({
      where: { userId },
      include: { tenant: true },
    });

    const tenants = await Promise.all(
      memberships.map(m => this.getTenant(m.tenantId))
    );

    return tenants;
  }

  async validateAccess(userId: string, tenantId: string): Promise<boolean> {
    const member = await this.prisma.tenantMember.findFirst({
      where: { userId, tenantId },
    });

    return !!member;
  }

  async validatePermission(
    userId: string,
    tenantId: string,
    requiredRole: TenantMember['role']
  ): Promise<boolean> {
    const member = await this.prisma.tenantMember.findFirst({
      where: { userId, tenantId },
    });

    if (!member) return false;

    const roleHierarchy: Record<string, number> = {
      viewer: 1,
      member: 2,
      admin: 3,
      owner: 4,
    };

    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
  }

  // ============================================
  // USAGE TRACKING
  // ============================================

  async calculateUsage(tenantId: string): Promise<TenantUsage> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count scans this month
    const scansThisMonth = await this.prisma.scan.count({
      where: {
        project: { tenantId },
        createdAt: { gte: startOfMonth },
      },
    });

    // Count findings stored
    const findingsStored = await this.prisma.finding.count({
      where: {
        project: { tenantId },
      },
    });

    // Calculate storage used (simplified)
    const storageUsedMB = await this.calculateStorageUsage(tenantId);

    // Count API calls this month
    const apiCallsThisMonth = await this.prisma.auditLog.count({
      where: {
        tenantId,
        action: 'api_call',
        createdAt: { gte: startOfMonth },
      },
    });

    // Count team members
    const teamMembers = await this.prisma.tenantMember.count({
      where: { tenantId },
    });

    // Count projects
    const projectsCount = await this.prisma.project.count({
      where: { tenantId },
    });

    return {
      scansThisMonth,
      findingsStored,
      storageUsedMB,
      apiCallsThisMonth,
      teamMembers,
      projectsCount,
    };
  }

  private async calculateStorageUsage(tenantId: string): Promise<number> {
    // Simplified storage calculation
    // In production, track actual file sizes in storage service
    
    const evidenceCount = await this.prisma.evidence.count({
      where: {
        scan: {
          project: { tenantId },
        },
      },
    });

    // Assume average evidence size of 2MB
    return evidenceCount * 2;
  }

  async checkUsageLimits(tenantId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const tenant = await this.getTenant(tenantId);
    const usage = tenant.usage;
    const limits = this.getPlanLimits(tenant.plan);

    if (usage.scansThisMonth >= limits.scans) {
      return {
        allowed: false,
        reason: `Monthly scan limit reached (${limits.scans}). Upgrade your plan for more scans.`,
      };
    }

    if (usage.findingsStored >= limits.findings) {
      return {
        allowed: false,
        reason: `Finding storage limit reached (${limits.findings}). Upgrade your plan for more storage.`,
      };
    }

    if (usage.teamMembers >= limits.teamMembers) {
      return {
        allowed: false,
        reason: `Team member limit reached (${limits.teamMembers}). Upgrade your plan for more members.`,
      };
    }

    if (usage.projectsCount >= limits.projects) {
      return {
        allowed: false,
        reason: `Project limit reached (${limits.projects}). Upgrade your plan for more projects.`,
      };
    }

    return { allowed: true };
  }

  private getPlanLimits(plan: Tenant['plan']): {
    scans: number;
    findings: number;
    storageMB: number;
    apiCalls: number;
    teamMembers: number;
    projects: number;
  } {
    const limits = {
      free: {
        scans: 50,
        findings: 500,
        storageMB: 1000,
        apiCalls: 5000,
        teamMembers: 2,
        projects: 3,
      },
      pro: {
        scans: 1000,
        findings: 10000,
        storageMB: 20000,
        apiCalls: 100000,
        teamMembers: 10,
        projects: 20,
      },
      enterprise: {
        scans: 5000,
        findings: 50000,
        storageMB: 100000,
        apiCalls: 500000,
        teamMembers: 50,
        projects: 100,
      },
    };

    return limits[plan];
  }

  private getDefaultSettings(plan: Tenant['plan']): TenantSettings {
    const baseSettings: TenantSettings = {
      defaultScanDepth: 3,
      rateLimitPerSecond: 10,
      dataRetentionDays: 30,
      ssoEnabled: false,
      auditLogEnabled: false,
      ipAllowlist: [],
    };

    switch (plan) {
      case 'pro':
        return {
          ...baseSettings,
          defaultScanDepth: 5,
          rateLimitPerSecond: 20,
          dataRetentionDays: 90,
          auditLogEnabled: true,
        };
      case 'enterprise':
        return {
          ...baseSettings,
          defaultScanDepth: 10,
          rateLimitPerSecond: 50,
          dataRetentionDays: 365,
          ssoEnabled: true,
          auditLogEnabled: true,
        };
      default:
        return baseSettings;
    }
  }

  // ============================================
  // DATA ISOLATION HELPERS
  // ============================================

  async getTenantForProject(projectId: string): Promise<string> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { tenantId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.tenantId;
  }

  async getTenantForScan(scanId: string): Promise<string> {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      include: { project: { select: { tenantId: true } } },
    });

    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    return scan.project.tenantId;
  }

  async getTenantForFinding(findingId: string): Promise<string> {
    const finding = await this.prisma.finding.findUnique({
      where: { id: findingId },
      include: { project: { select: { tenantId: true } } },
    });

    if (!finding) {
      throw new NotFoundException('Finding not found');
    }

    return finding.project.tenantId;
  }
}
