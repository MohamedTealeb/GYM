import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PrismaService } from '../../common/database/prisma.service';

describe('PlansService', () => {
  let service: PlansService;
  const prismaMock = {
    userSubscription: { findFirst: jest.fn() },
    monthlyPlan: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    monthlyPlanEdit: { count: jest.fn(), create: jest.fn() },
    dietPlan: { upsert: jest.fn() },
    planWorkout: { deleteMany: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(async (fn: any) => fn(prismaMock)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(PlansService);
    jest.clearAllMocks();
  });

  it('createMonthlyPlan should throw if no active subscription', async () => {
    prismaMock.userSubscription.findFirst.mockResolvedValue(null);
    await expect(
      service.createMonthlyPlan(1, 2, {}),
    ).rejects.toThrow('Client has no active subscription');
  });
});

