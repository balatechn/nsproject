import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadsService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    this.uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';
    this.baseUrl = config.get('S3_ENDPOINT', 'http://localhost:4000');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, uploadedBy: string, projectId?: string, taskId?: string) {
    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    const url = `${this.baseUrl}/uploads/${filename}`;

    return this.prisma.attachment.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        uploadedBy,
        projectId,
        taskId,
      },
    });
  }

  async getPresignedUrl(key: string) {
    return `${this.baseUrl}/uploads/${key}`;
  }
}

