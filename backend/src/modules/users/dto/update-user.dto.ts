import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;


    @ApiProperty({ example: 'mohamed' })
  @IsOptional()
  @IsString()
  fullName?: string;

    @ApiProperty({ example: '01091859210' })
  @IsOptional()
  @IsString()
  phone?:string


}
