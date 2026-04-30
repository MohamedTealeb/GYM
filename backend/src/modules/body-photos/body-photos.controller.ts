import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { localFileUpload } from '../../common/utils/multer/local.multer';
import { FileValidation } from '../../common/utils/multer/validation.multer';
import { successResponse } from '../../common/utils/response';
import { CreateBodyPhotoDto } from './dto/create-body-photo.dto';
import { BodyPhotosService } from './body-photos.service';

@ApiTags('BodyPhotos')
@Controller('body-photos')
export class BodyPhotosController {
  constructor(private readonly bodyPhotos: BodyPhotosService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Client uploads body photo (auto-links to current monthly plan)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBodyPhotoDto })
  @ApiResponse({ status: 201, description: 'Body photo created' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'image',
      localFileUpload({
        folder: 'bodyPhotos',
        validation: FileValidation.image,
      }),
    ),
  )
  @Post('me')
  async uploadMy(
    @Req() req: { user: { id: number } },
    @Body() dto: CreateBodyPhotoDto,
    @UploadedFile() image?: Express.Multer.File & { finalPath?: string },
  ) {
    return successResponse(
      await this.bodyPhotos.addForMe(req.user.id, {
        imageUrl: image?.finalPath ?? '',
        note: dto.note ?? null,
      }),
      'Body photo created',
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Client lists my body photos' })
  @ApiResponse({ status: 200, description: 'Body photos retrieved' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async listMy(@Req() req: { user: { id: number } }) {
    return successResponse(await this.bodyPhotos.listMy(req.user.id), 'My body photos');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trainer lists client body photos for current month' })
  @ApiResponse({ status: 200, description: 'Client body photos retrieved' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @Get('clients/:clientId/current-month')
  async listClientCurrentMonth(@Param('clientId') clientId: string) {
    return successResponse(
      await this.bodyPhotos.listClientCurrentMonth(Number(clientId)),
      'Client body photos',
    );
  }
}

