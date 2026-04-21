import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../common/database/prisma.service';
import { UserRepository } from '../../common/database/repository/user.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
