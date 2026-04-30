import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../common/database/prisma.service';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  const prismaMock = {
    subscriptionPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userSubscription: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get(SubscriptionsService);
    jest.clearAllMocks();
  });

  it('listPlans should include effectivePrice/isOnSale', async () => {
    prismaMock.subscriptionPlan.findMany.mockResolvedValue([
      {
        id: 1,
        tier: 'PRO',
        duration: 'MONTH_1',
        price: 20,
        isEnabled: true,
        salePrice: 15,
        saleStartsAt: new Date(Date.now() - 1000),
        saleEndsAt: new Date(Date.now() + 1000),
        followUpCadence: 'WEEKLY',
        maxPlanEditsPerMonth: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.listPlans();
    expect(result[0].isOnSale).toBe(true);
    expect(result[0].effectivePrice).toBe(15);
  });
});

