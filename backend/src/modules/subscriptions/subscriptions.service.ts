import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { FollowUpCadence, PlanDuration, PlanTier } from '@prisma/client';

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function computeEndsAt(startsAt: Date, duration: PlanDuration) {
  switch (duration) {
    case 'MONTH_1':
      return addMonths(startsAt, 1);
    case 'MONTH_3':
      return addMonths(startsAt, 3);
    case 'YEAR_1':
      return addYears(startsAt, 1);
    default:
      return addMonths(startsAt, 1);
  }
}

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private isSaleActive(plan: {
    salePrice: number | null;
    saleStartsAt: Date | null;
    saleEndsAt: Date | null;
  }) {
    if (!plan.salePrice) return false;
    const now = Date.now();
    if (plan.saleStartsAt && plan.saleStartsAt.getTime() > now) return false;
    if (plan.saleEndsAt && plan.saleEndsAt.getTime() < now) return false;
    return true;
  }

  async listPlans(options?: { includeDisabled?: boolean }) {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: options?.includeDisabled ? undefined : { isEnabled: true },
      orderBy: [{ tier: 'asc' }, { duration: 'asc' }],
    });

    return plans.map((p) => ({
      ...p,
      effectivePrice: this.isSaleActive(p) ? p.salePrice : p.price,
      isOnSale: this.isSaleActive(p),
    }));
  }

  async getMyActiveSubscription(userId: number) {
    const sub = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endsAt: { gt: new Date() },
      },
      orderBy: { startsAt: 'desc' },
      include: { plan: true },
    });

    if (!sub) {
      return null;
    }

    return {
      ...sub,
      plan: {
        ...sub.plan,
        effectivePrice: this.isSaleActive(sub.plan)
          ? sub.plan.salePrice
          : sub.plan.price,
        isOnSale: this.isSaleActive(sub.plan),
      },
    };
  }

  async createPlan(data: {
    tier: PlanTier;
    duration: PlanDuration;
    price: number;
    followUpCadence: FollowUpCadence;
    maxPlanEditsPerMonth?: number | null;
    isEnabled?: boolean;
    salePrice?: number | null;
    saleStartsAt?: string | null;
    saleEndsAt?: string | null;
  }) {
    if (data.salePrice != null && data.salePrice > data.price) {
      throw new ConflictException('Sale price must be less than or equal to price');
    }
    try {
      return await this.prisma.subscriptionPlan.create({
        data: {
          tier: data.tier,
          duration: data.duration,
          price: data.price,
          isEnabled: data.isEnabled ?? true,
          salePrice: data.salePrice ?? null,
          saleStartsAt: data.saleStartsAt ? new Date(data.saleStartsAt) : null,
          saleEndsAt: data.saleEndsAt ? new Date(data.saleEndsAt) : null,
          followUpCadence: data.followUpCadence,
          maxPlanEditsPerMonth: data.maxPlanEditsPerMonth ?? null,
        },
      });
    } catch (e: any) {
      // unique(tier,duration)
      if (e?.code === 'P2002') {
        throw new ConflictException('Plan with same tier and duration already exists');
      }
      throw e;
    }
  }

  async updatePlan(planId: number, data: Partial<{
    tier: PlanTier;
    duration: PlanDuration;
    price: number;
    isEnabled: boolean;
    salePrice: number | null;
    saleStartsAt: string | null;
    saleEndsAt: string | null;
    followUpCadence: FollowUpCadence;
    maxPlanEditsPerMonth: number | null;
  }>) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Subscription plan not found');

    const price =
      data.price ??
      (
        await this.prisma.subscriptionPlan.findUnique({
          where: { id: planId },
          select: { price: true },
        })
      )?.price;
    if (price != null && data.salePrice != null && data.salePrice > price) {
      throw new ConflictException('Sale price must be less than or equal to price');
    }

    try {
      return await this.prisma.subscriptionPlan.update({
        where: { id: planId },
        data: {
          tier: data.tier,
          duration: data.duration,
          price: data.price,
          isEnabled: data.isEnabled,
          salePrice: data.salePrice,
          saleStartsAt: data.saleStartsAt ? new Date(data.saleStartsAt) : undefined,
          saleEndsAt: data.saleEndsAt ? new Date(data.saleEndsAt) : undefined,
          followUpCadence: data.followUpCadence,
          maxPlanEditsPerMonth: data.maxPlanEditsPerMonth,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Plan with same tier and duration already exists');
      }
      throw e;
    }
  }

  async deletePlan(planId: number) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Subscription plan not found');

    return this.prisma.subscriptionPlan.delete({
      where: { id: planId },
    });
  }

  async assignSubscription(params: { userId: number; planId: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: params.planId },
    });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    if (!plan.isEnabled) throw new ConflictException('Subscription plan is disabled');

    const startsAt = new Date();
    const endsAt = computeEndsAt(startsAt, plan.duration);

    const result = await this.prisma.$transaction(async (tx) => {
      // Expire any active subscription for this user
      await tx.userSubscription.updateMany({
        where: { userId: user.id, status: 'ACTIVE' },
        data: { status: 'EXPIRED', endsAt: startsAt },
      });

      const created = await tx.userSubscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          startsAt,
          endsAt,
          status: 'ACTIVE',
        },
        include: { plan: true },
      });

      return created;
    });

    return result;
  }
}

