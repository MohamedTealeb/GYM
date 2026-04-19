import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../common/database/repository/user.repository';
import { GenerateOtp } from '../../common/utils/generate_otp';
import { MailService } from '../../common/mail/mail.service';
import { CreateAuthDto, ForgotPasswordDto, LoginAuthDto } from './dto/create-auth.dto';

export interface JwtPayload {
  sub: number;
  email?: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUserById(id: number) {
    return id ? { id } : null;
  }

  async register(dto: CreateAuthDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.users.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otp = GenerateOtp.generate();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = GenerateOtp.getExpiryDate();

    const createdUser = await this.users.create({
      email,
      password: hashedPassword,
      role: 'CLIENT',
      fullName: dto.fullName,
      phone: dto.phone,
      isActive: false,
      otp: otpHash,
      otpExpires,
    });

    await this.mailService.sendOtpEmail({ to: createdUser.email, otp });

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        fullName: createdUser.fullName,
        phone: createdUser.phone,
        isActive: createdUser.isActive ?? false,
      },
    };
  }

  async login(dto: LoginAuthDto) {
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
      accessToken: await this.signToken(user.id, user.email, user.role),
    };
  }

  async verifyOtp(params: { email: string; otp: string }) {
    const email = params.email.toLowerCase();
    const user = await this.users.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');
    if (user.isActive) return { verified: true };

    if (!user.otp || !user.otpExpires) {
      throw new UnauthorizedException('OTP is not requested');
    }

    if (new Date(user.otpExpires).getTime() < Date.now()) {
      throw new UnauthorizedException('OTP expired');
    }

    const ok = await bcrypt.compare(params.otp, user.otp);
    if (!ok) throw new UnauthorizedException('Invalid OTP');

    await this.users.activateByEmail(email);
    return { verified: true };
  }
  async resendOtp(email: string) {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');
    if (user.isActive) return { verified: true };
    const otp = GenerateOtp.generate();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = GenerateOtp.getExpiryDate();
    await this.users.setOtpByEmail({ email, otp: otpHash, otpExpires });
    await this.mailService.sendOtpEmail({ to: email, otp });
    return { otpResent: true, message: 'OTP resent successfully' }; 
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');
    const otp = GenerateOtp.generate();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = GenerateOtp.getExpiryDate();
    await this.users.setOtpByEmail({ email, otp: otpHash, otpExpires });
    await this.mailService.sendOtpEmail({ to: email, otp });
    return { otpSent: true, message: 'OTP sent successfully' };
  }
  async resetPassword(email: string, otp: string, password: string) {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');
    if (!user.otp) throw new UnauthorizedException('OTP is not requested');
    if (user.otpExpires && new Date(user.otpExpires).getTime() < Date.now()) {
      throw new UnauthorizedException('OTP expired');
    }
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) throw new UnauthorizedException('Invalid OTP');
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.users.updatePasswordById({ id: user.id, password: hashedPassword });
    await this.users.setOtpByEmail({ email, otp: null, otpExpires: null });
    return { passwordReset: true, message: 'Password reset successfully' };
  }
 
  private async signToken(userId: number, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload);
  }
}
