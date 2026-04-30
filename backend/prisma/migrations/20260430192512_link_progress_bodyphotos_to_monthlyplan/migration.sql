-- AlterTable
ALTER TABLE "BodyPhoto" ADD COLUMN     "monthlyPlanId" INTEGER;

-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "monthlyPlanId" INTEGER;

-- CreateIndex
CREATE INDEX "BodyPhoto_monthlyPlanId_idx" ON "BodyPhoto"("monthlyPlanId");

-- CreateIndex
CREATE INDEX "Progress_monthlyPlanId_idx" ON "Progress"("monthlyPlanId");

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "MonthlyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyPhoto" ADD CONSTRAINT "BodyPhoto_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "MonthlyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
