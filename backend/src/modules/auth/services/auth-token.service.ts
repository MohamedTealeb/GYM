import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: number;
  email?: string;
  role?: string;
}

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async signAccessToken(userId: number, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload);
  }
}
