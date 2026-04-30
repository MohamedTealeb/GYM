-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "saleEndsAt" TIMESTAMP(3),
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "saleStartsAt" TIMESTAMP(3);
