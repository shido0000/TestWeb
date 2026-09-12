import { Module } from '@nestjs/common';
import { FindingsService } from './findings.service';
import { FindingsController } from './findings.controller';

@Module({
  providers: [FindingsService],
  controllers: [FindingsController],
  exports: [FindingsService],
})
export class FindingsModule {}
