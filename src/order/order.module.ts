import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './public',
        filename: (_req, file, cb) => {
          // get the file extension
          const ext = path.extname(file.originalname);
          const fileName = uuid() + ext;

          cb(null, fileName);
        },
      }),
    }),
  ],
})
export class OrderModule {}
