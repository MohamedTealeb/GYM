-- CreateTable
CREATE TABLE "MonthlyPlanEdit" (
    "id" SERIAL NOT NULL,
    "monthlyPlanId" INTEGER NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyPlanEdit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyPlanEdit_monthlyPlanId_idx" ON "MonthlyPlanEdit"("monthlyPlanId");

-- CreateIndex
CREATE INDEX "MonthlyPlanEdit_trainerId_idx" ON "MonthlyPlanEdit"("trainerId");

-- CreateIndex
CREATE INDEX "MonthlyPlanEdit_createdAt_idx" ON "MonthlyPlanEdit"("createdAt");

-- AddForeignKey
ALTER TABLE "MonthlyPlanEdit" ADD CONSTRAINT "MonthlyPlanEdit_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "MonthlyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPlanEdit" ADD CONSTRAINT "MonthlyPlanEdit_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
