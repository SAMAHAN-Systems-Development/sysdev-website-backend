import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MinioService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: 'asia',
      endpoint: 'http://localhost:9000',
      forcePathStyle: true,
      credentials: {
        accessKeyId: 'minioadmin',
        secretAccessKey: 'minioadmin123',
      },
    });
  }
  async uploadObject(
    file: Express.Multer.File,
    bucket: string,
    key?: string,
  ): Promise<{ key: string; url: string }> {
    console.log(file);
    const objectKey = key || `${Date.now()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      }),
      { expiresIn: 3600 },
    );

    return { key: objectKey, url };
  }
  async getObjectUrl(bucket: string, key: string): Promise<string> {
    return await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      { expiresIn: 3600 },
    );
  }
}
