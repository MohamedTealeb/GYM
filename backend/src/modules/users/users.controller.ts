import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { successResponse } from 'src/common/utils/response';

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
