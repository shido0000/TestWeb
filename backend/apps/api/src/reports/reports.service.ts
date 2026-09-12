import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateReportDto } from './reports.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: GenerateReportDto) {
    const scan = await this.prisma.scan.findUnique({
      where: { id: dto.scanId },
      include: { findings: true, target: true, project: true },
    });

    if (!scan) throw new NotFoundException('Scan not found');

    const report = await this.prisma.report.create({
      data: {
        scanId: dto.scanId,
        projectId: scan.projectId,
        format: dto.format,
        fileUrl: `/reports/${dto.scanId}.${dto.format.toLowerCase()}`,
        findingsCount: scan.findings.length,
        fileSize: 0,
      },
    });

    return report;
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};
    return this.prisma.report.findMany({
      where,
      include: { scan: true, project: true },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { scan: true, project: true },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }
}
