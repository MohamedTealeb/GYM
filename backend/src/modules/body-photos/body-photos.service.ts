import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

function firstDayOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
}

@Injectable()
export class BodyPhotosService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCurrentMonthlyPlanIdForUser(userId: number) {
    const monthStart = firstDayOfMonth();
    const plan = await this.prisma.monthlyPlan.findUnique({
      where: { clientId_monthStart: { clientId: userId, monthStart } },
      select: { id: true },
    });
    return plan?.id ?? null;
  }

  async addForMe(userId: number, params: { imageUrl: string; note?: string | null }) {
    const monthlyPlanId = await this.getCurrentMonthlyPlanIdForUser(userId);
    return this.prisma.bodyPhoto.create({
      data: {
        userId,
        monthlyPlanId,
        imageUrl: params.imageUrl,
        note: params.note ?? null,
      },
    });
  }

  async listMy(userId: number) {
    return this.prisma.bodyPhoto.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listClientCurrentMonth(clientId: number) {
    const monthStart = firstDayOfMonth();
    const nextMonth = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1, 0, 0, 0),
    );
    return this.prisma.bodyPhoto.findMany({
      where: { userId: clientId, createdAt: { gte: monthStart, lt: nextMonth } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

