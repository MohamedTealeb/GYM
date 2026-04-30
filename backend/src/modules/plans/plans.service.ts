import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { MonthlyPlanStatus } from '@prisma/client';
import { CreateMonthlyPlanDto } from './dto/create-monthly-plan.dto';
import { UpdateMonthlyPlanDto } from './dto/update-monthly-plan.dto';

function firstDayOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
}

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  private async getClientActiveSubscription(clientId: number) {
    return this.prisma.userSubscription.findFirst({
      where: {
        userId: clientId,
        status: 'ACTIVE',
        endsAt: { gt: new Date() },
      },
      orderBy: { startsAt: 'desc' },
      include: { plan: true },
    });
  }

  private async assertClientHasActiveSubscription(clientId: number) {
    const active = await this.getClientActiveSubscription(clientId);
    if (!active) throw new ForbiddenException('Client has no active subscription');
    return active;
  }

  private async assertTrainerCanEditPlan(trainerUserId: number, planId: number) {
    const plan = await this.prisma.monthlyPlan.findUnique({
      where: { id: planId },
      select: { id: true, trainerId: true, clientId: true, monthStart: true },
    });
    if (!plan) throw new NotFoundException('Monthly plan not found');
    if (plan.trainerId !== trainerUserId) throw new ForbiddenException('Not your plan');
    return plan;
  }

  private async assertEditLimitNotExceeded(params: {
    planId: number;
    clientId: number;
    monthStart: Date;
  }) {
    const sub = await this.getClientActiveSubscription(params.clientId);
    const limit = sub?.plan?.maxPlanEditsPerMonth;
    if (!limit) return; // null/undefined => unlimited

    const monthEnd = new Date(Date.UTC(
      params.monthStart.getUTCFullYear(),
      params.monthStart.getUTCMonth() + 1,
      1,
      0,
      0,
      0,
    ));

    const editsCount = await this.prisma.monthlyPlanEdit.count({
      where: {
        monthlyPlanId: params.planId,
        createdAt: {
          gte: params.monthStart,
          lt: monthEnd,
        },
      },
    });

    if (editsCount >= limit) {
      throw new ForbiddenException('Monthly plan edit limit reached for this subscription');
    }
  }

  async createMonthlyPlan(trainerUserId: number, clientId: number, dto: CreateMonthlyPlanDto) {
    await this.assertClientHasActiveSubscription(clientId);

    const monthStart = dto.monthStart ? new Date(dto.monthStart) : firstDayOfMonth();

    const existing = await this.prisma.monthlyPlan.findUnique({
      where: { clientId_monthStart: { clientId, monthStart } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Monthly plan already exists for this client and month');
    }

    // Create plan with optional nested diet + workouts/exercises
    return this.prisma.monthlyPlan.create({
      data: {
        clientId,
        trainerId: trainerUserId,
        monthStart,
        status: 'DRAFT',
        diet: dto.diet
          ? {
              create: {
                targetCalories: dto.diet.targetCalories ?? null,
                proteinGrams: dto.diet.proteinGrams ?? null,
                carbsGrams: dto.diet.carbsGrams ?? null,
                fatGrams: dto.diet.fatGrams ?? null,
                notes: dto.diet.notes ?? null,
              },
            }
          : undefined,
        workouts: dto.workouts?.length
          ? {
              create: dto.workouts.map((w) => ({
                title: w.title,
                description: w.description ?? null,
                dayOfWeek: w.dayOfWeek ?? null,
                workoutDate: w.workoutDate ? new Date(w.workoutDate) : null,
                exercises: {
                  create: w.exercises.map((e) => ({
                    name: e.name,
                    sets: e.sets,
                    reps: e.reps,
                    restSeconds: e.restSeconds ?? null,
                    notes: e.notes ?? null,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: {
        diet: true,
        workouts: { include: { exercises: true } },
      },
    });
  }

  async publishMonthlyPlan(trainerUserId: number, planId: number) {
    const plan = await this.prisma.monthlyPlan.findUnique({
      where: { id: planId },
      select: { id: true, trainerId: true },
    });
    if (!plan) throw new NotFoundException('Monthly plan not found');
    if (plan.trainerId !== trainerUserId) throw new ForbiddenException('Not your plan');

    return this.prisma.monthlyPlan.update({
      where: { id: planId },
      data: { status: 'PUBLISHED' satisfies MonthlyPlanStatus },
      include: { diet: true, workouts: { include: { exercises: true } } },
    });
  }

  async updateMonthlyPlan(trainerUserId: number, planId: number, dto: UpdateMonthlyPlanDto) {
    const plan = await this.assertTrainerCanEditPlan(trainerUserId, planId);
    await this.assertClientHasActiveSubscription(plan.clientId);
    await this.assertEditLimitNotExceeded({
      planId: plan.id,
      clientId: plan.clientId,
      monthStart: plan.monthStart,
    });

    return this.prisma.$transaction(async (tx) => {
      // Diet upsert if provided
      if (dto.diet) {
        await tx.dietPlan.upsert({
          where: { monthlyPlanId: plan.id },
          create: {
            monthlyPlanId: plan.id,
            targetCalories: dto.diet.targetCalories ?? null,
            proteinGrams: dto.diet.proteinGrams ?? null,
            carbsGrams: dto.diet.carbsGrams ?? null,
            fatGrams: dto.diet.fatGrams ?? null,
            notes: dto.diet.notes ?? null,
          },
          update: {
            targetCalories: dto.diet.targetCalories ?? null,
            proteinGrams: dto.diet.proteinGrams ?? null,
            carbsGrams: dto.diet.carbsGrams ?? null,
            fatGrams: dto.diet.fatGrams ?? null,
            notes: dto.diet.notes ?? null,
          },
        });
      }

      // Replace workouts if provided
      if (dto.workouts) {
        await tx.planWorkout.deleteMany({ where: { monthlyPlanId: plan.id } });
        if (dto.workouts.length) {
          for (const w of dto.workouts) {
            await tx.planWorkout.create({
              data: {
                monthlyPlanId: plan.id,
                title: w.title,
                description: w.description ?? null,
                dayOfWeek: w.dayOfWeek ?? null,
                workoutDate: w.workoutDate ? new Date(w.workoutDate) : null,
                exercises: {
                  create: w.exercises.map((e) => ({
                    name: e.name,
                    sets: e.sets,
                    reps: e.reps,
                    restSeconds: e.restSeconds ?? null,
                    notes: e.notes ?? null,
                  })),
                },
              },
            });
          }
        }
      }

      await tx.monthlyPlanEdit.create({
        data: { monthlyPlanId: plan.id, trainerId: trainerUserId },
      });

      return tx.monthlyPlan.findUnique({
        where: { id: plan.id },
        include: { diet: true, workouts: { include: { exercises: true } } },
      });
    });
  }

  async getCurrentPlanForClient(clientId: number) {
    const monthStart = firstDayOfMonth();
    return this.prisma.monthlyPlan.findUnique({
      where: { clientId_monthStart: { clientId, monthStart } },
      include: { diet: true, workouts: { include: { exercises: true } } },
    });
  }

  async getMyCurrentPlan(userId: number) {
    return this.getCurrentPlanForClient(userId);
  }
}

