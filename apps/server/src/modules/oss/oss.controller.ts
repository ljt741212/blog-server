import {
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

import { JwtAuthGuard } from '@/common';

import { SignUrlQueryDto, UploadQueryDto } from './dto/oss.dto';
import { OssService } from './oss.service';

import type { Response } from 'express';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadQueryDto,
  ) {
    return this.ossService.upload(file, query.dir);
  }

  @Get('sign-url')
  @UseGuards(JwtAuthGuard)
  signUrl(@Query() query: SignUrlQueryDto) {
    return {
      url: this.ossService.signUrl(query.key, query.expires),
    };
  }

  @Get('download')
  @UseGuards(JwtAuthGuard)
  async download(@Query('key') key: string, @Res() res: Response) {
    const result = await this.ossService.getStream(key);

    const contentType =
      (result.res?.headers && (result.res.headers['content-type'] as string)) ||
      'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(
        key.split('/').pop() || 'file',
      )}"`,
    );

    result.stream.pipe(res);
  }
}
