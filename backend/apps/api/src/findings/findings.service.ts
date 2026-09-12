import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFindingDto } from './findings.dto';

@Injectable()
export class FindingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: any, page: number = 1, perPage: number = 20) {
    const where: any = {};
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.scanId) where.scanId = filters.scanId;
    if (filters.severity) where.severity = filters.severity;
    if (filters.status) where.status = filters.status;
    if (filters.suite) where.suite = filters.suite;

    const [findings, total] = await Promise.all([
      this.prisma.finding.findMany({
        where,
        include: { scan: true, target: true },
        orderBy: { riskScore: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.finding.count({ where }),
    ]);

    return { data: findings, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }

  async findOne(id: string) {
    const finding = await this.prisma.finding.findUnique({
      where: { id },
      include: { scan: true, target: true, evidences: true },
    });
    if (!finding) throw new NotFoundException('Finding not found');
    return finding;
  }

  async update(id: string, dto: UpdateFindingDto) {
    const data: any = { ...dto };
    if (dto.status === 'FIXED') data.resolvedAt = new Date();
    return this.prisma.finding.update({ where: { id }, data });
  }

  async markAsDuplicate(id: string, duplicateOfId: string) {
    return this.prisma.finding.update({
      where: { id },
      data: { isDuplicate: true, duplicateOfId },
    });
  }

  async markAsFalsePositive(id: string) {
    return this.prisma.finding.update({
      where: { id },
      data: { status: 'FALSE_POSITIVE' },
    });
  }
}
