import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FollowUpCadence, PlanDuration, PlanTier } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ enum: PlanTier, example: 'PRO' })
  @IsEnum(PlanTier)
  tier!: PlanTier;

  @ApiProperty({ enum: PlanDuration, example: 'MONTH_1' })
  @IsEnum(PlanDuration)
  duration!: PlanDuration;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ example: 15, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number | null;

  @ApiPropertyOptional({ example: '2026-05-01T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  saleStartsAt?: string | null;

  @ApiPropertyOptional({ example: '2026-05-07T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  saleEndsAt?: string | null;

  @ApiProperty({ enum: FollowUpCadence, example: 'WEEKLY' })
  @IsEnum(FollowUpCadence)
  followUpCadence!: FollowUpCadence;

  @ApiPropertyOptional({ example: 8, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxPlanEditsPerMonth?: number | null;
}

