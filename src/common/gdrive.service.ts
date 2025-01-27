import { Injectable } from '@nestjs/common';
import { drive_v3, google } from 'googleapis';
import * as fs from 'fs';

@Injectable()
export class GdriveService {
  private drive: drive_v3.Drive;
  constructor() {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString(
        'utf8',
      ),
    );

    // initialize the Google auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    // initialize the Google Drive client
    this.drive = google.drive({
      version: 'v3',
      auth: auth,
    });
  }

  async upload(file: Express.Multer.File, folderId: string) {
    try {
      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      };

      const response = await this.drive.files.create({
        requestBody: { name: file.filename, parents: [folderId] },
        media: media,
        fields: 'id',
      });

      return response.data;
    } catch (e) {
      throw new Error(e);
    }
  }

  async delete(fileId: string): Promise<void> {
    await this.drive.files.delete({ fileId });
  }
}
