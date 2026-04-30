import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DatabaseRepository } from './database.repository';

export interface UserModel {
  id: number;
  email: string;
  password: string;
  role: string;
  fullName: string;
  phone: string;
  createdAt: Date;
  isActive?: boolean;
  otp?: string | null;
  otpExpires?: Date | null;
  profileImage?: string | null;
}

@Injectable()
export class UserRepository extends DatabaseRepository<UserModel> {
  protected readonly modelName = 'user' as const;

  constructor(protected override readonly prisma: PrismaService) {
    super(prisma);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.findOneBy('email', email.toLowerCase());
  }

  async findById(id: number): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: { id },
    }) as unknown as UserModel | null;
  }

  async create(data: {
    email: string;
    password: string;
    role?: 'CLIENT' | 'TRAINER';
    fullName: string;
    phone: string;
    isActive?: boolean;
    otp?: string | null;
    otpExpires?: Date | null;
    profileImage?: string | null;
  }): Promise<UserModel> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role ?? 'CLIENT',
        fullName: data.fullName,
        phone: data.phone,
        isActive: data.isActive ?? false,
        otp: data.otp ?? null,
        otpExpires: data.otpExpires ?? null,
        profileImage: data.profileImage ?? null,
      },
    }) as unknown as UserModel;
  }

  async setOtpByEmail(params: {
    email: string;
    otp: string | null;
    otpExpires: Date | null;
  }) {
    return this.prisma.user.update({
      where: { email: params.email.toLowerCase() },
      data: {
        otp: params.otp,
        otpExpires: params.otpExpires,
      },
    }) as unknown as UserModel;
  }

  async activateByEmail(email: string) {
    return this.prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        isActive: true,
        otp: null,
        otpExpires: null,
      },
    }) as unknown as UserModel;
  }

  async updatePasswordById(params: { id: number; password: string }) {
    return this.prisma.user.update({
      where: { id: params.id },
      data: { password: params.password },
    }) as unknown as UserModel;
  }
}
