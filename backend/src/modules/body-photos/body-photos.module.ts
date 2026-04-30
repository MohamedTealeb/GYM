import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { BodyPhotosController } from './body-photos.controller';
import { BodyPhotosService } from './body-photos.service';

@Module({
  controllers: [BodyPhotosController],
  providers: [BodyPhotosService, PrismaService],
})
export class BodyPhotosModule {}

