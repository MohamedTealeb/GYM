import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { successResponse } from '../../common/utils/response';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

 

@ApiBearerAuth()
@ApiOperation({ summary: 'Get current user profile' })
@ApiResponse({
  status: 200,
  description: 'User profile retrieved successfully',
})
  @UseGuards(JwtAuthGuard)
  @Get('me')
  myProfile(@Req() req: { user: { id: number } }) {
    return successResponse(this.usersService.getProfile(req.user.id),"user profile retrieved successfully")
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List users (coach only)' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Get()
  async listUsers() {
    return successResponse(
      await this.usersService.listUsers(),
      'Users retrieved successfully',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Client dashboard (current plan + progress + photos) (coach only)' })
  @ApiResponse({
    status: 200,
    description: 'Client dashboard retrieved successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Get('clients/:id/dashboard')
  async clientDashboard(@Param('id') id: string) {
    return successResponse(
      await this.usersService.getClientDashboard(Number(id)),
      'Client dashboard',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by id (coach only)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return successResponse(
      await this.usersService.getUserById(Number(id)),
      'User retrieved successfully',
    );
  }

  @ApiBearerAuth()
@ApiOperation({ summary: 'update user profile' })
@ApiResponse({
  status: 200,
  description: 'User profile updated successfully',
})
@UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Req() req,@Body()dto:UpdateUserDto) {
    return successResponse(this.usersService.updateProfile(req.user.id,dto),"User profile updated successfully")
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
