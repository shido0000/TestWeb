import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private client: Minio.Client;
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = process.env.MINIO_BUCKET || 'testhub-storage';

  async onModuleInit() {
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    // Ensure bucket exists
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
      this.logger.log(`📦 Created bucket: ${this.bucket}`);
    }
  }

  async upload(key: string, data: Buffer, contentType: string): Promise<string> {
    await this.client.putObject(this.bucket, key, data, data.length, { 'Content-Type': contentType });
    return `/${this.bucket}/${key}`;
  }

  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expires);
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}
