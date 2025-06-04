import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  private s3: S3Client;

  constructor(private readonly configService: ConfigService) {
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
    const objectKey = key || `${Date.now()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    const minioPublicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');

    const url = `${minioPublicUrl}/${bucket}/${objectKey}`;

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
  async deleteObjectFromUrl(url: string): Promise<void> {
    const minioPublicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');

    if (!url.startsWith(minioPublicUrl)) {
      throw new Error('Invalid MinIO URL');
    }

    const relativePath = url.replace(`${minioPublicUrl}/`, '');
    const [bucket, ...keyParts] = relativePath.split('/');
    const key = keyParts.join('/');

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }
}
