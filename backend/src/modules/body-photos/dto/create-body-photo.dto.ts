import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsOptional, IsString } from 'class-validator';

export class CreateBodyPhotoDto {
  @ApiPropertyOptional({ example: 'front view', nullable: true })
  @IsOptional()
  @IsString()
  note?: string | null;

  // multipart field `image` handled by @UploadedFile()
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  @Allow()
  image?: unknown;
}

