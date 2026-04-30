import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService, PrismaService],
})
export class ProgressModule {}

