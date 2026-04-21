import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1, { message: 'Full name is required' })
  fullName!: string;

  @ApiProperty({ example: '+2348123456789' })
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number' })
  phone!: string;
}
