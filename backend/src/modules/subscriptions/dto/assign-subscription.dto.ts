import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AssignSubscriptionDto {
  @ApiProperty({ example: 1, description: 'Client user id' })
  @IsInt()
  @Min(1)
  userId!: number;

  @ApiProperty({ example: 1, description: 'SubscriptionPlan id' })
  @IsInt()
  @Min(1)
  planId!: number;
}

