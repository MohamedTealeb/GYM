import { diskStorage } from 'multer';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

interface ICustomMulterFile extends Express.Multer.File {
  finalPath?: string;
}

export const localFileUpload = ({
  folder = 'public',
  validation = [],
  fileSize = 2,
}: {
  folder?: string;
  validation?: string[];
  fileSize?: number;
}): MulterOptions => {
  const basePath = `uploads/${folder}`;

  return {
    storage: diskStorage({
      destination(
        req: Request,
        file: Express.Multer.File,
        callback,
      ) {
        const fullPath = path.resolve(`./${basePath}`);

        if (!existsSync(fullPath)) {
          mkdirSync(fullPath, { recursive: true });
        }

        callback(null, fullPath);
      },

      filename(
        req: Request,
        file: ICustomMulterFile,
        callback,
      ) {
        const fileName = `${randomUUID()}_${Date.now()}_${file.originalname}`;

        file.finalPath = `${basePath}/${fileName}`;

        callback(null, fileName);
      },
    }),

    fileFilter(
      req: Request,
      file: ICustomMulterFile,
      callback,
    ) {
      if (validation.length === 0 || validation.includes(file.mimetype)) {
        return callback(null, true);
      }

      return callback(
        new BadRequestException('Invalid file type'),
        false,
      );
    },

    limits: {
      fileSize: fileSize * 1024 * 1024,
    },
  };
};