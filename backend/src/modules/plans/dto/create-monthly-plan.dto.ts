import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DietDto {
  @ApiPropertyOptional({ example: 2200, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetCalories?: number | null;

  @ApiPropertyOptional({ example: 140, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  proteinGrams?: number | null;

  @ApiPropertyOptional({ example: 220, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  carbsGrams?: number | null;

  @ApiPropertyOptional({ example: 60, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  fatGrams?: number | null;

  @ApiPropertyOptional({ example: 'No sugary drinks', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

class PlanExerciseDto {
  @ApiProperty({ example: 'Bench press' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  sets!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  reps!: number;

  @ApiPropertyOptional({ example: 90, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  restSeconds?: number | null;

  @ApiPropertyOptional({ example: 'Keep form strict', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

class PlanWorkoutDto {
  @ApiProperty({ example: 'Push day' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Warm up first', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 1, description: '0..6', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  dayOfWeek?: number | null;

  @ApiPropertyOptional({ example: '2026-05-01T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  workoutDate?: string | null;

  @ApiProperty({ type: [PlanExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanExerciseDto)
  exercises!: PlanExerciseDto[];
}

export class CreateMonthlyPlanDto {
  @ApiPropertyOptional({
    example: '2026-05-01T00:00:00.000Z',
    description: 'Defaults to first day of current month',
  })
  @IsOptional()
  @IsDateString()
  monthStart?: string;

  @ApiPropertyOptional({ type: DietDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DietDto)
  diet?: DietDto;

  @ApiPropertyOptional({ type: [PlanWorkoutDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanWorkoutDto)
  workouts?: PlanWorkoutDto[];
}

