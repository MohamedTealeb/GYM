import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/database/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  const prismaMock = {
    user: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    userSubscription: { findFirst: jest.fn() },
    monthlyPlan: { findUnique: jest.fn() },
    progress: { findMany: jest.fn() },
    bodyPhoto: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
