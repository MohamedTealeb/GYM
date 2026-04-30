-- CreateEnum
CREATE TYPE "MonthlyPlanStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "MonthlyPlan" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "monthStart" TIMESTAMP(3) NOT NULL,
    "status" "MonthlyPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietPlan" (
    "id" SERIAL NOT NULL,
    "monthlyPlanId" INTEGER NOT NULL,
    "targetCalories" INTEGER,
    "proteinGrams" INTEGER,
    "carbsGrams" INTEGER,
    "fatGrams" INTEGER,
    "notes" TEXT,

    CONSTRAINT "DietPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanWorkout" (
    "id" SERIAL NOT NULL,
    "monthlyPlanId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dayOfWeek" INTEGER,
    "workoutDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanExercise" (
    "id" SERIAL NOT NULL,
    "planWorkoutId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "restSeconds" INTEGER,
    "notes" TEXT,

    CONSTRAINT "PlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyPlan_trainerId_idx" ON "MonthlyPlan"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPlan_clientId_monthStart_key" ON "MonthlyPlan"("clientId", "monthStart");

-- CreateIndex
CREATE UNIQUE INDEX "DietPlan_monthlyPlanId_key" ON "DietPlan"("monthlyPlanId");

-- CreateIndex
CREATE INDEX "PlanWorkout_monthlyPlanId_idx" ON "PlanWorkout"("monthlyPlanId");

-- CreateIndex
CREATE INDEX "PlanExercise_planWorkoutId_idx" ON "PlanExercise"("planWorkoutId");

-- AddForeignKey
ALTER TABLE "MonthlyPlan" ADD CONSTRAINT "MonthlyPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPlan" ADD CONSTRAINT "MonthlyPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "MonthlyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanWorkout" ADD CONSTRAINT "PlanWorkout_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES "MonthlyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExercise" ADD CONSTRAINT "PlanExercise_planWorkoutId_fkey" FOREIGN KEY ("planWorkoutId") REFERENCES "PlanWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
