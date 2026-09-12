import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TargetsService } from './targets.service';
import { CreateTargetDto, UpdateTargetDto } from './targets.dto';

@ApiTags('targets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('targets')
export class TargetsController {
  constructor(private targetsService: TargetsService) {}

  @Post()
  create(@Body() dto: CreateTargetDto) {
    return this.targetsService.create(dto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.targetsService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.targetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTargetDto) {
    return this.targetsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.targetsService.delete(id);
  }
}
