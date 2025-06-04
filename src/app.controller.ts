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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('App')
@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Used for Testing',
    description: 'a simple request to process if backend is running properly',
  })
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('upload/:bucket')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload Image',
    description: 'a simple request to test if uploading image works',
  })
  @ApiParam({
    name: 'bucket',
    description: 'Bucket name that is saved in Minio storage',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Successful retrieval of users.' })
  @UseGuards(JwtAuthGuard)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('bucket') bucket: string,
  ): Promise<string> {
    if (!file) throw new Error('File is undefined');
    return (await this.appService.upload(file, bucket)).url;
  }
}
