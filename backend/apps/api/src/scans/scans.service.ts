// ============================================
// Scans Service
// ============================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScanDto } from './scans.dto';
import { ScanStatus, ScanSuite } from '@testhub/shared';

@Injectable()
export class ScansService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('scan-queue') private scanQueue: Queue,
  ) {}

  async create(dto: CreateScanDto, userId: string) {
    // Get target
    const target = await this.prisma.target.findUnique({
      where: { id: dto.targetId },
      include: { project: true },
    });

    if (!target) {
      throw new NotFoundException('Target not found');
    }

    // Create scan
    const scan = await this.prisma.scan.create({
      data: {
        projectId: target.projectId,
        targetId: target.id,
        suites: dto.suites,
        status: ScanStatus.PENDING,
        triggeredByUserId: userId,
        config: dto.config || {},
      },
    });

    // Add to queue
    await this.scanQueue.add('process-scan', {
      scanId: scan.id,
      targetId: target.id,
      projectId: target.projectId,
      suites: dto.suites,
      config: dto.config,
    });

    return scan;
  }

  async findAll(projectId?: string, page: number = 1, perPage: number = 20) {
    const where = projectId ? { projectId } : {};

    const [scans, total] = await Promise.all([
      this.prisma.scan.findMany({
        where,
        include: {
          target: true,
          project: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.scan.count({ where }),
    ]);

    return {
      data: scans,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findOne(id: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id },
      include: {
        target: true,
        project: true,
        findings: {
          orderBy: { riskScore: 'desc' },
        },
      },
    });

    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    return scan;
  }

  async cancel(id: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id },
    });

    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    if (scan.status !== ScanStatus.PENDING && scan.status !== ScanStatus.RUNNING) {
      throw new BadRequestException('Can only cancel pending or running scans');
    }

    // Update status
    const updatedScan = await this.prisma.scan.update({
      where: { id },
      data: {
        status: ScanStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    // TODO: Remove from queue

    return updatedScan;
  }

  async updateProgress(scanId: string, progress: number, pagesScanned: number, totalRequests: number) {
    return this.prisma.scan.update({
      where: { id: scanId },
      data: {
        progress,
        pagesScanned,
        totalRequests,
        status: ScanStatus.RUNNING,
      },
    });
  }

  async complete(scanId: string, findingsSummary: any) {
    return this.prisma.scan.update({
      where: { id: scanId },
      data: {
        status: ScanStatus.COMPLETED,
        progress: 100,
        completedAt: new Date(),
        duration: Math.round((new Date().getTime() - (await this.prisma.scan.findUnique({ where: { id: scanId } }))!.startedAt!.getTime()) / 1000),
        ...findingsSummary,
      },
    });
  }

  async fail(scanId: string, errorMessage: string) {
    return this.prisma.scan.update({
      where: { id: scanId },
      data: {
        status: ScanStatus.FAILED,
        completedAt: new Date(),
        errorMessage,
      },
    });
  }
}
