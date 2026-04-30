import { PartialType } from '@nestjs/swagger';
import { CreateMonthlyPlanDto } from './create-monthly-plan.dto';

export class UpdateMonthlyPlanDto extends PartialType(CreateMonthlyPlanDto) {}

