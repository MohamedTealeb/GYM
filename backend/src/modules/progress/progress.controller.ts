import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { successResponse } from '../../common/utils/response';
import { CreateProgressDto } from './dto/create-progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Client adds progress (auto-links to current monthly plan)' })
  @ApiBody({ type: CreateProgressDto })
  @ApiResponse({ status: 201, description: 'Progress created' })
  @UseGuards(JwtAuthGuard)
  @Post('me')
  async createMy(@Req() req: { user: { id: number } }, @Body() dto: CreateProgressDto) {
    return successResponse(
      await this.progress.createForMe(req.user.id, dto),
      'Progress created',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Client lists my progress' })
  @ApiResponse({ status: 200, description: 'Progress retrieved' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async listMy(@Req() req: { user: { id: number } }) {
    return successResponse(await this.progress.listMyProgress(req.user.id), 'My progress');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trainer lists client progress for current month' })
  @ApiResponse({ status: 200, description: 'Client progress retrieved' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Get('clients/:clientId/current-month')
  async listClientCurrentMonth(@Param('clientId') clientId: string) {
    return successResponse(
      await this.progress.listClientCurrentMonthProgress(Number(clientId)),
      'Client progress',
    );
  }
}

