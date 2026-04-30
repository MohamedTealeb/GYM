import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../common/database/prisma.service';

function firstDayOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        profileImage: true,
        createdAt: true,
      },
    });
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        role: true,
        phone: true,
        fullName: true,
        profileImage: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
 
  async updateProfile(userId:number,updateProfile:UpdateUserDto){
    const data:any={...updateProfile}

      return this.prisma.user.update({
    where: { id: userId },
    data,
  });
  }

  async getClientDashboard(clientId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        profileImage: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const monthStart = firstDayOfMonth();
    const nextMonth = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1, 0, 0, 0),
    );

    const [subscription, currentPlan, progress, bodyPhotos] = await Promise.all([
      this.prisma.userSubscription.findFirst({
        where: {
          userId: clientId,
          status: 'ACTIVE',
          endsAt: { gt: new Date() },
        },
        orderBy: { startsAt: 'desc' },
        include: { plan: true },
      }),
      this.prisma.monthlyPlan.findUnique({
        where: { clientId_monthStart: { clientId, monthStart } },
        include: { diet: true, workouts: { include: { exercises: true } } },
      }),
      this.prisma.progress.findMany({
        where: { userId: clientId, createdAt: { gte: monthStart, lt: nextMonth } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bodyPhoto.findMany({
        where: { userId: clientId, createdAt: { gte: monthStart, lt: nextMonth } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const isOnSale = (plan: {
      salePrice: number | null;
      saleStartsAt: Date | null;
      saleEndsAt: Date | null;
    }) => {
      if (!plan.salePrice) return false;
      const now = Date.now();
      if (plan.saleStartsAt && plan.saleStartsAt.getTime() > now) return false;
      if (plan.saleEndsAt && plan.saleEndsAt.getTime() < now) return false;
      return true;
    };

    const subscriptionWithEffective =
      subscription && subscription.plan
        ? {
            ...subscription,
            plan: {
              ...subscription.plan,
              effectivePrice: isOnSale(subscription.plan)
                ? subscription.plan.salePrice
                : subscription.plan.price,
              isOnSale: isOnSale(subscription.plan),
            },
          }
        : null;

    return {
      user,
      monthStart,
      subscription: subscriptionWithEffective,
      currentPlan,
      progress,
      bodyPhotos,
    };
  }
 


  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
