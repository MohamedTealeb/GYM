import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateProgressDto } from './dto/create-progress.dto';

function firstDayOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCurrentMonthlyPlanIdForUser(userId: number) {
    const monthStart = firstDayOfMonth();
    const plan = await this.prisma.monthlyPlan.findUnique({
      where: { clientId_monthStart: { clientId: userId, monthStart } },
      select: { id: true },
    });
    return plan?.id ?? null;
  }

  async createForMe(userId: number, dto: CreateProgressDto) {
    const monthlyPlanId = await this.getCurrentMonthlyPlanIdForUser(userId);
    return this.prisma.progress.create({
      data: {
        userId,
        monthlyPlanId,
        weight: dto.weight ?? null,
        notes: dto.notes ?? null,
      },
    });
  }

  async listMyProgress(userId: number) {
    return this.prisma.progress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listClientCurrentMonthProgress(clientId: number) {
    const monthStart = firstDayOfMonth();
    const nextMonth = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1, 0, 0, 0),
    );
    return this.prisma.progress.findMany({
      where: { userId: clientId, createdAt: { gte: monthStart, lt: nextMonth } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

