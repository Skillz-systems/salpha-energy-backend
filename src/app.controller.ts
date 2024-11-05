import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('test-upload')
  async testCloudinaryUpload(@UploadedFile() file: Express.Multer.File) {
    return await this.appService.testUpload(file);
  }
}
