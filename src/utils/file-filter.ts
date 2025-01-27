import { BadRequestException } from '@nestjs/common';

export enum MimeType {
  PNG = 'image/png',
  JPG = 'image/jpeg',
}

export const createFileFilter = (allowedMimeTypes: string[]) => {
  return (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
        ),
        false,
      );
    }
    cb(null, true);
  };
};
