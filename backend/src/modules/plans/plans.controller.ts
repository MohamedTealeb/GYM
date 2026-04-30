import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { successResponse } from '../../common/utils/response';
import { CreateMonthlyPlanDto } from './dto/create-monthly-plan.dto';
import { UpdateMonthlyPlanDto } from './dto/update-monthly-plan.dto';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trainer creates monthly plan for a client' })
  @ApiBody({ type: CreateMonthlyPlanDto })
  @ApiResponse({ status: 201, description: 'Monthly plan created' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Post('clients/:clientId/monthly')
  async createForClient(
    @Req() req: { user: { id: number } },
    @Param('clientId') clientId: string,
    @Body() dto: CreateMonthlyPlanDto,
  ) {
    return successResponse(
      await this.plans.createMonthlyPlan(req.user.id, Number(clientId), dto),
      'Monthly plan created',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trainer publishes a monthly plan' })
  @ApiResponse({ status: 200, description: 'Monthly plan published' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Post(':id/publish')
  async publish(@Req() req: { user: { id: number } }, @Param('id') id: string) {
    return successResponse(
      await this.plans.publishMonthlyPlan(req.user.id, Number(id)),
      'Monthly plan published',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trainer updates a monthly plan (edit limit applies)' })
  @ApiBody({ type: UpdateMonthlyPlanDto })
  @ApiResponse({ status: 200, description: 'Monthly plan updated' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Patch(':id')
  async update(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() dto: UpdateMonthlyPlanDto,
  ) {
    return successResponse(
      await this.plans.updateMonthlyPlan(req.user.id, Number(id), dto),
      'Monthly plan updated',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Client gets current monthly plan' })
  @ApiResponse({ status: 200, description: 'Current plan' })
  @UseGuards(JwtAuthGuard)
  @Get('my/current')
  async myCurrent(@Req() req: { user: { id: number } }) {
    return successResponse(
      await this.plans.getMyCurrentPlan(req.user.id),
      'Current plan',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trainer gets current plan for a client' })
  @ApiResponse({ status: 200, description: 'Current plan for client' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Get('clients/:clientId/current')
  async clientCurrent(@Param('clientId') clientId: string) {
    return successResponse(
      await this.plans.getCurrentPlanForClient(Number(clientId)),
      'Current plan for client',
    );
  }
}

