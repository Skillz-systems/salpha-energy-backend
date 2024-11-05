import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class AppService {
  constructor(private cloudinary: CloudinaryService) {}

  getHello(): string {
    return 'Welcom to A4t!';
  }

  async testUpload(file: Express.Multer.File) {
    return await this.cloudinary.uploadFile(file).catch((e) => {
      console.log(e);

      throw new BadRequestException('Invalid file type.');
    });
  }
}
