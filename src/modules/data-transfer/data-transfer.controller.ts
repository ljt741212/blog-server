import * as os from 'os';
import { extname } from 'path';

import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';

import { Bypass, JwtAuthGuard, SuperAdminGuard } from '@/common';

import { DataTransferService } from './data-transfer.service';

import type { Response } from 'express';

@Controller('data-transfer')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class DataTransferController {
  constructor(private readonly dataTransferService: DataTransferService) {}

  @Get('export')
  @Bypass()
  exportAll(@Res() res: Response) {
    return this.dataTransferService.exportAllToZip(res);
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => cb(null, os.tmpdir()),
        filename: (req, file, cb) => {
          const suffix = extname(file.originalname || '') || '.zip';
          cb(null, `data-import-${Date.now()}${suffix}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB
      },
    }),
  )
  async importAll(
    @UploadedFile()
    file?: Express.Multer.File,
    @Query('mode') mode?: 'truncate',
  ) {
    if (!file?.path) throw new BadRequestException('缺少上传文件 file');
    if (mode && mode !== 'truncate') {
      throw new BadRequestException('mode 仅支持 truncate');
    }
    return this.dataTransferService.importAllFromZip(file.path, {
      mode: mode ?? 'truncate',
    });
  }
}
