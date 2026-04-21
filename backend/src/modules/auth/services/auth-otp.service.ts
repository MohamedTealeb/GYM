import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../../common/mail/mail.service';
import { GenerateOtp } from '../../../common/utils/generate_otp';

@Injectable()
export class AuthOtpService {
  constructor(private readonly mailService: MailService) {}

  async generateOtpPayload() {
    const otp = GenerateOtp.generate();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = GenerateOtp.getExpiryDate();

    return { otp, otpHash, otpExpires };
  }

  async sendOtpEmail(to: string, otp: string) {
    await this.mailService.sendOtpEmail({ to, otp });
  }

  async assertOtpIsValid(params: {
    providedOtp: string;
    storedOtp: string | null | undefined;
    otpExpires: Date | null | undefined;
  }) {
    if (!params.storedOtp || !params.otpExpires) {
      throw new UnauthorizedException('OTP is not requested');
    }

    if (new Date(params.otpExpires).getTime() < Date.now()) {
      throw new UnauthorizedException('OTP expired');
    }

    const isValid = await bcrypt.compare(params.providedOtp, params.storedOtp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }
  }
}
