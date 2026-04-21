import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { successResponse } from '../../common/utils/response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return successResponse(await this.auth.register(dto), 'User registered successfully');
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @Post('login')
  async login(@Body() dto: LoginDto) {
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
