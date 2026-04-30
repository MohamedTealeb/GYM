import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../common/database/repository/user.repository';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthTokenService } from './services/auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly authOtpService: AuthOtpService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async validateUserById(id: number) {
    if (!id) {
      return null;
    }

    const user = await this.users.findById(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async register(dto: RegisterDto, profileImage?: string | null) {
    const email = dto.email.toLowerCase();
    const existing = await this.users.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { otp, otpHash, otpExpires } =
      await this.authOtpService.generateOtpPayload();

    const createdUser = await this.users.create({
      email,
      password: hashedPassword,
      role: 'CLIENT',
      fullName: dto.fullName,
      phone: dto.phone,
      isActive: false,
      otp: otpHash,
      otpExpires,
      profileImage: profileImage ?? null,
    });

    await this.authOtpService.sendOtpEmail(createdUser.email, otp);

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        fullName: createdUser.fullName,
        phone: createdUser.phone,
        isActive: createdUser.isActive ?? false,
        profileImage: createdUser.profileImage ?? null,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email.toLowerCase());

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }
    return {
      accessToken: await this.authTokenService.signAccessToken(
        user.id,
        user.email,
        user.role,
      ),
    };
  }

  async verifyOtp(params: { email: string; otp: string }) {
    const email = params.email.toLowerCase();
    const user = await this.users.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');
    if (user.isActive) return { verified: true };

    await this.authOtpService.assertOtpIsValid({
      providedOtp: params.otp,
      storedOtp: user.otp,
      otpExpires: user.otpExpires,
    });

    await this.users.activateByEmail(email);
    return { verified: true };
  }

  async resendOtp(email: string) {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');
    if (user.isActive) return { verified: true };

    const { otp, otpHash, otpExpires } =
      await this.authOtpService.generateOtpPayload();

    await this.users.setOtpByEmail({ email, otp: otpHash, otpExpires });
    await this.authOtpService.sendOtpEmail(email, otp);

    return { otpResent: true, message: 'OTP resent successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');

    const { otp, otpHash, otpExpires } =
      await this.authOtpService.generateOtpPayload();

    await this.users.setOtpByEmail({ email, otp: otpHash, otpExpires });
    await this.authOtpService.sendOtpEmail(email, otp);

    return { otpSent: true, message: 'OTP sent successfully' };
  }

  async resetPassword(email: string, otp: string, password: string) {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');

    await this.authOtpService.assertOtpIsValid({
      providedOtp: otp,
      storedOtp: user.otp,
      otpExpires: user.otpExpires,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.users.updatePasswordById({ id: user.id, password: hashedPassword });
    await this.users.setOtpByEmail({ email, otp: null, otpExpires: null });
    return { passwordReset: true, message: 'Password reset successfully' };
  }
}
