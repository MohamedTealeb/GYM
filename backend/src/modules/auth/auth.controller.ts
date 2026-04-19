import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../common/database/prisma.service';
import { AuthService } from './auth.service';
import { CreateAuthDto, ForgotPasswordDto, LoginAuthDto, ResendOtpDto, ResetPasswordDto } from './dto/create-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { successResponse } from 'src/common/utils/response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateAuthDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @Post('register')
  async register(@Body() dto: CreateAuthDto) {
    return successResponse(await this.auth.register(dto), 'User registered successfully');
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @Post('login')
  async login(@Body() dto: LoginAuthDto) {
    return successResponse(await this.auth.login(dto), 'Login successful');
  }

  @ApiOperation({ summary: 'Verify OTP to activate account' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'Account verified successfully' })
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return successResponse(await this.auth.verifyOtp(dto), 'Account verified');
  }
  
  @ApiOperation({ summary: 'Resend OTP to activate account' })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return successResponse(await this.auth.resendOtp(dto.email), 'OTP resent successfully');
  }


  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return successResponse(await this.auth.forgotPassword(dto), 'OTP sent successfully');
  }
  
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return successResponse(await this.auth.resetPassword(dto.email, dto.otp , dto.password), 'Password reset successfully');
  }
}
