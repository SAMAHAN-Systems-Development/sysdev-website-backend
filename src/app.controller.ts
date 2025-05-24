import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './auth/guards/jwt.guard';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('upload/:bucket')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('bucket') bucket: string,
  ): Promise<string> {
    if (!file) throw new Error('File is undefined');
    return (await this.appService.upload(file, bucket)).url;
  }
}
