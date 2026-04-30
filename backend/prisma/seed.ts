import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const plans = [
    // PLUS: monthly follow-up
    { tier: 'PLUS', duration: 'MONTH_1', price: 10, followUpCadence: 'MONTHLY' },
    { tier: 'PLUS', duration: 'MONTH_3', price: 25, followUpCadence: 'MONTHLY' },
    { tier: 'PLUS', duration: 'YEAR_1', price: 80, followUpCadence: 'MONTHLY' },

    // PRO: weekly follow-up
    { tier: 'PRO', duration: 'MONTH_1', price: 20, followUpCadence: 'WEEKLY' },
    { tier: 'PRO', duration: 'MONTH_3', price: 55, followUpCadence: 'WEEKLY' },
    { tier: 'PRO', duration: 'YEAR_1', price: 160, followUpCadence: 'WEEKLY' },

    // PREMIUM: daily follow-up
    { tier: 'PREMIUM', duration: 'MONTH_1', price: 35, followUpCadence: 'DAILY' },
    { tier: 'PREMIUM', duration: 'MONTH_3', price: 95, followUpCadence: 'DAILY' },
    { tier: 'PREMIUM', duration: 'YEAR_1', price: 280, followUpCadence: 'DAILY' },
  ] as const;

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { tier_duration: { tier: p.tier, duration: p.duration } },
      update: {
        price: p.price,
        followUpCadence: p.followUpCadence,
      },
      create: {
        tier: p.tier,
        duration: p.duration,
        price: p.price,
        followUpCadence: p.followUpCadence,
        maxPlanEditsPerMonth: p.tier === 'PLUS' ? 2 : p.tier === 'PRO' ? 8 : null,
      },
    });
  }

  // Example: keep seed file useful without forcing subscriptions on users.
  // console.log('Seeded subscription plans');
  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

