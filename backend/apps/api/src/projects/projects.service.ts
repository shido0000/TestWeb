import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        tags: dto.tags || [],
      },
    });

    // Add creator as admin
    await this.prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: 'ADMIN',
      },
    });

    return project;
  }

  async findAll(userId: string, page: number = 1, perPage: number = 20) {
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          members: { some: { userId } },
          isArchived: false,
        },
        include: {
          _count: { select: { targets: true, scans: true, findings: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.project.count({
        where: { members: { some: { userId } }, isArchived: false },
      }),
    ]);

    return { data: projects, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        targets: true,
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { scans: true, findings: true } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    return this.prisma.project.update({ where: { id }, data: { isArchived: true } });
  }
}
