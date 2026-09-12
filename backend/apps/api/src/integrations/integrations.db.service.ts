import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};
    return this.prisma.integration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.integration.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.integration.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.integration.delete({ where: { id } });
  }
}
