import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { successResponse } from '../../common/utils/response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AssignSubscriptionDto } from './dto/assign-subscription.dto';
import { CreateSubscriptionPlanDto } from './dto/create-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-plan.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my active subscription' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async mySubscription(@Req() req: { user: { id: number } }) {
    return successResponse(
      await this.subscriptions.getMyActiveSubscription(req.user.id),
      'Subscription retrieved successfully',
    );
  }

  @ApiOperation({ summary: 'List subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  @Get('plans')
  async listPlans() {
    return successResponse(
      await this.subscriptions.listPlans(),
      'Plans retrieved successfully',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all subscription plans (trainer only)' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Get('plans/all')
  async listAllPlans() {
    return successResponse(
      await this.subscriptions.listPlans({ includeDisabled: true }),
      'Plans retrieved successfully',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription plan (trainer only)' })
  @ApiBody({ type: CreateSubscriptionPlanDto })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Post('plans')
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return successResponse(
      await this.subscriptions.createPlan(dto),
      'Plan created successfully',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription plan (trainer only)' })
  @ApiBody({ type: UpdateSubscriptionPlanDto })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Patch('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return successResponse(
      await this.subscriptions.updatePlan(Number(id), dto),
      'Plan updated successfully',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete subscription plan (trainer only)' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return successResponse(
      await this.subscriptions.deletePlan(Number(id)),
      'Plan deleted successfully',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign subscription to user (trainer only)' })
  @ApiBody({ type: AssignSubscriptionDto })
  @ApiResponse({ status: 201, description: 'Subscription assigned successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Post('assign')
  async assign(@Body() dto: AssignSubscriptionDto) {
    return successResponse(
      await this.subscriptions.assignSubscription(dto),
      'Subscription assigned successfully',
    );
  }
}

