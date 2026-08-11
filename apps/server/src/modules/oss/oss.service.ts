import path from 'path';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS, { type PutObjectResult } from 'ali-oss';

import { ConfigKeyPaths } from '@/config';
import { IOssConfig, ossRegToken } from '@/config/oss.config';

function assertSafeKey(key: string) {
  if (!key || !key.trim()) throw new BadRequestException('key 不能为空');
  if (key.includes('\\')) throw new BadRequestException('key 不合法');
  if (key.includes('..')) throw new BadRequestException('key 不合法');
  if (key.startsWith('/')) throw new BadRequestException('key 不合法');
}

function normalizeDir(dir?: string) {
  if (!dir) return '';
  const d = dir.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!d) return '';
  if (d.includes('..')) throw new BadRequestException('dir 不合法');
  return d;
}

@Injectable()
export class OssService {
  private readonly client: OSS;
  private readonly cfg: IOssConfig;

  constructor(private readonly configService: ConfigService<ConfigKeyPaths>) {
    const cfg = this.configService.get<IOssConfig>(ossRegToken, {
      infer: true,
    }) as IOssConfig | undefined;
    if (!cfg) throw new BadRequestException('OSS 配置缺失');
    this.cfg = cfg;

    if (
      !cfg.region ||
      !cfg.accessKeyId ||
      !cfg.accessKeySecret ||
      !cfg.bucket
    ) {
      throw new BadRequestException('OSS 环境变量未配置完整');
    }

    this.client = new OSS({
      region: cfg.region,
      accessKeyId: cfg.accessKeyId,
      accessKeySecret: cfg.accessKeySecret,
      bucket: cfg.bucket,
      endpoint: cfg.endpoint || undefined,
      secure: cfg.secure,
    });
  }

  async upload(file: Express.Multer.File, dir?: string) {
    if (!file) throw new BadRequestException('请上传文件');
    if (!file.originalname) throw new BadRequestException('文件名缺失');
    if (!file.buffer || !file.buffer.length)
      throw new BadRequestException('文件内容为空');

    const maxBytes = (this.cfg.maxFileSizeMB ?? 10) * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `文件过大，不能超过 ${this.cfg.maxFileSizeMB ?? 10} MB`,
      );
    }

    const allowedPrefixes = (this.cfg.allowedMimePrefixes || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowedPrefixes.length && file.mimetype) {
      const ok = allowedPrefixes.some((prefix) =>
        file.mimetype.startsWith(prefix),
      );
      if (!ok) {
        throw new BadRequestException(
          `不支持的文件类型：${file.mimetype || 'unknown'}`,
        );
      }
    }

    const safeDir = normalizeDir(dir ?? this.cfg.defaultDir);
    const ext = path.extname(file.originalname).slice(0, 16).toLowerCase();
    const today = new Date();
    const datePath = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('/');
    const randomPart = Math.random().toString(16).slice(2, 10);
    const baseName = `${today.getTime()}-${randomPart}`;
    const dirPath = [safeDir, datePath].filter(Boolean).join('/');
    const key = [dirPath, `${baseName}${ext}`].filter(Boolean).join('/');

    let result: PutObjectResult;
    try {
      result = await this.client.put(key, file.buffer, {
        mime: file.mimetype || undefined,
      });
    } catch {
      throw new InternalServerErrorException('文件上传失败，请稍后重试');
    }

    const publicUrl = this.cfg.publicBaseUrl
      ? `${this.cfg.publicBaseUrl.replace(/\/+$/g, '')}/${key}`
      : result.url;

    const etag =
      result.res?.headers && typeof result.res.headers === 'object'
        ? (result.res.headers as Record<string, string | undefined>).etag
        : undefined;

    return {
      key,
      url: publicUrl,
      mime: file.mimetype,
      size: file.size,
      originalName: file.originalname,
      etag,
    };
  }

  signUrl(key: string, expires?: number) {
    assertSafeKey(key);
    const exp = expires ?? this.cfg.signExpires ?? 600;
    return this.client.signatureUrl(key, { expires: exp });
  }

  async getStream(key: string): Promise<{
    stream: NodeJS.ReadableStream;
    res: { headers?: Record<string, string | string[] | undefined> };
  }> {
    assertSafeKey(key);
    const result = await this.client.getStream(key);
    return result as {
      stream: NodeJS.ReadableStream;
      res: { headers?: Record<string, string | string[] | undefined> };
    };
  }
}
