import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProgressDto {
  @ApiPropertyOptional({ example: 82.5, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number | null;

  @ApiPropertyOptional({ example: 'Felt good today', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

