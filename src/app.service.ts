import { Injectable } from '@nestjs/common';
import { MinioService } from './minio/minio.service';

@Injectable()
export class AppService {
  constructor(private readonly minioService: MinioService) {}
  getHello(): string {
    return 'Hello World!';
  }

  upload(file: Express.Multer.File, bucket: string) {
    return this.minioService.uploadObject(file, bucket);
  }
}
