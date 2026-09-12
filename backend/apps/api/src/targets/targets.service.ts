import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTargetDto, UpdateTargetDto } from './targets.dto';

@Injectable()
export class TargetsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTargetDto) {
    return this.prisma.target.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        url: dto.url,
        environment: dto.environment || 'PRODUCTION',
        authRequired: dto.authRequired || false,
        headers: dto.headers,
        cookies: dto.cookies,
        scope: dto.scope,
      },
    });
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};
    return this.prisma.target.findMany({
      where,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const target = await this.prisma.target.findUnique({
      where: { id },
      include: { project: true, _count: { select: { scans: true } } },
    });
    if (!target) throw new NotFoundException('Target not found');
    return target;
  }

  async update(id: string, dto: UpdateTargetDto) {
    return this.prisma.target.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.target.delete({ where: { id } });
  }
}
